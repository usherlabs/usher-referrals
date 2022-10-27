import { Button, majorScale, Pane } from "evergreen-ui";
import Image from "next/image";
import React, { useMemo } from "react";

type Props = {
	text: string;
	icon: JSX.Element | any;
	isConnecting: boolean;
	onClick: () => void;
};

export const WalletConnectButton = ({
	text,
	icon,
	isConnecting,
	onClick
}: Props) => {
	const internalIcon = useMemo(() => {
		if (React.isValidElement(icon)) {
			return icon;
		}
		return <Image src={icon} width={30} height={30} />;
	}, [icon]);

	return (
		<Pane marginBottom={8}>
			<Button
				height={majorScale(7)}
				iconBefore={internalIcon}
				onClick={onClick}
				isLoading={isConnecting}
				minWidth={300}
			>
				<strong>{text}</strong>
			</Button>
		</Pane>
	);
};
