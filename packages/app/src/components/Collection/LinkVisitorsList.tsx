import { css } from "@linaria/core";
import { Pane, Table } from "evergreen-ui";
import { useQuery } from "react-query";
import { format } from "timeago.js";

import * as api from "@/api";
import { LinkHit } from "./types";

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
	const hits =
		useQuery(["linkHist", linkId], () => getLinkHits(linkId)).data || [];

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
					fontSize={18}
					fontWeight={500}
					textTransform="none"
				>
					<Table.TextHeaderCell flexGrow={2}>Address</Table.TextHeaderCell>
					<Table.TextHeaderCell flexGrow={1}>
						Last Activity
					</Table.TextHeaderCell>
					<Table.TextHeaderCell flexGrow={1}>
						Connection Type
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
					{hits.map((hit) => (
						<Table.Row key={hit.id} height={50} fontSize={16} fontWeight={400}>
							<Table.Cell flexGrow={2}>{hit.address}</Table.Cell>
							<Table.Cell flexGrow={1}>{format(hit.lastActivityAt)}</Table.Cell>
							<Table.Cell flexGrow={1}>{hit.connection}</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table>
		</Pane>
	);
};

export default LinkVisitorsList;
