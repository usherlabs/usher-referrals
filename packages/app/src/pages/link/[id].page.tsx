import { ceramic } from "@/utils/ceramic-client";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import { Connections } from "@usher.so/shared";
import { Pane } from "evergreen-ui";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";

import * as api from "@/api";
import WalletInvite, { WalletInviteProps } from "@/components/WalletInvite";
import { BrandLogoDark } from "@/brand/logo-components/BrandLogos";
import { PoweredByUsher } from "@/components/PoweredByUsher";
import { brandConfig } from "@/brand";

type Link = {
	id: string;
	destination_url: string;
	connections: Connections[];
	is_archived: boolean;
};

const LinkPage: React.FC = () => {
	const router = useRouter();
	const id = router.query.id as string;
	const [link, setLink] = useState<Link>();
	const [domain, setDomain] = useState<string>();

	useEffect(() => {
		(async () => {
			const doc = (await TileDocument.load(ceramic, id)).content as Link;
			if (doc.is_archived) {
				window.location.replace(`/410`);
				return;
			}

			setLink(doc);
			if (doc) {
				setDomain(new URL(doc.destination_url).hostname);
			}
			api.hits().post(id);
		})();
	}, [id]);

	const onWalletConnect: WalletInviteProps["onConnect"] = useCallback(
		async ({ connectedChain, connectedAddress, connection }) => {
			const result = await api
				.redirects()
				.post(id, connectedChain, connectedAddress, connection);

			if (link && result.success) {
				const url = new URL(link.destination_url);
				url.searchParams.append("_ushid", id);
				url.searchParams.append("_ushwa", connectedAddress);
				url.searchParams.append("_ushwc", connection);
				window.location.replace(url);
			}
		},
		[id, link]
	);

	return (
		<Pane
			display="flex"
			flexDirection="column"
			marginY="0"
			marginX="auto"
			minHeight="100vh"
			position="relative"
		>
			{link && (
				<WalletInvite
					domain={domain as string}
					connections={link.connections}
					onConnect={onWalletConnect}
				/>
			)}
			<Pane
				zIndex={100}
				position="fixed"
				bottom={20}
				left={0}
				right={0}
				pointerEvents={"none"}
				display="flex"
				alignItems="center"
				justifyContent="center"
			>
				<Image src={BrandLogoDark} width={120} objectFit="contain" />
			</Pane>
			{brandConfig.rebranded && (
				<Pane marginBottom={8} marginX={"auto"}>
					<PoweredByUsher />
				</Pane>
			)}
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
