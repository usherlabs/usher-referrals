import { Button, RefreshIcon, SelectMenu } from "evergreen-ui";
import { useEVMChainSwitch } from "@/utils/chains/use-evm-chain-switch";

/**
 * provide a way for a user:
 * - know which chain is connected to
 * - know which chain it's actually supported
 * - change to a supported chain
 */
export const EVMChainLabelAndSwitcher = ({
	providerLabel,
	position,
	...props
}: {
	providerLabel?: string;
	position?: React.ComponentProps<typeof SelectMenu>["position"];
} & React.ComponentProps<typeof Button>) => {
	const { options, currentChains, setChain } = useEVMChainSwitch(providerLabel);
	return (
		<SelectMenu
			shouldCloseOnEscapePress={true}
			options={options}
			selected={currentChains.map((c) => c.id)}
			position={position}
			onSelect={({ value: chainId }) => {
				setChain({ chainId: chainId.toString() });
			}}
		>
			<Button {...props} size={"small"} iconAfter={<RefreshIcon />}>
				{currentChains[0]?.label ?? "Not connected"}
			</Button>
		</SelectMenu>
	);
};
