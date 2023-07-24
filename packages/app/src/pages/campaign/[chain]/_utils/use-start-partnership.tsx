import handleException from "@/utils/handle-exception";
import { toaster } from "evergreen-ui";
import { useUser } from "@/hooks";
import { atom, useSetAtom } from "jotai";
import React from "react";
import { chainIsSupported } from "@/utils/chains/chain-is-supported";

export const partnerAtoms = {
	partnering: atom(false)
};

export function useStartPartnership({
	campaignId,
	campaignChain
}: {
	campaignId: string;
	campaignChain: string;
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

		try {
			if (chainIsSupported(campaignChain)) {
				await addPartnership({
					chain: campaignChain,
					address: campaignId
				});
				toaster.success(`🎉  You have engaged this partnership!`, {
					id: "start-partnership",
					description: `Complete any remaining verifications and reviews to start earning rewards when you share your invite link!.`
				});
			} else {
				// TODO: handle this properly
				errorMessage();
			}
		} catch (e) {
			handleException(e);
			errorMessage();
		} finally {
			setPartnering(false);
		}
	}, [setPartnering, campaignChain, campaignId, addPartnership]);
}
