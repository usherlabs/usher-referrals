import { z } from "zod";
import { Base64 } from "js-base64";
import * as uint8arrays from "uint8arrays";
import { TileLoader } from "@glazed/tile-loader";
import { aql } from "arangojs";
import { WalletAliases } from "@usher.so/datamodels";
import { TileDocument } from "@ceramicnetwork/stream-tile";
// import ono from "@jsdevtools/ono";
import uniq from "lodash/uniq";
import { ethers, Wallet } from "ethers";

import { AuthApiRequest, Claim, PartnershipMetrics } from "@/types";
import { Campaign, RewardTypes } from "@usher.so/campaigns";
import { Chains } from "@usher.so/shared";
import { CampaignReference } from "@usher.so/partnerships";
import { useRouteHandler } from "@/server/middleware";
import { getAppDID } from "@/server/did";
import { ceramic } from "@/utils/ceramic-client";
import { getArangoClient } from "@/utils/arango-client";
import withAuth from "@/server/middleware/auth";
import { getArweaveClient, getWarp } from "@/utils/arweave-client";
import {
	FEE_ARWEAVE_WALLET,
	FEE_ETHEREUM_WALLET,
	FEE_MULTIPLIER
} from "@/constants";
import handleException from "@/utils/handle-exception";
import { appPackageName, appVersion } from "@/env-config";
import { indexClaim } from "@/server/claim";
import { erc20 } from "@/abi/erc20";
import { getExplorerUrl } from "@/utils/chains/getExplorerUrl";
import { getEVMBasedProvider } from "@/utils/chains/getEVMBasedProvider";
import { isEthereumBasedNetwork } from "@/utils/isEthereumBasedNetwork";
import Decimal from "decimal.js";
import { Warp } from "warp-contracts";

// eslint-disable-next-line react-hooks/rules-of-hooks
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

async function getPrivateKeyFromCampaignKey(key: string) {
	const did = await getAppDID();
	const jwe = JSON.parse(Base64.decode(key));
	const dec = await did.decryptJWE(jwe, { did: did.id });
	const privateKey = uint8arrays.toString(dec);
	return privateKey;
}

async function getContractStateForAddress(
	warp: Warp,
	rewardAddress: string,
	jwk: any
) {
	const contract = warp.contract(rewardAddress).connect(jwk);
	const contractState = await contract.readState();
	const state = contractState.state as {
		balances: Record<string, number>;
	};
	return { contract, state };
}

