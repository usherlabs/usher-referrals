import React, { useCallback, useState } from "react";
import { Badge, Heading, Pane, Text, toaster } from "evergreen-ui";
import dnt from "date-and-time";

import { useUser } from "@/hooks/";
import EmailSubmit from "@/components/EmailSubmit";
import handleException from "@/utils/handle-exception";
import VerifyPersonhoodDialog from "@/components/VerifyPersonhood/Dialog";
import VerifyPersonhoodButton from "@/components/VerifyPersonhood/Button";

const ProfileSettings: React.FC = () => {
	const {
		user: { verifications, profile },
		actions: { setProfile }
	} = useUser();
	const [isSubmitting, setSubmitting] = useState(false);
	const [showPHDialog, setShowPHDialog] = useState(false);

	const onEmailSubmit = useCallback(
		async (value: string) => {
			setSubmitting(true);
			try {
				const newProfile = {
					...profile,
					email: value
				};
				await setProfile(newProfile);
				toaster.success("Your profile has been updated!");
			} catch (e) {
				handleException(e);
				toaster.danger(
					"An issue occurred saving your profile. Please refresh and try again."
				);
			} finally {
				setSubmitting(false);
			}
		},
		[profile, setProfile]
	);

	return (
		<Pane display="flex" flexDirection="column">
			<Pane marginBottom={32}>
				<Heading size={500} marginBottom={8}>
					Email Address
				</Heading>
				<EmailSubmit
					onSubmit={onEmailSubmit}
					value={profile.email}
					loading={isSubmitting}
				/>
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
				<Pane>
					{verifications.personhood ? (
						<Pane display="flex" alignItems="center">
							<Badge color="green" marginRight={8}>
								Verified
							</Badge>
							{typeof verifications.personhood === "number" && (
								<Text>
									on{" "}
									{dnt.format(
										new Date(verifications.personhood),
										"ddd, D MMM YYYY"
									)}
								</Text>
							)}
						</Pane>
					) : (
						<>
							<Badge color="red">Required</Badge>
							<Pane marginTop={12}>
								<VerifyPersonhoodButton onClick={() => setShowPHDialog(true)} />
								<VerifyPersonhoodDialog
									isShown={showPHDialog}
									onClose={() => setShowPHDialog(false)}
								/>
							</Pane>
						</>
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
