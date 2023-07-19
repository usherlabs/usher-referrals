import handleException from "@/utils/handle-exception";
import { toaster } from "evergreen-ui";
import { useUser } from "@/hooks";
import { atom, useSetAtom } from "jotai";
import React from "react";
import { Chains } from "@usher.so/shared";

export const partnerAtoms = {
	partnering: atom(false)
};

export function useStartPartnership({
	campaignId,
	campaignChain
}: {
	campaignId: string;
	campaignChain: Chains;
}) {
	const {
		actions: { addPartnership }
	} = useUser();
	const setPartnering = useSetAtom(partnerAtoms.partnering);

	return React.useCallback(async () => {
		const errorMessage = () =>
			toaster.danger(
				"Oops! Something has gone wrong partnering with this campaign.",
				{
					id: "start-partnership"
				}
			);
		if (!campaignId || !campaignChain) {
			errorMessage();
			return;
		}
		setPartnering(true);
		const campaignRef = {
			campaignChain,
			address: campaignId
		};
		try {
			await addPartnership(campaignRef);
			toaster.success(`🎉  You have engaged this partnership!`, {
				id: "start-partnership",
				description: `Complete any remaining verifications and reviews to start earning rewards when you share your invite link!.`
			});
		} catch (e) {
			handleException(e);
			errorMessage();
		} finally {
			setPartnering(false);
		}
	}, [setPartnering, campaignChain, campaignId, addPartnership]);
}
