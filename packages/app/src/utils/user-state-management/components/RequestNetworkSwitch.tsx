import { CornerDialog, Pane, Text } from "evergreen-ui";
import { useAtomValue } from "jotai";
import { utilStateAtoms } from "@/utils/user-state-management/atoms/util-states";
import { EVMChainLabelAndSwitcher } from "@/components/connect/EVMChainSwitch/EVMChainLabelAndSwitcher";
import { useCustomTheme } from "@/brand/themes/theme";

export const RequestNetworkSwitch = () => {
	const connectedToUnsupportedChains = useAtomValue(
		utilStateAtoms.connectedToUnsupportedChains
	);
	const { colors } = useCustomTheme();

	return (
		<CornerDialog
			title={"Switch to a supported network"}
			isShown={connectedToUnsupportedChains}
			hasFooter={false}
			hasClose={false}
		>
			<Pane display={"flex"} flexDirection={"column"}>
				<Text>You are not connected to any supported chains.</Text>
				<EVMChainLabelAndSwitcher
					marginTop={8}
					alignSelf={"flex-end"}
					intent={"primary"}
					appearance={"primary"}
					style={{
						color: colors.white[1]
					}}
				/>
			</Pane>
		</CornerDialog>
	);
};
