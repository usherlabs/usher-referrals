import { css } from "@linaria/core";
import date from "date-and-time";
import { Pane, Text } from "evergreen-ui";

import { TextFit } from "@/components/TextFit";
import { useCollections } from "@/hooks/use-collections";
import { Link } from "@/programs/collections/types";
import { getCollectionLink } from "@/utils/get-collection-link";
import { useCustomTheme } from "@/brand/themes/theme";
import LinkChart from "./LinkChart";

type Props = {
	onSelect: (link: Link) => void;
};

const LinksList: React.FC<Props> = ({ onSelect }) => {
	const { links, currentLink } = useCollections();
	const { colors } = useCustomTheme();
	return (
		<Pane>
			{links.map((link) => (
				<Pane
					key={link.id}
					margin="20px"
					border={
						link.id === currentLink?.id
							? `1px solid ${colors.link}`
							: `1px solid ${colors.gray300}`
					}
					borderRadius="8px"
					cursor="pointer"
					className={css`
						transition: all 0.25s;
						box-shadow: none;
						transform: translateY(0);

						&:hover {
							// Right now, if we use theme colors here, linaria will throw errors
							// border: 1px solid \${colors.link};
							border: 1px solid #2c9cf2;
						}
					`}
					onClick={() => onSelect(link)}
				>
					<Pane
						padding="15px"
						display="flex"
						justifyContent="space-between"
						borderBottom="1px solid rgba(225, 226, 235, 0.5)"
					>
						<Text fontSize="18px" fontWeight="500" marginRight="12px">
							{link.title}
						</Text>
						<Text textAlign="right">
							{date.format(new Date(link.createdAt), "DD MMM, YYYY", true)}
						</Text>
					</Pane>
					<Pane
						padding="15px"
						display="flex"
						alignItems="flex-end"
						justifyContent="space-between"
					>
						<TextFit marginRight="12px" fontSize="16px" color={colors.link}>
							{getCollectionLink(link.id, { removeProto: true })}
						</TextFit>
						<LinkChart link={link} isActive={link.id === currentLink?.id} />
					</Pane>
				</Pane>
			))}
		</Pane>
	);
};

export default LinksList;
