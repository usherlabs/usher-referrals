import {
	UilAnalytics,
	UilClockFive,
	UilCornerDownRight
} from "@iconscout/react-unicons";
import date from "date-and-time";
import { Button, Pane, Text, toaster } from "evergreen-ui";
import pluralize from "pluralize";
import { useCallback, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";

import SideSheet from "@/components/SideSheet";
import { TextFit } from "@/components/TextFit";
import { useCollections } from "@/hooks/use-collections";
import { getCollectionLink } from "@/utils/get-collection-link";
import { useCustomTheme } from "@/brand/themes/theme";
import LinkEditor from "./LinkEditor";

type Props = {
	onEditorClose: () => void;
};

const LinkDetails: React.FC<Props> = ({ onEditorClose }) => {
	const { currentLink } = useCollections();
	const { colors } = useCustomTheme();

	const [isEditing, setIsEditing] = useState<boolean>(false);

	const handleLinkEditorClose = useCallback(() => {
		setIsEditing(false);
		onEditorClose();
	}, [onEditorClose]);

	const onCopy = useCallback(async () => {
		toaster.notify("Copied!", {
			id: "copied"
		});
	}, []);

	return (
		<Pane>
			{!currentLink && <Text>No Link</Text>}
			{currentLink && (
				<>
					<Pane
						marginBottom="20px"
						padding="20px"
						display="flex"
						flexDirection="column"
						backgroundColor="#FFFFFF"
						border={`1px solid ${colors.gray300}`}
						borderRadius="8px"
					>
						<Pane display="flex" justifyContent="space-between" gap="1em">
							<Text fontSize="20px" fontWeight="500">
								{currentLink.title}
							</Text>
							<Button
								width="73px"
								minWidth="73px"
								onClick={() => setIsEditing(true)}
							>
								Edit
							</Button>
						</Pane>
						<Pane
							display="flex"
							alignItems="center"
							color={colors.gray700}
							marginTop="12px"
							marginBottom="15px"
						>
							<Pane
								width="20px"
								height="20px"
								display="flex"
								alignItems="center"
								justifyContent="center"
								background="rgba(87, 93, 114, 0.1)"
								borderRadius="50%"
							>
								<UilClockFive size="16px" />
							</Pane>
							<Text marginLeft="4px" fontSize="16px">
								{date.format(
									new Date(currentLink.createdAt),
									"MMMM D, YYYY hh:mm A [GMT]ZZ",
									true
								)}
							</Text>
						</Pane>
						<Pane display="flex" alignItems="center">
							<UilAnalytics size="24px" />
							<Text marginLeft="4px" fontSize="18px" fontWeight="500">
								{pluralize("Hit", currentLink.hits, true)}
							</Text>
						</Pane>
					</Pane>
					<Pane
						marginBottom="20px"
						padding="20px"
						display="flex"
						flexDirection="column"
						backgroundColor="#FFFFFF"
						border={`1px solid ${colors.gray300}`}
						borderRadius="8px"
					>
						<Pane display="flex" justifyContent="space-between" gap="1em">
							<TextFit fontSize="20px" fontWeight="500" color={colors.link}>
								{getCollectionLink(currentLink.id, { removeProto: true })}
							</TextFit>
							<CopyToClipboard
								text={getCollectionLink(currentLink.id)}
								onCopy={onCopy}
							>
								<Button width="73px" minWidth="73px">
									Copy
								</Button>
							</CopyToClipboard>
						</Pane>
						<Text marginLeft="4px" fontSize="18px" fontWeight="500">
							{pluralize("Click", currentLink.redirects, true)}
						</Text>
						<Pane
							paddingX="12px"
							paddingY="10px"
							display="flex"
							alignItems="center"
							backgroundColor={colors.gray75}
							borderRadius="10px"
						>
							<UilCornerDownRight size="32px" color={colors.gray700} />
							<TextFit marginLeft="10px" fontSize="16px">
								{currentLink.destinationUrl}
							</TextFit>
						</Pane>
					</Pane>
					<SideSheet
						shouldShowCloseButton={false}
						isShown={isEditing}
						onCloseComplete={handleLinkEditorClose}
					>
						<LinkEditor link={currentLink} onClose={handleLinkEditorClose} />
					</SideSheet>
				</>
			)}
		</Pane>
	);
};

export default LinkDetails;
