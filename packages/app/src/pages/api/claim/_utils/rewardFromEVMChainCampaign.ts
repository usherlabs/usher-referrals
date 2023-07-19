import {Chains} from "@usher.so/shared";
import {erc20} from "@/abi/erc20";
import {RewardTypes} from "@usher.so/campaigns";
import {BigNumber, ethers} from "ethers";
import {ApiResponse, AuthApiRequest} from "@/types";
import {CampaignData} from "@/pages/api/claim";

export const rewardFromEVMChainCampaign = (
	chain: Chains.ETHEREUM | Chains.BSC
) => {};

export const handleCampaignWithRewardAddress = async (
	req: AuthApiRequest,
	res: ApiResponse,
	{
		campaignData,
		campaignWallet,
		rewardsToPay,
		to
	}: {
		campaignWallet: any;
		rewardsToPay: number;
		to: string;
		campaignData: CampaignData;
	}
) => {
	const campaignRewardType = campaignData.reward.type;
	const campaignRewardAddress = campaignData.reward.address;
	const campaignInternalAddress = campaignData._internal?.address;

	if (campaignRewardType === RewardTypes.ERC20) {
		const contract = new ethers.Contract(
			campaignRewardAddress,
			erc20,
			// TODO: Figure out which correct variable to pass. Wallet implements Signer, but this constructor requires Signer | Provider | undefined
			// @ts-ignore
			campaignWallet
		);
		const decimals = await contract.decimals();
		const balanceBN = (await contract.balanceOf(
			campaignInternalAddress
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
};
