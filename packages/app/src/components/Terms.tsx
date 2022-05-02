/**
 * This is a configurable Terms & Conditions Alert for Affiliates
 * Affiliates are partnering with Advertisers, so terms are vital for Advertisers to configure and for Affiliates to read
 */

import React from "react";
import {
	Alert,
	UnorderedList,
	ListItem,
	Strong,
	Paragraph,
	Spinner
} from "evergreen-ui";
import startCase from "lodash/startCase";

import { useContract } from "@/hooks/";

const Terms: React.FC = () => {
	const {
		contract: {
			// strategy,
			rate,
			token: { name, ticker, type },
			limit
		},
		isLoading
	} = useContract();

	let tokenTypeOutput = `Token`;
	if (["nft", "pst"].includes(type)) {
		tokenTypeOutput = type.toUpperCase();
	}

	const tokentickerOutput = ticker.toUpperCase();
	const tokenNameOutput = startCase(name);

	return (
		<Alert intent="none" title="Referral Program Terms & Conditions">
			{isLoading ? (
				<Spinner size={24} margin={12} />
			) : (
				<UnorderedList marginBottom={12}>
					<ListItem>
						Rewards are paid in{" "}
						<Strong>
							{tokenNameOutput} ({tokentickerOutput})
						</Strong>{" "}
						<Strong>{tokenTypeOutput}s</Strong>
					</ListItem>
					<ListItem>
						Affiliates can earn{" "}
						<Strong>
							{rate} {tokentickerOutput}
						</Strong>{" "}
						per referral
					</ListItem>
					{limit > 0 && (
						<ListItem>
							The program will end once{" "}
							<Strong>
								{limit} {tokentickerOutput}
							</Strong>{" "}
							have been claimed
						</ListItem>
					)}
				</UnorderedList>
			)}
			<Paragraph size={300}>
				Usher software is in ALPHA. Please refer responsibly.
			</Paragraph>
		</Alert>
	);
};

export default Terms;
