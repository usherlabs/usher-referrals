/**
 * GET: Fetches the destination URL for the Invite Link ID, and validates the Conversion ID optionally passed
 * POST: Create a new Conversion ID against the Invite Link ID
 */

import * as yup from "yup";
import isEmpty from "lodash/isEmpty";
import ono from "@jsdevtools/ono";

import { supabase } from "@/utils/supabase-client";
import getHandler from "@/server/middleware";
import handleException from "@/utils/handle-exception";

const handler = getHandler();

const querySchema = yup.object({
	id: yup.string().required(),
	cid: yup.string()
});

handler
	.get(async (req, res) => {
		let { query } = req;
		try {
			query = await querySchema.validate(query);
		} catch (e) {
			return res.status(400).json({
				success: false
			});
		}
		const { id: inviteLinkId, cid: existingConvId } = query;

		req.log.info(
			{ params: { inviteLinkId, existingConvId } },
			"End-user Invite Link"
		);

		// Check to make sure that the invite Link exists exists
		const sSel = await supabase
			.from("invite_links")
			.select("destination_url, active")
			.eq("id", inviteLinkId);
		if ((sSel.error && sSel.status !== 406) || isEmpty(sSel.data)) {
			return res.status(400).json({
				success: false
			});
		}
		req.log.info(
			{ invite_links: { sSel } },
			"Fetch Destination URL for Invite Link ID"
		);

		const [{ destination_url: url, active: isInviteActive }] = sSel.data;

		let convId = "";
		let isRelated = false;
		if (existingConvId) {
			const sConvSel = await supabase
				.from("conversions")
				.select("id, invite_link_id")
				.match({ id: existingConvId, is_complete: false, is_bundled: false })
				.order("created_at", { ascending: false });
			if (sConvSel.error && sConvSel.status !== 406) {
				handleException(
					ono(
						sConvSel.error,
						`Cannot fetch conversions for ID ${existingConvId}`
					)
				);
			} else if (sConvSel.data.length > 0) {
				if (sConvSel.data.length > 1) {
					req.log.warn(
						{ conversionsForId: { existingConvId, sConvSel } },
						"Mulitple Conversions Fetched for the Same ID"
					);
				}
				const [convData] = sConvSel.data;
				convId = convData.id;
				isRelated = convData.invite_link_id === inviteLinkId;
			}
		}

		return res.json({
			success: true,
			url,
			isInviteActive,
			convId,
			isRelated
		});
	})
	.post(async (req, res) => {
		let { query } = req;
		try {
			query = await querySchema.validate(query);
		} catch (e) {
			return res.status(400).json({
				success: false
			});
		}
		const { id: inviteLinkId } = query;

		req.log.info(
			{ params: { inviteLinkId } },
			"Create Conversion for End-User Invite"
		);

		// Check to make sure that the invite Link exists exists
		const sSel = await supabase
			.from("invite_links")
			.select("id", { count: "exact", head: true })
			.eq("id", inviteLinkId);
		if ((sSel.error && sSel.status !== 406) || sSel.count < 1) {
			return res.status(400).json({
				success: false
			});
		}
		req.log.info({ invite_links: { sSel } }, "Fetch Count for Invite Link ID");

		const sIns = await supabase
			.from("conversions")
			.insert([{ invite_link_id: inviteLinkId }]);
		if ((sIns.error && sIns.status !== 406) || isEmpty(sIns.data)) {
			handleException(
				ono(
					sIns.error,
					`Cannot insert to conversions with Invite Link ID ${inviteLinkId}`
				)
			);
			return res.status(400).json({
				success: false
			});
		}

		const [{ id: convId }] = sIns.data;

		return res.json({
			success: true,
			convId
		});
	});

export default handler;
