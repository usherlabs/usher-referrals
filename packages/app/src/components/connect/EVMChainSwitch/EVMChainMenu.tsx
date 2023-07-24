import { Button, SelectMenu } from "evergreen-ui";
import type { Chain } from "@web3-onboard/common";
import { useEVMChainSwitch } from "@/utils/chains/use-evm-chain-switch";

const getChainLabel = (chainId: string, availableChains: Chain[]) => {
	const chain = availableChains.find((c) => c.id === chainId);
	return chain?.label ?? "Unknown chain";
};

function getConnectedChainsLabel({
	currentChains,
	availableChains
}: {
	currentChains: Chain[];
	availableChains: Chain[];
}) {
	if (currentChains.length === 0) {
		return "Select a chain";
	}
	const connectedChains = currentChains.map((c) =>
		getChainLabel(c.id, availableChains)
	);
	let label = connectedChains[0];
	if (connectedChains.length > 1) {
		label += ` + ${connectedChains.length - 1} chains`;
	}
	return label;
}

/**
 * provide a way for a user:
 * - know which chain is connected to
 * - know which chain it's actually supported
 * - change to a supported chain
 */
export const EVMChainMenu = () => {
	const { options, currentChains, setChain, availableChains } =
		useEVMChainSwitch();
	return (
		<SelectMenu
			isMultiSelect
			shouldCloseOnEscapePress={true}
			options={options}
			selected={currentChains.map((c) => c.id)}
			onSelect={({ value: chainId }) => {
				setChain({ chainId: chainId.toString() });
			}}
		>
			<Button>
				{getConnectedChainsLabel({
					currentChains,
					availableChains
				})}
			</Button>
		</SelectMenu>
	);
};
