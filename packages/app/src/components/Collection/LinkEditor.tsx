import pascalCase from "@/utils/pascal-case";
import { Connections } from "@usher.so/shared";
import {
	Button,
	Checkbox,
	Dialog,
	FormField,
	Heading,
	majorScale,
	Pane,
	Paragraph,
	Textarea,
	TextInput
} from "evergreen-ui";
import { ChangeEvent, useCallback, useState } from "react";

import { useCollections } from "@/hooks/use-collections";
import { useCustomTheme } from "@/brand/themes/theme";
import { Link } from "../../programs/collections/types";
import Anchor from "../Anchor";

type Props = {
	link: Link;
	onClose: () => void;
};

const LinkEditor: React.FC<Props> = ({ link, onClose }) => {
	const { isSaving, createLink, updateLink, archiveLink } = useCollections();

	const [title, setTitile] = useState(link.title);
	const [destinationUrl, setDestinationUrl] = useState(link.destinationUrl);
	const [connections, setConnections] = useState<Set<Connections>>(
		new Set<Connections>(link.connections)
	);
	const [isConfirmationShown, setIsConfirmationShown] = useState(false);

	const handleConnectionsChange = useCallback(
		(connection: Connections, checked: boolean) => {
			const newConnections = new Set<Connections>([...connections]);

			if (checked) {
				newConnections.add(connection);
			} else {
				newConnections.delete(connection);
			}

			setConnections(newConnections);
		},
		[connections]
	);

	const handleSave = useCallback(async () => {
		const payload = {
			title,
			destinationUrl,
			connections: [...connections.values()]
		};

		if (link.id) {
			await updateLink(link.id, payload);
		} else {
			await createLink(payload);
		}
		onClose();
	}, [
		title,
		destinationUrl,
		connections,
		link.id,
		onClose,
		updateLink,
		createLink
	]);

	const handleArchive = useCallback(async () => {
		await archiveLink(link.id);
		onClose();
	}, [archiveLink, link.id, onClose]);

	const { colors } = useCustomTheme();

	return (
		<Pane display="flex" flexDirection="column" height="100%">
			<Pane
				paddingTop={40}
				paddingX={40}
				marginBottom={24}
				paddingBottom={20}
				borderBottomWidth="1px"
				borderBottomColor={colors.gray400}
				borderBottomStyle="solid"
			>
				<Heading size={700}>{link.id ? "Edit Link" : "New Link"}</Heading>
			</Pane>
			<Pane
				flexGrow="1"
				display="flex"
				flexDirection="column"
				paddingTop={10}
				paddingX={40}
				marginBottom={16}
			>
				<FormField label="Title" paddingBottom={majorScale(2)}>
					<TextInput
						width="100%"
						value={title}
						autoFocus
						disabled={isSaving}
						onChange={(e: { target: { value: any } }) =>
							setTitile(e.target.value)
						}
					/>
				</FormField>
				<FormField label="Destination URL" paddingBottom={majorScale(2)}>
					<Textarea
						fontSize="16px"
						resize="vertical"
						value={destinationUrl}
						disabled={isSaving}
						onChange={(e: { target: { value: any } }) =>
							setDestinationUrl(e.target.value)
						}
					/>
				</FormField>
				<FormField label="Connections" paddingBottom={majorScale(2)}>
					{Object.values(Connections).map((connection) => {
						return (
							<Checkbox
								key={connection}
								label={pascalCase(connection)}
								checked={connections.has(connection)}
								disabled={isSaving}
								onChange={(e: ChangeEvent<HTMLInputElement>) =>
									handleConnectionsChange(connection, e.target.checked)
								}
							/>
						);
					})}
				</FormField>
			</Pane>
			<Pane
				paddingX={40}
				marginTop={24}
				paddingTop={20}
				borderTopWidth="1px"
				borderTopColor={colors.gray400}
				borderTopStyle="solid"
				paddingBottom={40}
				display="flex"
				gap={majorScale(2)}
			>
				{link.id && (
					<Button
						intent="danger"
						disabled={isSaving}
						onClick={() => setIsConfirmationShown(true)}
					>
						Archive Link
					</Button>
				)}
				<Button marginLeft="auto" disabled={isSaving} onClick={onClose}>
					Cancel
				</Button>
				<Button appearance="primary" isLoading={isSaving} onClick={handleSave}>
					Save
				</Button>
			</Pane>
			<Dialog
				hasCancel={!isSaving}
				isConfirmLoading={isSaving}
				isShown={isConfirmationShown}
				title="Archive Link"
				intent="danger"
				onCloseComplete={() => setIsConfirmationShown(false)}
				onConfirm={() => handleArchive()}
				confirmLabel="Archive Link"
			>
				<Paragraph>
					Archiving this link will redirect anyone who clicks on it to&nbsp;
					<Anchor href="/410" target="_blank">
						our error page
					</Anchor>
					.
				</Paragraph>
				<Paragraph>This action cannot be undone.</Paragraph>
				<Paragraph>Are you sure you want to archive this link?</Paragraph>
			</Dialog>
		</Pane>
	);
};

export default LinkEditor;
