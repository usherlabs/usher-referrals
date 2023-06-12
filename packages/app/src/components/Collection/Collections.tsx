import { css } from "@linaria/core";
import {
	Button,
	Heading,
	majorScale,
	Pane,
	Paragraph,
	SideSheet,
	Spinner,
	Strong,
	Text,
	TextInput
} from "evergreen-ui";
import pluralize from "pluralize";
import { ChangeEvent, useCallback, useState } from "react";

import LinkDetails from "@/components/Collection/LinkDetails";
import LinkEditor from "@/components/Collection/LinkEditor";
import LinksList from "@/components/Collection/LinksList";
import LinkVisitorsList from "@/components/Collection/LinkVisitorsList";
import { useWindowSize } from "@/hooks";
import { useCollections } from "@/hooks/use-collections";
import { Link } from "@/programs/collections/types";
import { Breakpoints } from "@/types";
import { useCustomTheme } from "@/brand/themes/theme";

enum Mode {
	List,
	Details
}

type Props = {};

const newLinkDefaultState: Link = {
	id: "",
	title: "",
	destinationUrl: "",
	publicUrl: "",
	createdAt: 0,
	hits: 0,
	redirects: 0,
	isArchived: false
};

const Collections: React.FC<Props> = () => {
	const { width: windowWidth } = useWindowSize();
	const { isLoading, links, currentLink, setCurrentLink } = useCollections();
	const [newLinkDestinationUrl, setNewLinkDestinationUrl] =
		useState<string>("");
	const [isCreating, setIsCreating] = useState<boolean>(false);
	const [newLink, setNewLink] = useState<Link>(newLinkDefaultState);
	const [mode, setMode] = useState<Mode>(Mode.List);
	const { colors } = useCustomTheme();

	const createNewLink = useCallback(() => {
		setNewLink({
			...newLinkDefaultState,
			destinationUrl: newLinkDestinationUrl
		});
		setIsCreating(true);
	}, [newLinkDestinationUrl]);

	const handleSelect = useCallback(
		(link: Link) => {
			setCurrentLink(link);
			setMode(Mode.Details);
		},
		[setCurrentLink]
	);

	const handleLinkEditorClose = useCallback(() => {
		setIsCreating(false);
		setNewLinkDestinationUrl("");
	}, []);

	if (isLoading) {
		return (
			<Pane
				height="100%"
				display="flex"
				alignItems="center"
				justifyContent="center"
				overflow="hidden"
			>
				<Spinner size={24} marginRight={10} />
				<Heading is="h4" size={600} fontWeight={900}>
					Loading Links...
				</Heading>
			</Pane>
		);
	}

	return (
		<>
			<Pane display="flex" alignItems="center" marginY="20px" gap="15px">
				{(windowWidth > Breakpoints.xLarge || mode === Mode.List) && (
					<>
						{links && links.length > 0 && (
							<Text flex="0.8" fontSize="20px">
								{`${pluralize("Result", links.length, true)} Found`}
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
						<Button appearance="primary" size="large" onClick={createNewLink}>
							Create Link
						</Button>
					</>
				)}
				{windowWidth < Breakpoints.xLarge && mode === Mode.Details && (
					<Button onClick={() => setMode(Mode.List)}>
						&lt;&lt; Back to List
					</Button>
				)}
			</Pane>
			{(!links || links.length === 0) && (
				<Pane paddingX={16} marginTop={40}>
					<Heading size={700} marginBottom={8}>
						Create your first Collection Link
					</Heading>
					<Paragraph size={500} marginBottom={24} fontSize="1.1em">
						You do not have any active Collection Link. Create a new Link to get
						started.
					</Paragraph>
					<Button
						appearance="primary"
						minWidth={300}
						height={majorScale(7)}
						onClick={createNewLink}
					>
						<Strong color="#fff" size={500} fontSize="1.2em">
							👉&nbsp;&nbsp;Get started
						</Strong>
					</Button>
				</Pane>
			)}
			{links && links.length > 0 && (
				<Pane
					flex="1"
					display="flex"
					gap="20px"
					padding="20px"
					backgroundColor={colors.gray75}
					borderRadius="12px"
					overflow="hidden"
				>
					{(windowWidth > Breakpoints.xLarge || mode === Mode.List) && (
						<Pane
							flex="30%"
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
							<LinksList onSelect={handleSelect} />
						</Pane>
					)}
					{(windowWidth > Breakpoints.xLarge || mode === Mode.Details) &&
						currentLink && (
							<Pane
								flex="70%"
								display="flex"
								flexDirection="column"
								overflow="hidden"
							>
								<LinkDetails onEditorClose={() => handleLinkEditorClose()} />
								<LinkVisitorsList />
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
		</>
	);
};

export default Collections;
