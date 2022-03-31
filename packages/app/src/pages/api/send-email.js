import * as yup from "yup";
import got from "got";

import { supabase } from "@/utils/supabase-client";
import getHandler from "@/server/middleware";

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

	const sResp = await supabase.auth.api.generateLink("magiclink", email);
	if (sResp.error && sResp.status !== 406) {
		throw sResp.error;
	}
	const { action_link: link } = sResp.data;
	req.log.info({ email: { sResp } }, "Magic link");

	const response = await got
		.post("https://api.postmarkapp.com/email/withTemplate", {
			json: {
				from: "noreply@usher.so",
				To: email,
				TemplateId: "27507398",
				TemplateModel: {
					action_url: link,
					product_name: "Usher",
					company_name: "Usher",
					product_url: "https://usher.so"
				}
			},
			headers: {
				"X-Postmark-Server-Token": "dcdae3ca-7017-4288-844b-eaede35e2569"
			}
		})
		.json();

	req.log.info({ email: { response } }, "Email welcome response");

	return res.json({
		success: true // assume all visitors are bots
	});
});

export default handler;
