import React, { useCallback } from "react";
import {
	Pane,
	Button,
	majorScale,
	Heading,
	Badge,
	Text,
	Label,
	ArrowRightIcon
} from "evergreen-ui";
import Image from "next/image";
import dnt from "date-and-time";

import { useUser } from "@/hooks/";
import EmailSubmit from "@/components/EmailSubmit";
import Anchor from "@/components/Anchor";

import MagicLinkIcon from "@/assets/icon/magic-icon.png";

const ProfileSettings: React.FC = () => {
	const {
		user: { verifications, profile }
	} = useUser();

	const onEmailSubmit = useCallback(async (value: string) => {
		// Do something with email
		// TODO: We need to store email in ArangoDB -- this graphed wallet mesh is what we're going to depend on for more than verificaiton.
	}, []);

	return (
		<Pane display="flex" flexDirection="column">
			<Pane marginBottom={32}>
				<Heading size={500} marginBottom={8}>
					Email Address
				</Heading>
				<EmailSubmit onSubmit={onEmailSubmit} value={profile.email} />
				<Text display="block" paddingTop={8}>
					Get notified when rewards are confirmed, and on other important
					updates to Usher.
				</Text>
			</Pane>
			<Pane
			// marginBottom={32}
			>
				<Heading size={500} marginBottom={8}>
					Personhood Verification
				</Heading>
				<Pane display="flex" alignItems="center">
					{verifications.personhood ? (
						<>
							<Badge color="green" marginRight={8}>
								Verified
							</Badge>
							<Text>
								on{" "}
								{dnt.format(
									new Date(verifications.personhood * 1000),
									"ddd, D MMM YYYY"
								)}
							</Text>
						</>
					) : (
						<Badge color="red">Required</Badge>
					)}
				</Pane>
			</Pane>
			{/* <Pane>
				<Anchor href="/magic/settings" external={true}>
					<Button
						appearance="minimal"
						iconBefore={() => (
							<Image src={MagicLinkIcon} width={25} height={25} />
						)}
						iconAfter={ArrowRightIcon}
						height={majorScale(6)}
					>
						<Label pointerEvents="none">Magic Settings</Label>
					</Button>
				</Anchor>
			</Pane> */}
		</Pane>
	);
};

export default ProfileSettings;
