import { useAtomValue } from "jotai";
import { claimAtoms } from "@/components/Campaign/ClaimButton";
import { PartnershipMetrics } from "@/types";
import * as api from "@/api";
import { useUser } from "@/hooks";
import { Chains } from "@usher.so/shared";
import { useQuery } from "react-query";

const getPartnershipMetrics = async (
	ids: string[]
): Promise<PartnershipMetrics | null> => {
	if (ids.length === 0) {
		return null;
	}

	const response = await api.partnerships().get(ids);

	if (!response.success) {
		return null;
	}

	return response.data as PartnershipMetrics;
};

export function usePartnershipsForCampaign({
	id,
	chain
}: {
	id: string;
	chain: Chains;
}) {
	const {
		user: { partnerships }
	} = useUser();

	return partnerships.filter(
		(p) => p.campaign.address === id && p.campaign.chain === chain
	);
}

export const useCampaignPartnershipsMetrics = ({
	chain,
	id
}: {
	chain: Chains;
	id: string;
}) => {
	const claims = useAtomValue(claimAtoms.claims);

	const viewingPartnerships = usePartnershipsForCampaign({ id, chain });

	return useQuery(["partnership-metrics", viewingPartnerships, claims], () =>
		getPartnershipMetrics(viewingPartnerships.map((p) => p.id))
	);
};
