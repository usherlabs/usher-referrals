import { TileDocument } from "@ceramicnetwork/stream-tile";
import { Heading, Pane } from "evergreen-ui";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { ceramic } from "@/utils/ceramic-client";

const LinkPage: React.FC = () => {
	const router = useRouter();
	const id = router.query.id as string;
	const [link, setLink] = useState<unknown>();

	useEffect(() => {
		(async () => {
			const doc = await (await TileDocument.load(ceramic, id)).content;
			setLink(doc);
		})();
	}, []);

	return (
		<Pane>
			<Heading>{id}</Heading>
			<pre>{JSON.stringify(link, null, 2)}</pre>
		</Pane>
	);
};

export async function getStaticPaths() {
	return {
		paths: [], // Generate not pages at build time
		fallback: true // If there's not page, load, generate the page, and then serve the generated page...
	};
}

export async function getStaticProps() {
	return {
		props: {
			noUser: true,
			seo: {
				title: "You've been invited by a Link...",
				description: `You are being redirected to the Destination URL...`
			}
		}
	};
}

export default LinkPage;
