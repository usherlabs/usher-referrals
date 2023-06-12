import React, { useState } from "react";
import { Alert, ListItem, UnorderedList } from "evergreen-ui";
import { css } from "@linaria/core";

import Dialog from "./Dialog";
import Button from "./Button";

const VerifyPersonhoodAlert = () => {
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
				<Button onClick={() => setShowDialog(true)} />
			</Alert>
			<Dialog isShown={showDialog} onClose={() => setShowDialog(false)} />
		</>
	);
};

export default VerifyPersonhoodAlert;
