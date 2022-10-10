import { z } from "zod";
import { Base64 } from "js-base64";
import * as uint8arrays from "uint8arrays";
import { TileLoader } from "@glazed/tile-loader";
import { aql } from "arangojs";
import { WalletAliases } from "@usher.so/datamodels";
import { TileDocument } from "@ceramicnetwork/stream-tile";
// import ono from "@jsdevtools/ono";
import uniq from "lodash/uniq";

import {
	AuthApiRequest,
	Campaign,
	CampaignReference,
	Chains,
	Claim,
	PartnershipMetrics,
	RewardTypes
} from "@/types";
import { useRouteHandler } from "@/server/middleware";
import { getAppDID } from "@/server/did";
import { ceramic } from "@/utils/ceramic-client";
import { getArangoClient } from "@/utils/arango-client";
import withAuth from "@/server/middleware/auth";
import { getArweaveClient, getWarp } from "@/utils/arweave-client";
import {
	FEE_MULTIPLIER,
	FEE_ARWEAVE_WALLET,
	FEE_ETHEREUM_WALLET,
	ARWEAVE_EXPLORER_TX_URL,
	ETHEREUM_EXPLORER_TX_URL
} from "@/constants";
import handleException from "@/utils/handle-exception";
import { appPackageName, appVersion } from "@/env-config";
import { getEthereumClient } from "@/utils/ethereum-client";
import { BigNumber, ethers, Wallet } from "ethers";
import { indexClaim } from "@/server/claim";
import { erc20 } from "@/abi/erc20";

const handler = useRouteHandler<AuthApiRequest>();

const schema = z.object({
	partnership: z.union([z.string(), z.string().array()]),
	to: z.string()
});

const loader = new TileLoader({ ceramic });

const arango = getArangoClient();

const isPartnershipStreamValid = (stream: TileDocument<CampaignReference>) => {
	return (
		stream.content.address &&
		stream.content.chain &&
		stream.controllers.length > 0 &&
		stream.metadata.schema === WalletAliases.schemas.Partnership
	);
};

/**
 * POST: Perform the Crypto Transfer based on the Campaign
 */