export type CampaignData = Campaign & {
	_internal?: {
		address: string;
		key: string;
	};
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
		if (!isPartnershipStreamValid(stream)) {
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
	) as CampaignData;

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
					FOR cl IN 1..3 ANY p Engagements
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

	// Limit of once per month to Ethereum Claims
	if (campaignData.chain === Chains.ETHEREUM) {
		const pCursor = await arango.query(aql`
			LET last_claimed_at = (
				FOR p IN DOCUMENT("Partnerships", ${partnershipIds})
					FOR cl IN 1..1 ANY p Engagements
						FILTER STARTS_WITH(cl._id, "Claims")
						COLLECT AGGREGATE last_claimed_at = MAX(cl.created_at)
             RETURN last_claimed_at
      )
			RETURN TO_NUMBER(last_claimed_at)
		`);
		const pResults = await pCursor.all();
		const [lastClaimedAt] = pResults; // will always return an array with a single integer result.

		if (lastClaimedAt > 0) {
			const lastClaimedDate = new Date(lastClaimedAt);
			const now = new Date(Date.now());
			const canClaimThisMonth =
				lastClaimedDate.getUTCFullYear() !== now.getUTCFullYear() ||
				lastClaimedDate.getUTCMonth() !== now.getUTCMonth();
			if (!canClaimThisMonth) {
				req.log.info("Rewards already claimed this month");
				return res.status(200).json({
					success: false,
					message: "Rewards already claimed this month"
				});
			}
		}
	}

	let fee = 0;

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

	// Ensure that amount to be paid is greater than amount in internal wallet -- otherwise send whatevers in the wallet and update partnership amount
	if (campaignData.chain === Chains.ARWEAVE) {
		const arweave = getArweaveClient();
		const warp = getWarp(arweave);

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
			const raw = await getPrivateKeyFromCampaignKey(
				campaignData._internal.key
			);
			const jwk = JSON.parse(raw);

			if (campaignData.reward.address) {
				if (campaignData.reward.type === RewardTypes.PST) {
					const { contract, state } = await getContractStateForAddress(
						warp,
						campaignData.reward.address,
						jwk
					);
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
					url: getExplorerUrl({ txId: rewardTxId, chain: campaignData.chain })
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

	if (isEthereumBasedNetwork(campaignData.chain)) {
		const evmChainProvider = getEVMBasedProvider(campaignData.chain);

		// Transfer fee amount minus gas x2 from previous transaction to platform wallet
		try {
			const privateKey = await getPrivateKeyFromCampaignKey(
				campaignData._internal.key
			);

			const campaignWallet = new Wallet(privateKey, evmChainProvider);
			campaignWallet.connect(evmChainProvider);

			if (campaignData.reward.address) {
				if (campaignData.reward.type === RewardTypes.ERC20) {
					const contract = new ethers.Contract(
						campaignData.reward.address,
						erc20,
						// TODO: Figure out which correct variable to pass. Wallet implements Signer, but this constructor requires Signer | Provider | undefined
						// @ts-ignore
						campaignWallet
					);
					const decimals = await contract.decimals();
					const balanceBN = new Decimal(
						(await contract.balanceOf(internalAddress)).toString()
					);

					const initialRewardsToPayBN = new Decimal(
						ethers.utils
							.parseUnits(rewardsToPay.toString(), decimals)
							.toString()
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

					// cap rewards to balance
					const rewardsToPayBN = Decimal.min(balanceBN, initialRewardsToPayBN);

					// ? No fee for custom TOKENs at the moment

					const rewardTx = await contract.populateTransaction.transfer(
						to,
						ethers.BigNumber.from(rewardsToPayBN.toString())
					);
					const rewardTxReceipt = await (
						await campaignWallet.sendTransaction(rewardTx)
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
				const balanceBN = new Decimal(
					(await evmChainProvider.getBalance(internalAddress)).toString()
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

				const initialRewardsToPayBN = new Decimal(
					ethers.utils.parseEther(rewardsToPay.toString()).toString()
				);
				const rewardsToPayBN = Decimal.min(balanceBN, initialRewardsToPayBN);

				// it's initial because soon it may be reduced to accomodate fees
				const initialFeeBN = rewardsToPayBN.mul(FEE_MULTIPLIER);
				const totalToPayBN = rewardsToPayBN.add(initialFeeBN);

				const rewardTx = await campaignWallet.populateTransaction({
					to,
					value: rewardsToPayBN.toHex(),
					nonce: await campaignWallet.getTransactionCount()
				});

				// ensure there's enough gas for the transfers.
				const feeBN = totalToPayBN.lt(balanceBN)
					? initialFeeBN
					: initialFeeBN.sub(
							new Decimal(rewardTx.gasLimit?.toString() ?? 0).mul(2)
					  );

				const feeTx = await campaignWallet.populateTransaction({
					to: FEE_ETHEREUM_WALLET,
					value: feeBN.toHex(),
					nonce: (await campaignWallet.getTransactionCount()) + 1
				});

				rewardsToPay = parseFloat(
					ethers.utils.formatEther(rewardsToPayBN.toString())
				);
				fee = parseFloat(ethers.utils.formatEther(feeBN.toString()));

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
					campaignWallet.signTransaction(rewardTx),
					campaignWallet.signTransaction(feeTx)
				]);

				const [rewardTxReceipt, feeTxReceipt] = await Promise.all([
					(await campaignWallet.sendTransaction(rewardTx)).wait(),
					(await campaignWallet.sendTransaction(feeTx)).wait()
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
					url: getExplorerUrl({ txId: rewardTxId, chain: campaignData.chain })
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
