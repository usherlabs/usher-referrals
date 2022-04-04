/**
 * Endpoint responsible for sign-in and sign-up
 * ie. if the user exists, send a sign in email
 */

import * as yup from "yup";
import got from "got";

import { supabase } from "@/utils/supabase-client";
import getHandler from "@/server/middleware";
import {
	postmarkApiKey,
	postmarkTemplates,
	emailFrom
} from "@/server/env-config";

const handler = getHandler();

const schema = yup.object({
	email: yup.string().required()
});

// Initializing the cors middleware
handler.post(async (req, res) => {
	let { body } = req;
	try {
		body = await schema.validate(body);
	} catch (e) {
		return res.status(400).json({
			success: false
		});
	}
	const { email } = body;

	// create user first if user does not exist -- will throw if user exists
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
	if (sResp.error && sResp.status !== 406) {
		throw sResp.error;
	}
	const { action_link: link } = sResp.data;
	req.log.info(
		{ email: { sResp } },
		`${isNewUser ? "Sign Up" : "Existing"} Magic link`
	);

	let templateId = postmarkTemplates.signIn;
	if (isNewUser && postmarkTemplates.signUp) {
		templateId = postmarkTemplates.signUp;
	}
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

	return res.json({
		success: true // assume all visitors are bots
	});
});

export default handler;
