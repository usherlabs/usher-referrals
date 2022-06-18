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
		});

		return listener;
	}
}

export default Conversions;
