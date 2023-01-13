import { css } from "@linaria/core";
import date from "date-and-time";
import { Pane, Text } from "evergreen-ui";
import { useCallback } from "react";

import LinkChart from "./LinkChart";
import { Link } from "./types";

type Props = {
	links: Link[];
	activeLink?: Link;
	onSelect?: (link: Link) => void;
};

const LinksList: React.FC<Props> = ({ links, activeLink, onSelect }) => {
	const handleClick = useCallback((link: Link) => {
		if (onSelect) {
			onSelect(link);
		}
	}, []);

	return (
		<Pane>
			{links.map((link) => (
				<Pane
					key={link.id}
					margin="20px"
					border={
						link.id === activeLink?.id
							? "1px solid #2c9cf2"
							: "1px solid #E1E2EB"
					}
					borderRadius="8px"
					cursor="pointer"
					className={css`
						transition: all 0.25s;
						box-shadow: none;
						transform: translateY(0);
						&:hover {
							border: 1px solid #2c9cf2;
						}
					`}
					onClick={() => handleClick(link)}
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
						<Text marginRight="12px" fontSize="16px" color="#2C9CF2">
							{link.publicUrl}
						</Text>
						<LinkChart link={link} isActive={link.id === activeLink?.id} />
					</Pane>
				</Pane>
			))}
		</Pane>
	);
};

export default LinksList;
