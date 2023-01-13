import { css } from "@linaria/core";
import {
	Button,
	Pane,
	SideSheet,
	Text,
	TextInput,
	ThemeProvider
} from "evergreen-ui";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useQuery } from "react-query";

import * as api from "@/api";
import LinkDetails from "@/components/Collection/LinkDetails";
import LinkEditor from "@/components/Collection/LinkEditor";
import LinksList from "@/components/Collection/LinksList";
import LinkVisitorsList from "@/components/Collection/LinkVisitorsList";
import { Link } from "@/components/Collection/types";
import PageHeader from "@/components/PageHeader";
import { newTheme } from "@/themes/newTheme";

type Props = {};

const getLinks = async (): Promise<Link[] | null> => {
	const response = await api.collections().get();

	if (!response.success) {
		return [];
	}

	return response.data;
};

const newLinkDefaultState = {
	id: "",
	title: "",
	destinationUrl: "http://google.com",
	publicUrl: "",
	createdAt: 0,
	hits: 0
};

const Collections: React.FC<Props> = () => {
	const [currentLink, setCurrentLink] = useState<Link>();
	const [newLinkDestinationUrl, setNewLinkDestinationUrl] =
		useState<string>("");
	const [isCreating, setIsCreating] = useState<boolean>(false);
	const [newLink, setNewLink] = useState<Link>(newLinkDefaultState);

	const { data: links, refetch } = useQuery("links", () => getLinks());

	const createNewLink = useCallback(() => {
		setNewLink({
			...newLinkDefaultState,
			destinationUrl: newLinkDestinationUrl
		});
		setIsCreating(true);
	}, [newLinkDestinationUrl]);

	const handleLinkEditorClose = useCallback(() => {
		setIsCreating(false);
		setNewLinkDestinationUrl("");
		refetch();
	}, []);

	const handleSelect = useCallback((link: Link) => {
		setCurrentLink(link);
	}, []);

	useEffect(() => {
		const newCurrentlink = links?.find((link) => link.id === currentLink?.id);

		if (newCurrentlink && newCurrentlink === currentLink) {
			return;
		}

		if (newCurrentlink && newCurrentlink !== currentLink) {
			setCurrentLink(newCurrentlink);
		} else if (links && links.length > 0) {
			setCurrentLink(links[0]);
		} else {
			setCurrentLink(undefined);
		}
	}, [links, currentLink]);

	return (
		<ThemeProvider value={newTheme}>
			<Pane display="flex" flexDirection="column" height="100vh" padding="40px">
				<PageHeader
					title="Collections"
					description="Collect wallet connections through a shareable invite link."
				/>
				<Pane display="flex" alignItems="center" marginY="20px">
					{links && links.length > 0 && (
						<Text flex="0.8" fontSize="20px">
							{links.length} Results Found
						</Text>
					)}
					<TextInput
						size="large"
						flex="1"
						placeholder="Paste URL here to create a link..."
						value={newLinkDestinationUrl}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							setNewLinkDestinationUrl(e.target.value)
						}
					/>
					<Button
						appearance="primary"
						size="large"
						marginLeft="15px"
						onClick={createNewLink}
					>
						Create Link
					</Button>
				</Pane>
				{links && links.length > 0 && (
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
							<LinksList
								links={links}
								activeLink={currentLink}
								onSelect={handleSelect}
							/>
						</Pane>
						{currentLink && (
							<Pane flex="2" display="flex" flexDirection="column">
								<LinkDetails
									link={currentLink}
									onEditorClose={() => handleLinkEditorClose()}
								/>
								<LinkVisitorsList linkId={currentLink.id} />
							</Pane>
						)}
					</Pane>
				)}
				<SideSheet
					isShown={isCreating}
					onCloseComplete={() => handleLinkEditorClose()}
				>
					<LinkEditor link={newLink} onClose={() => handleLinkEditorClose()} />
				</SideSheet>
			</Pane>
		</ThemeProvider>
	);
};

export default Collections;
