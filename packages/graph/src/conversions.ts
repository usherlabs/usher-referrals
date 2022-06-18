import { CeramicClient } from "@ceramicnetwork/http-client";
import { TileDocument } from "@ceramicnetwork/stream-tile";

import { CERAMIC_CONVERSIONS_STREAM_ID } from "@/constants";
import Listen from "@/utils/listen";
import { ceramicUrl } from "@/env-config";

class Conversions {
	public static listen() {
		const ceramic = new CeramicClient(ceramicUrl);
		const listener = new Listen(async () => {
			// Poll for updates to the Conversions stream and index into a provided fn
			const doc = await TileDocument.load(
				ceramic,
				CERAMIC_CONVERSIONS_STREAM_ID
			);

			// Check if the latest commit ids have been indexed.
			// If not, index these updates.

			// Parse out the Conversions to ingest
			// Validate the conversions -- as would be the case in the validator node
		});

		return listener;
	}
}

export default Conversions;
