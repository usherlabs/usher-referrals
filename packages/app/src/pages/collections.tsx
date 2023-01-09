import { css } from "@linaria/core";
import { Button, Pane, Text, TextInput } from "evergreen-ui";
import { useCallback, useState } from "react";
import { useQuery } from "react-query";

import * as api from "@/api";
import LinkDetails from "@/components/Collection/LinkDetails";
import LinksList from "@/components/Collection/LinksList";
import LinkVisitorsList from "@/components/Collection/LinkVisitorsList";
import { Link } from "@/components/Collection/types";
import PageHeader from "@/components/PageHeader";

type Props = {};

const getLinks = async (): Promise<Link[] | null> => {
	const response = await api.collections().get();

	if (!response.success) {
		return null;
	}

	return response.data;
};

const Collections: React.FC<Props> = () => {
	const [currentLink, setCurrentLink] = useState<Link>();

	const links = useQuery("links", () => getLinks()).data || [];

	const handleSelect = useCallback((link: Link) => {
		setCurrentLink(link);
	}, []);

	return (
		<Pane display="flex" flexDirection="column" height="100vh" padding="40px">
			<PageHeader
				title="Collections"
				description="Collect wallet connections through a shareable invite link."
			/>
			<Pane display="flex" alignItems="center" marginY="20px">
				<Text flex="1">{links.length} Results Found</Text>
				<TextInput
					flex="0.8"
					placeholder="Paste URL here to create a link..."
				/>
				<Button appearance="primary">Create Link</Button>
			</Pane>
			{links?.length > 0 && (
				<Pane
					flex="1"
					display="flex"
					padding="20px"
					backgroundColor="#F9FAFC"
					borderRadius="12px"
					overflow="hidden"
				>
					<Pane
						flex="1"
						backgroundColor="#FFFFFF"
						borderRadius="8px"
						overflow="auto"
						className={css`
							scrollbar-width: thin;
							scrollbar-color: #ddd #fff;
							::-webkit-scrollbar {
								width: 8px;
							}
							::-webkit-scrollbar-track {
								background: #fff;
								border-radius: 4px;
							}
							::-webkit-scrollbar-thumb {
								background: #ddd;
								border-radius: 4px;
							}
						`}
					>
						<LinksList links={links} onSelect={handleSelect} />
					</Pane>
					{currentLink && (
						<Pane flex="2" display="flex" flexDirection="column">
							<LinkDetails link={currentLink} />
							<LinkVisitorsList linkId={currentLink.id} />
						</Pane>
					)}
				</Pane>
			)}
		</Pane>
	);
};

export default Collections;
