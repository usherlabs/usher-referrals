/**
 * POST: Receive and process converison event
 */

import cors from "cors";
import yup from "yup";
import isEmpty from "lodash/isEmpty";

import getHandler from "@/server/middleware";
import { supabase } from "@/utils/supabase-client";
import { advertiser } from "@/env-config";

const handler = getHandler();

const schema = yup.object({
	cid: yup.string().required(),
	id: yup.string().required(),
	nativeId: yup.string(),
	properties: yup.object().default({}).nullable(true)
});

// Initializing the cors middleware
handler.use(cors()).post(async (req, res) => {
	let { body } = req;
	try {
		body = await schema.validate(body);
	} catch (e) {
		return res.status(400).json({
			success: false
		});
	}
	const { cid, id, nativeId, properties } = body;

	if (id !== advertiser.usherContractAddress) {
		return res.status(400).json({
			message: "Invalid Id",
			success: false
		});
	}

	const sList = await supabase
		.from("conversions")
		.select("id", { count: "exact", head: true })
		.or(`id.eq.${cid},native_id.eq.${nativeId}`);
	if (sList.error && sList.status !== 406) {
		throw sList.error;
	}
	req.log.info(sList.data);

	// If no existing cid or nativeId match
	if (isEmpty(sList.data)) {
		const sUpdate = await supabase
			.from("conversions")
			.update({
				is_complete: true,
				native_id: nativeId,
				properties,

				// Used for bundler to know which contract address is responsible for this converison.
				// Bundler is a separate lambda func that is not aware of this application's environment variables
				contract_address: id
			})
			.match({ id: cid });
		if (sUpdate.error && sUpdate.status !== 406) {
			throw sUpdate.error;
		}
		req.log.info(sUpdate.data);
	}

	return res.json({
		cid,
		success: true
	});
});

export default handler;
