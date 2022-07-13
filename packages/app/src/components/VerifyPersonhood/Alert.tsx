import React, { useState } from "react";
import {
	Alert,
	Button,
	Strong,
	majorScale,
	useTheme,
	UnorderedList,
	ListItem
} from "evergreen-ui";
import { UilDna } from "@iconscout/react-unicons";
import { css } from "@linaria/core";

import Dialog from "./Dialog";

const VerifyPersonhoodAlert = () => {
	const { colors } = useTheme();
	const [showDialog, setShowDialog] = useState(false);

	return (
		<>
			<Alert
				intent="warning"
				title="Verified Partners Only"
				className={css`
					h4 {
						font-size: 1em;
						margin: 1px 0 10px 0;
					}
					li,
					strong {
						font-size: inherit;
					}
					svg {
						height: 20px;
						width: 20px;
					}
				`}
			>
				<UnorderedList marginBottom={12}>
					<ListItem>
						This campaign requires additional verification from Partners.
					</ListItem>
					<ListItem>
						Referrals and rewards are only processed for Verified Partners.
					</ListItem>
				</UnorderedList>
				<Button
					height={majorScale(5)}
					onClick={() => setShowDialog(true)}
					iconBefore={<UilDna color={colors.gray800} />}
					className={css`
						svg {
							width: 25px;
							height: 25px;
						}
					`}
				>
					<Strong>Verify your personhood</Strong>
				</Button>
			</Alert>
			<Dialog isShown={showDialog} onClose={() => setShowDialog(false)} />
		</>
	);
};

export default VerifyPersonhoodAlert;
