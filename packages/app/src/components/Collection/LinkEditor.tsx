import pascalCase from "@/utils/pascal-case";
import { Connections } from "@usher.so/shared";
import {
	Button,
	Checkbox,
	FormField,
	Heading,
	majorScale,
	Pane,
	Textarea,
	TextInput,
	useTheme
} from "evergreen-ui";
import { ChangeEvent, useCallback, useState } from "react";

import { Link } from "./types";

type Props = {
	link: Link;
	onClose: () => void;
};

const LinkEditor: React.FC<Props> = ({ link, onClose }) => {
	const [title, setTitile] = useState(link.title);
	const [destinationUrl, setDestinationUrl] = useState(link.destinationUrl);
	const [connections, setConnections] = useState<Set<Connections>>(
		new Set<Connections>(link.conncections)
	);

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

	const handleSave = useCallback(() => {
		onClose();
	}, []);

	const handleDelete = useCallback(() => {
		onClose();
	}, []);

	const { colors } = useTheme();

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
			>
				<Button appearance="primary" onClick={handleSave}>
					Save
				</Button>
				<Button onClick={onClose}>Cancel</Button>
				{link.id && (
					<Button appearance="danger" onClick={handleDelete}>
						Delete Link
					</Button>
				)}
			</Pane>
		</Pane>
	);
};

export default LinkEditor;
