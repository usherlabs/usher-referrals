import { css } from "@linaria/core";
import { Label, Pane, Table, Text } from "evergreen-ui";
import { useQuery } from "react-query";
import { format } from "timeago.js";

import * as api from "@/api";
import pascalCase from "@/utils/pascal-case";
import { LinkHit } from "../../programs/collections/types";

type Props = {
	linkId: string;
};

const getLinkHits = async (id: string): Promise<LinkHit[] | null> => {
	const response = await api.collections().getHits(id);

	if (!response.success) {
		return null;
	}

	return response.data;
};

const LinkVisitorsList: React.FC<Props> = ({ linkId }) => {
	const { data: hits } = useQuery({
		queryKey: ["linkHist", linkId],
		queryFn: async () => (await getLinkHits(linkId)) || []
	});

	return (
		<Pane flex="1" overflow="hidden">
			<Table
				display="flex"
				flexDirection="column"
				marginLeft="20px"
				backgroundColor="#FFFFFF"
				height="100%"
				border="1px solid #E1E2EB"
				borderRadius="8px"
			>
				<Table.Head
					height={50}
					backgroundColor="#FFF"
					textTransform="none"
					className={css`
						label,
						input {
							font-size: 1.1em;
							color: rgba(0, 0, 0, 0.75);
						}
					`}
				>
					<Table.TextHeaderCell flexGrow={2}>
						<Label>Address</Label>
					</Table.TextHeaderCell>
					<Table.TextHeaderCell flexGrow={1}>
						<Label>Last Activity</Label>
					</Table.TextHeaderCell>
					<Table.TextHeaderCell flexGrow={1}>
						<Label>Connection Type</Label>
					</Table.TextHeaderCell>
				</Table.Head>
				<Table.Body
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
					{hits?.map((hit) => (
						<Table.Row key={hit.id} height={50} fontSize={16} fontWeight={400}>
							<Table.Cell flexGrow={2}>
								<Text
									overflow="hidden"
									className={css`
										overflow-wrap: break-word;
										word-wrap: break-word;
									`}
								>
									{hit.address}
								</Text>
							</Table.Cell>
							<Table.Cell flexGrow={1}>
								<Text>{format(hit.lastActivityAt)}</Text>
							</Table.Cell>
							<Table.Cell flexGrow={1}>
								<Text>{pascalCase(hit.connection)}</Text>
							</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table>
		</Pane>
	);
};

export default LinkVisitorsList;
