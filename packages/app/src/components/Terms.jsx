/**
 * This is a configurable Terms & Conditions Alert for Affiliates
 * Affiliates are partnering with Advertisers, so terms are vital for Advertisers to configure and for Affiliates to read
 * TODO: Make this configurable
 */

import React from "react";
import {
	Alert,
	UnorderedList,
	ListItem,
	Strong,
	Paragraph
} from "evergreen-ui";

const Terms = () => {
	return (
		<Alert intent="none" title="Referral Program Terms & Conditions">
			<UnorderedList marginBottom={12}>
				<ListItem>
					Rewards are paid in <Strong>Arweave (AR)</Strong>{" "}
					<Strong>Tokens</Strong>
				</ListItem>
				<ListItem>
					Affiliates can earn <Strong>0.15 AR</Strong> per referral
				</ListItem>
				<ListItem>
					The program will end once <Strong>60 AR</Strong> have been claimed
				</ListItem>
			</UnorderedList>
			<Paragraph size={300}>
				Usher software is in ALPHA. Please refer responsibly.
			</Paragraph>
		</Alert>
	);
};

export default Terms;
