import Token from "./token";
import { CampaignReference } from "./types";

export const anchor = async (
	anchorSelector: string,
	ref: CampaignReference
) => {
	if (typeof window === "undefined") {
		return;
	}

	Array.from(document.querySelectorAll(anchorSelector)).forEach((anchorEl) => {
		const href = anchorEl.getAttribute("href");
		if (!href) {
			return;
		}
		const token = Token.next(ref);
		if (token) {
			const urlInstance = new URL(href);
			urlInstance.searchParams.set("_ushrt", token);
			anchorEl.setAttribute("href", urlInstance.toString());
		}
	});
};
