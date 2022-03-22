/**
 * POST: Receive and process converison event
 */

import cors from "cors";
import * as yup from "yup";
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

	// TODO: Integrate platform fetch for Usher Contract Address
	if (id !== advertiser.usherContractAddress) {
		return res.status(400).json({
			message: "Invalid Id",
			success: false
		});
	}

	if (nativeId) {
		// First check that there are no conversion ids already using this native_id -- Only if there is not nativeId
		const sNativeSel = await supabase
			.from("conversions")
			.select("id", { count: "exact", head: true })
			.eq("native_id", nativeId);
		if (sNativeSel.error && sNativeSel.status !== 406) {
			throw sNativeSel.error;
		}
		req.log.info({ db: sNativeSel }, "Fetch conversions by NativeId");
		if (sNativeSel.count > 0) {
			return res.json({
				cid,
				success: false
			});
		}
	}

	// Then check to see if there is a conversion that matches the cid and where is_complete is false
	const sList = await supabase
		.from("conversions")
		.select("id", { count: "exact", head: true })
		.match({ id: cid, is_complete: false });
	if (sList.error && sList.status !== 406) {
		throw sList.error;
	}
	req.log.info(
		{ db: sList },
		"Fetch conversions where ID matches and is_complete is false"
	);

	// If cid exists, or nativeId is null and is_complete is false
	if (sList.count === 1) {
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
		req.log.info({ db: sUpdate }, "Update the conversion to complete it");

		return res.json({
			cid,
			success: true
		});
	}

	return res.json({
		cid,
		success: false
	});
});

export default handler;
