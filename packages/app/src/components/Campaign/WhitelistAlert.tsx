import React from "react";
import {
	Alert,
	Button,
	ListItem,
	majorScale,
	NewPersonIcon,
	Pane,
	Strong,
	UnorderedList
} from "evergreen-ui";
import { css, cx } from "@linaria/core";

import { Partnership } from "@usher.so/partnerships";
import Anchor from "@/components/Anchor";
import { useUser } from "@/hooks";
import { useCustomTheme } from "@/brand/themes/theme";
// import { UilExternalLinkAlt } from "@iconscout/react-unicons";

export type Props = {
	whitelist: {
		externalLink: string;
		partners: string[];
	};
	partnership: Partnership | string | null;
};

const WhitelistAlert: React.FC<Props> = ({ partnership, whitelist }) => {
	const { colors } = useCustomTheme();
	const {
		user: { partnerships, profile }
	} = useUser();
	let isWhitelisted = false;
	partnerships.forEach((p) => {
		if (whitelist.partners.includes(p.id)) {
			isWhitelisted = true;
		}
	});

	let { externalLink } = whitelist;
	const url = new URL(externalLink);
	if (partnership) {
		url.searchParams.set(
			"partnership",
			typeof partnership === "string" ? partnership : partnership.id
		);
	}
	if (profile.email) {
		url.searchParams.set("email", profile.email);
	}
	externalLink = url.toString();

	return (
		<Alert
			intent={isWhitelisted ? "success" : "danger"}
			title={
				isWhitelisted
					? `You are an Approved Partner!`
					: `Approved Partners Only`
			}
			className={cx(
				css`
					h4 {
						font-size: 1em;
						margin: 1px 0 10px 0;
						font-weight: 900;
					}

					li,
					strong {
						font-size: inherit;
					}

					svg {
						height: 20px;
						width: 20px;
					}
				`,
				isWhitelisted
					? css`
							display: flex;
							align-items: center;

							h4 {
								margin: 0 !important;
							}
					  `
					: null
			)}
			fontSize="0.95em"
		>
			{isWhitelisted ? null : (
				<Pane>
					<UnorderedList marginBottom={12}>
						<ListItem>
							This campaign requires that Partners pass an application &amp;
							review process to be approved.
						</ListItem>
						<ListItem>
							Referrals and rewards are only processed for Approved Partners.
						</ListItem>
						{!partnership && (
							<ListItem>
								<Strong>
									Start the partnership below to reveal your application Link
								</Strong>
							</ListItem>
						)}
					</UnorderedList>
					{partnership && (
						<Anchor href={externalLink} external>
							<Button
								height={majorScale(5)}
								iconBefore={<NewPersonIcon color={colors.gray800} />}
								className={css`
									svg {
										width: 25px;
										height: 25px;
									}
								`}
							>
								<Strong>Apply to this Partnership Program</Strong>
							</Button>
						</Anchor>
					)}
				</Pane>
			)}
		</Alert>
	);
};

export default WhitelistAlert;
