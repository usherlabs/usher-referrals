import {
	UilAnalytics,
	UilClockFive,
	UilCornerDownRight,
	UilEllipsisV
} from "@iconscout/react-unicons";
import date from "date-and-time";
import { Button, Pane, Text } from "evergreen-ui";
import { Link } from "./types";

type Props = {
	link: Link;
};

const LinkDetails: React.FC<Props> = ({ link }) => {
	return (
		<Pane marginLeft="20px">
			<Pane
				marginBottom="20px"
				padding="20px"
				display="flex"
				flexDirection="column"
				backgroundColor="#FFFFFF"
				border="1px solid #E1E2EB"
				borderRadius="8px"
			>
				<Pane display="flex" justifyContent="space-between">
					<Text fontSize="20px" fontWeight="500">
						{link.title}
					</Text>
					<Pane>
						<Button>Edit</Button>
						<Button appearance="minimal">
							<UilEllipsisV />
						</Button>
					</Pane>
				</Pane>
				<Pane
					display="flex"
					alignItems="center"
					color="#575D72"
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
							new Date(link.createdAt),
							"MMMM D, YYYY hh:mm A [GMT]ZZ",
							true
						)}
					</Text>
				</Pane>
				<Pane display="flex" alignItems="center">
					<UilAnalytics size="24px" />
					<Text marginLeft="4px" fontSize="18px" fontWeight="500">
						{link.hits} Links Hits
					</Text>
				</Pane>
			</Pane>
			<Pane
				marginBottom="20px"
				padding="20px"
				display="flex"
				flexDirection="column"
				backgroundColor="#FFFFFF"
				border="1px solid #E1E2EB"
				borderRadius="8px"
			>
				<Pane display="flex" justifyContent="space-between">
					<Text fontSize="20px" fontWeight="500" color="#2C9CF2">
						{link.publicUrl}
					</Text>
					<Pane>
						<Button>Copy</Button>
						<Button appearance="minimal">
							<UilEllipsisV />
						</Button>
					</Pane>
				</Pane>
				<Text
					fontSize="18px"
					fontWeight="500"
					marginTop="10px"
					marginBottom="15px"
				>
					1 Click
				</Text>
				<Pane
					paddingX="12px"
					paddingY="10px"
					display="flex"
					alignItems="center"
					backgroundColor="#F9FAFC"
					borderRadius="10px"
				>
					<UilCornerDownRight color="#575D72" />
					<Text marginLeft="10px">{link.destinationUrl}</Text>
				</Pane>
			</Pane>
		</Pane>
	);
};

export default LinkDetails;
