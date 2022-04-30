/**
 * Endpoint responsible for sign-in and sign-up
 * ie. if the user exists, send a sign in email
 */

import { z } from "zod";
import got from "got";
import { URL } from "url";
import ono from "@jsdevtools/ono";

import { ApiRequest, ApiResponse } from "@/types";
import { supabase } from "@/utils/supabase-client";
import getHandler from "@/server/middleware";
import {
	postmarkApiKey,
	postmarkTemplates,
	emailFrom
} from "@/server/env-config";
import { SKIPPED_WALLET_ADDRESS } from "@/constants";

const handler = getHandler();

const schema = z.object({
	email: z.string(),
	wallet: z.string().optional()
});

// Initializing the cors middleware
handler.post(async (req: ApiRequest, res: ApiResponse) => {
	let { body } = req;
	try {
		body = await schema.parseAsync(body);
	} catch (e) {
		return res.status(400).json({
			success: false
		});
	}
	const { email, wallet } = body;

	// create user first if user does not exist -- will throw if user exists
	// Alternative approach -- https://github.com/supabase/supabase/discussions/1282
	let isNewUser = true;
	try {
		const sNewUser = await supabase.auth.api.createUser({
			email,
			email_confirm: false,
			phone_confirm: false
		});
		if (sNewUser.error) {
			if (sNewUser.error.status === 422) {
				isNewUser = false;
			}
		}
		req.log.info({ newUser: { sNewUser } }, "New User Response");
	} catch (e) {
		req.log.error(e);
	}

	const sResp = await supabase.auth.api.generateLink(
		isNewUser ? "signup" : "magiclink",
		email
	);
	if (sResp.error) {
		if (sResp.error.status !== 406) {
			throw ono(sResp.error, sResp.error.message);
		}
	}
	req.log.info(
		{ email: { sResp } },
		`${isNewUser ? "Sign Up" : "Existing"} Magic link`
	);

	let { action_link: link } = sResp.data as { action_link: string };
	// Keep wallet skip logic even after the magic link auth process
	if (wallet === SKIPPED_WALLET_ADDRESS) {
		const linkUrl = new URL(link);
		const redirectTo = linkUrl.searchParams.get("redirect_to");
		if (redirectTo) {
			const redirectToUrl = new URL(redirectTo);
			redirectToUrl.searchParams.set("skip_wallet", "true");
			linkUrl.searchParams.set("redirect_to", redirectToUrl.href);
			link = linkUrl.href;
		}
	}

	let templateId = postmarkTemplates.signIn;
	if (isNewUser && postmarkTemplates.signUp) {
		templateId = postmarkTemplates.signUp;
	}
	if (postmarkApiKey && emailFrom && postmarkTemplates.signIn) {
		const response = await got
			.post("https://api.postmarkapp.com/email/withTemplate", {
				json: {
					from: emailFrom,
					To: email,
					TemplateId: templateId,
					TemplateModel: {
						action_url: link
					}
				},
				headers: {
					"X-Postmark-Server-Token": postmarkApiKey
				}
			})
			.json();

		req.log.info({ email: { response } }, "Email Auth Response");
	}

	return res.json({
		success: true // assume all visitors are bots
	});
});

export default handler;
