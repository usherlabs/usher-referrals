import { Profile } from "@/types";
import { Base64 } from "js-base64";
import handleException from "@/utils/handle-exception";
import { destroyCookie, parseCookies } from "nookies";

export async function handleMagicAuthProfileUpdate(profile: Profile) {
	const cookies = parseCookies();
	const magicConnectToken = cookies.__usher_magic_connect;
	let newProfile = profile;
	if (magicConnectToken && !profile.email) {
		try {
			const response = JSON.parse(Base64.decode(magicConnectToken));
			newProfile = {
				...(profile || {}),
				email: response?.userMetadata?.email
			};
		} catch (e) {
			handleException(e);
		} finally {
			destroyCookie(null, "__usher_magic_connect", {
				maxAge: 24 * 60 * 60, // 1 days
				path: "/"
			});
		}
	}
	return newProfile;
}