handler.router.use(withAuth).post(async (req, res) => {
	let body: z.infer<typeof schema>;
	try {
		body = await schema.parseAsync(req.body);
	} catch (e) {
		return res.status(400).json({
			success: false
		});
	}
	const { partnership: partnershipParam, to } = body;
	const partnerships = Array.isArray(partnershipParam)
		? uniq(partnershipParam)
		: [partnershipParam];

	// Get campaign from partnership
	const streams = await Promise.all(
		partnerships.map((p) => loader.load<CampaignReference>(p))
	);
	for (let i = 0; i < streams.length; i += 1) {
		const stream = streams[i];
		if (
			!isPartnershipStreamValid(
				// @ts-ignore
				stream
			)
		) {
			req.log.warn(
				{
					data: {
						to,
						partnershipParam,
						streamContent: stream.content,
						schema: stream.metadata.schema,
						modelSchema: WalletAliases.schemas.Partnership
					}
				},
				"Partnership is invalid"
			);
			return res.status(400).json({
				success: false
			});
		}
	}

	const campaignRefs = streams.map((stream) => stream.content);
	const partnershipIds = streams.map((stream) => stream.id.toString());
	for (let i = 0; i < campaignRefs.length - 1; i += 1) {
		if (
			campaignRefs[i].address !== campaignRefs[i + 1].address ||
			campaignRefs[i].chain !== campaignRefs[i + 1].address
		) {
			req.log.warn(
				{
					data: { to, partnershipParam, campaignRef: campaignRefs[i] }
				},
				"Partnership parameter is invalid. Partnerships are not for the same campaign."
			);
			return res.status(400).json({
				success: false
			});
		}
	}
	const [campaignRef] = campaignRefs; // all of the campaign references should be the same.
	const campaignKey = [campaignRef.chain, campaignRef.address].join(":");

	// Validate that the partnership(s) and campaign are associated to authed dids
	const checkCursor = await arango.query(aql`
		LET dids = ${req.user.map(({ did }) => `Dids/${did}`)}
		LET relatedDids = (
			FOR did in dids
				FOR rd IN 1..1 ANY did Related
					COLLECT _id = rd._id
						RETURN _id)
		LET uniquedDids = UNION_DISTINCT(dids, relatedDids)
		FOR did IN uniquedDids
			FOR e IN 1..2 OUTBOUND did Engagements
				FILTER POSITION(${partnershipIds}, e._key) OR e._key == ${campaignKey}
				RETURN e
	`);
	const checkResults = (await checkCursor.all()).filter((result) => !!result);
	const partnershipsData = checkResults.filter((result) =>
		partnershipIds.includes(result._key)
	) as ({ _key: string } & PartnershipMetrics)[];

	const campaignData = checkResults.find(
		(result) => result._key === campaignKey
	) as Campaign & {
		_internal?: {
			address: string;
			key: string;
		};
	};

	if (partnershipsData.length === 0 || !campaignData) {
		req.log.warn(
			{
				data: { to, partnerships, campaignKey, checkResults, user: req.user }
			},
			"Partnership and/or Campaign is not associated to User"
		);
		return res.status(400).json({
			success: false
		});
	}

	req.log.debug("Campaign and Partnership indexed data fetched");

	// Determine withdraw amount -- by calculating remaining rewards
	let rewardsToPay = 0;
	partnershipsData.forEach((p) => {
		rewardsToPay += p.rewards || 0;
	});
	if (
		typeof campaignData.reward.limit === "number" &&
		campaignData.reward.limit > 0
	) {
		// Get rewards from partnership and rewards claimed from campaign
		const pCursor = await arango.query(aql`
			LET rewards_claimed = (
				FOR p IN DOCUMENT("Partnerships", ${partnershipIds})
					FOR cl IN 1..1 OUTBOUND p Engagements
						FILTER STARTS_WITH(cl._id, "Claims")
						COLLECT AGGREGATE amount = SUM(cl.amount)
						RETURN amount
			)
			RETURN TO_NUMBER(rewards_claimed)
		`);
		const pResults = await pCursor.all();
		const [rewardsClaimed] = pResults; // will always return an array with a single integer result.

		req.log.debug(
			{ data: { rewardsClaimed } },
			"Previously Rewards Claims fetched"
		);

		// Check if the Campaign is limited at all
		const remainingRewards = campaignData.reward.limit - rewardsClaimed;
		if (rewardsToPay > remainingRewards) {
			rewardsToPay = remainingRewards;
		}
	}

	if (rewardsToPay === 0) {
		req.log.info("No rewards to pay");
		return res.status(200).json({
			success: true,
			data: {
				to,
				fee: 0,
				amount: 0
			}
		});
	}

	let fee = 0;

	// Ensure that amount to be paid is greater than amount in internal wallet -- otherwise send whatevers in the wallet and update partnership amount
	if (campaignData.chain === Chains.ARWEAVE) {
		const arweave = getArweaveClient();
		const warp = getWarp();

		// Ensure that Campaign has a signing key
		if (!campaignData._internal || !campaignData._internal.key) {
			req.log.error("Campaign's rewards signing key is not set");

			return res.json({
				success: false,
				data: {
					to,
					fee: 0,
					amount: 0
				}
			});
		}

		let rewardTxId = "";
		let feeTxId = "";
		const internalAddress = campaignData._internal.address;
		const txTags = [
			["Application", "Usher"],
			["UsherCampaign", campaignRef.address],
			["UsherPartnerships", partnershipIds.join(", ")]
		];
		if (appPackageName && appVersion) {
			txTags.push([appPackageName, appVersion]);
		}

		// Transfer fee amount minus gas x2 from previous transaction to platform wallet
		try {
			const did = await getAppDID();
			const jwe = JSON.parse(Base64.decode(campaignData._internal.key));
			const dec = await did.decryptJWE(jwe, { did: did.id });
			const raw = uint8arrays.toString(dec);
			const jwk = JSON.parse(raw);

			if (campaignData.reward.address) {
				const contract = warp
					.contract(campaignData.reward.address)
					.connect(jwk);
				const contractState = await contract.readState();
				if (campaignData.reward.type === RewardTypes.PST) {
					const state = contractState.state as {
						balances: Record<string, number>;
					};
					const balance = state.balances[internalAddress] || 0;
					if (balance === 0) {
						req.log.error("Insufficient funding for Campaign");
						return res.status(402).json({
							success: false,
							data: {
								to,
								fee: 0,
								amount: 0
							}
						});
					}

					if (rewardsToPay > balance) {
						rewardsToPay = balance;
					}

					// ? No fee for custom PSTs at the moment

					const interactionParams = {
						function: "transfer",
						qty: rewardsToPay,
						target: to
					};
					const interactionId = await contract.writeInteraction(
						interactionParams,
						txTags.map((tag) => ({ name: tag[0], value: tag[1] }))
					);

					if (!interactionId) {
						req.log.error(
							{ data: { rewardsToPay, interactionId, interactionParams } },
							"Failed to submit reward transaction"
						);
						return res.json({
							success: false,
							data: {
								to,
								fee,
								amount: rewardsToPay
							}
						});
					}

					req.log.info(
						{ data: { fee, rewardsToPay, interactionId } },
						"Fee and reward transfers complete"
					);

					rewardTxId = interactionId;
				} else {
					req.log.error(
						{ data: { reward: campaignData.reward } },
						"Unsupported Campaign Reward"
					);
					return res.status(402).json({
						success: false,
						data: {
							to,
							fee: 0,
							amount: 0
						}
					});
				}
			} else {
				fee = rewardsToPay * FEE_MULTIPLIER; // x * 0.1
				const totalToPay = fee + rewardsToPay;

				const balance = await arweave.wallets.getBalance(internalAddress);
				const arBalanceStr = arweave.ar.winstonToAr(balance);
				const winstonBalance = parseFloat(balance);
				let arBalance = parseFloat(arBalanceStr);
				if (Number.isNaN(arBalance) || Number.isNaN(winstonBalance)) {
					arBalance = 0;
				}

				if (arBalance === 0) {
					req.log.error("Insufficient funding for Campaign");
					return res.status(402).json({
						success: false,
						data: {
							to,
							fee: 0,
							amount: 0
						}
					});
				}

				if (totalToPay > arBalance) {
					fee = arBalance * FEE_MULTIPLIER;
					rewardsToPay = arBalance - fee;
				}

				const rewardTx = await arweave.createTransaction(
					{
						target: to,
						quantity: arweave.ar.arToWinston(`${rewardsToPay}`)
					},
					jwk
				);

				if (totalToPay > arBalance) {
					fee -= parseFloat(arweave.ar.winstonToAr(rewardTx.reward)) * 2; // ensure there's enough gas for the transfers.
				}
				const feeTx = await arweave.createTransaction({
					target: FEE_ARWEAVE_WALLET,
					quantity: arweave.ar.arToWinston(`${fee}`)
				});

				req.log.debug(
					{ data: { fee, rewardsToPay } },
					"Fee and reward calculated"
				);

				// Tags
				txTags.forEach(([tagName, tagVal]) => {
					rewardTx.addTag(tagName, tagVal);
					feeTx.addTag(tagName, tagVal);
				});
				rewardTx.addTag("UsherTransferType", "Reward");
				feeTx.addTag("UsherTransferType", "Fee");

				await arweave.transactions.sign(rewardTx, jwk);
				await arweave.transactions.sign(feeTx, jwk);

				const [rewardTxResponse, feeTxResponse] = await Promise.all([
					arweave.transactions.post(rewardTx),
					arweave.transactions.post(feeTx)
				]);

				if (rewardTxResponse.status !== 200) {
					req.log.error(
						{ data: { rewardTxResponse, rewardTx, rewardsToPay } },
						"Failed to submit reward transaction"
					);
					return res.json({
						success: false,
						data: {
							to,
							fee,
							amount: rewardsToPay
						}
					});
				}
				if (feeTxResponse.status !== 200) {
					req.log.warn(
						{ data: { feeTxResponse, feeTx, fee } },
						"Failed to submit fee transaction"
					);
					return res.json({
						success: false,
						data: {
							to,
							fee,
							amount: rewardsToPay
						}
					});
				}

				req.log.info(
					{
						data: { fee, rewardsToPay, rewardTx: rewardTx.id, feeTx: feeTx.id }
					},
					"Fee and reward transfers complete"
				);

				rewardTxId = rewardTx.id;
				feeTxId = feeTx.id;
			}

			await indexClaim(
				partnershipsData,
				rewardsToPay,
				to,
				rewardTxId,
				fee,
				FEE_ARWEAVE_WALLET,
				feeTxId,
				req.log
			);

			const claim: Claim = {
				to,
				fee,
				amount: rewardsToPay,
				tx: {
					id: rewardTxId,
					url: `${ARWEAVE_EXPLORER_TX_URL}${rewardTxId}`
				}
			};
			return res.json({
				success: true,
				data: claim
			});
		} catch (e) {
			handleException(e);
			req.log.error(
				{
					e,
					data: { partnershipIds, campaignRef }
				},
				"Cannot execute Arweave Rewards Transfer"
			);
			return res.status(400).json({
				success: false
			});
		}
	}

	if (campaignData.chain === Chains.ETHEREUM) {
		const ethereum = getEthereumClient();

		// Ensure that Campaign has a signing key
		if (!campaignData._internal || !campaignData._internal.key) {
			req.log.error("Campaign's rewards signing key is not set");

			return res.json({
				success: false,
				data: {
					to,
					fee: 0,
					amount: 0
				}
			});
		}

		let rewardTxId = "";
		let feeTxId = "";
		const internalAddress = campaignData._internal.address;

		// Transfer fee amount minus gas x2 from previous transaction to platform wallet
		try {
			const did = await getAppDID();
			const jwe = JSON.parse(Base64.decode(campaignData._internal.key));
			const dec = await did.decryptJWE(jwe, { did: did.id });
			const privateKey = uint8arrays.toString(dec);

			const wallet = new Wallet(privateKey, ethereum);
			wallet.connect(ethereum);

			if (campaignData.reward.address) {
				if (campaignData.reward.type === RewardTypes.TOKEN) {
					const contract = new ethers.Contract(
						campaignData.reward.address,
						erc20,
						wallet
					);
					const decimals = await contract.decimals();
					const balanceBN = (await contract.balanceOf(
						internalAddress
					)) as BigNumber;

					let rewardsToPayBN = ethers.utils.parseUnits(
						rewardsToPay.toString(),
						decimals
					);

					if (balanceBN.isZero()) {
						req.log.error("Insufficient funding for Campaign");
						return res.status(402).json({
							success: false,
							data: {
								to,
								fee: 0,
								amount: 0
							}
						});
					}

					if (rewardsToPayBN.gt(balanceBN)) {
						rewardsToPayBN = balanceBN;
					}

					// ? No fee for custom TOKENs at the moment

					const rewardTx = await contract.populateTransaction.transfer(
						to,
						rewardsToPayBN
					);
					const rewardTxReceipt = await (
						await wallet.sendTransaction(rewardTx)
					).wait();

					if (rewardTxReceipt.status === 0) {
						req.log.error(
							{ data: { rewardTxReceipt, rewardTx, rewardsToPay } },
							"Failed to submit reward transaction"
						);
						return res.json({
							success: false,
							data: {
								to,
								fee,
								amount: rewardsToPay
							}
						});
					}

					req.log.info(
						{
							data: {
								fee,
								rewardsToPay,
								rewardTx: rewardTxReceipt.transactionHash
							}
						},
						"Fee and reward transfers complete"
					);

					rewardTxId = rewardTxReceipt.transactionHash;
				} else {
					req.log.error(
						{ data: { reward: campaignData.reward } },
						"Unsupported Campaign Reward"
					);
					return res.status(402).json({
						success: false,
						data: {
							to,
							fee: 0,
							amount: 0
						}
					});
				}
			} else {
				let rewardsToPayBN = ethers.utils.parseEther(rewardsToPay.toString());
				let feeBN = rewardsToPayBN.mul(FEE_MULTIPLIER * 100).div(100); // x * 0.1
				const totalToPayBN = rewardsToPayBN.add(feeBN);

				const balanceBN = await ethereum.getBalance(internalAddress);

				if (balanceBN.isZero()) {
					req.log.error("Insufficient funding for Campaign");
					return res.status(402).json({
						success: false,
						data: {
							to,
							fee: 0,
							amount: 0
						}
					});
				}

				if (totalToPayBN.gt(balanceBN)) {
					feeBN = balanceBN.mul(FEE_MULTIPLIER * 100).div(100);
					rewardsToPayBN = balanceBN.sub(feeBN);
				}

				const rewardTx = await wallet.populateTransaction({
					to,
					value: rewardsToPayBN,
					nonce: await wallet.getTransactionCount()
				});

				if (totalToPayBN.gt(balanceBN)) {
					feeBN = feeBN.sub(BigNumber.from(rewardTx.gasLimit).mul(2)); // ensure there's enough gas for the transfers.
				}
				const feeTx = await wallet.populateTransaction({
					to: FEE_ETHEREUM_WALLET,
					value: feeBN,
					nonce: (await wallet.getTransactionCount()) + 1
				});

				rewardsToPay = parseFloat(ethers.utils.formatEther(rewardsToPayBN));
				fee = parseFloat(ethers.utils.formatEther(feeBN));

				req.log.debug(
					{
						data: {
							fee,
							rewardsToPay
						}
					},
					"Fee and reward calculated"
				);

				await Promise.all([
					wallet.signTransaction(rewardTx),
					wallet.signTransaction(feeTx)
				]);

				const [rewardTxReceipt, feeTxReceipt] = await Promise.all([
					(await wallet.sendTransaction(rewardTx)).wait(),
					(await wallet.sendTransaction(feeTx)).wait()
				]);

				if (rewardTxReceipt.status === 0) {
					req.log.error(
						{ data: { rewardTxReceipt, rewardTx, rewardsToPay } },
						"Failed to submit reward transaction"
					);
					return res.json({
						success: false,
						data: {
							to,
							fee,
							amount: rewardsToPay
						}
					});
				}
				if (feeTxReceipt.status === 0) {
					req.log.warn(
						{ data: { feeTxReceipt, feeTx, fee } },
						"Failed to submit fee transaction"
					);
					return res.json({
						success: false,
						data: {
							to,
							fee,
							amount: rewardsToPay
						}
					});
				}

				req.log.info(
					{
						data: {
							fee,
							rewardsToPay,
							rewardTx: rewardTxReceipt.transactionHash,
							feeTx: feeTxReceipt.transactionHash
						}
					},
					"Fee and reward transfers complete"
				);

				rewardTxId = rewardTxReceipt.transactionHash;
				feeTxId = feeTxReceipt.transactionHash;
			}

			await indexClaim(
				partnershipsData,
				rewardsToPay,
				to,
				rewardTxId,
				fee,
				FEE_ETHEREUM_WALLET,
				feeTxId,
				req.log
			);

			const claim: Claim = {
				to,
				fee,
				amount: rewardsToPay,
				tx: {
					id: rewardTxId,
					url: `${ETHEREUM_EXPLORER_TX_URL}${rewardTxId}`
				}
			};
			return res.json({
				success: true,
				data: claim
			});
		} catch (e) {
			handleException(e);
			req.log.error(
				{
					e,
					data: { partnershipIds, campaignRef }
				},
				"Cannot execute Ethereum Rewards Transfer"
			);
			return res.status(400).json({
				success: false
			});
		}
	}
	req.log.warn("Unsupported partnership");

	return res.json({
		success: false,
		data: {
			to,
			fee: 0,
			amount: 0
		}
	});
});

export default handler.handle();
