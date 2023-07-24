import React from "react";
import { Button, majorScale, Pane } from "evergreen-ui";
import Image from "next/image";

import { Connections } from "@usher.so/shared";
import { useUser } from "@/hooks/";
import { connectionImages } from "@/utils/images-map";
import pascalCase from "@/utils/pascal-case";

const LogoutManager: React.FC = () => {
	const {
		user: { wallets },
		actions: { disconnect }
	} = useUser();

	return (
		<Pane display="flex" flexDirection="column">
			{wallets
				.reduce<Connections[]>((acc, wallet) => {
					if (!acc.includes(wallet.connection)) {
						acc.push(wallet.connection);
					}
					return acc;
				}, [])
				.map((connection) => {
					return (
						<Pane
							key={connection}
							display="flex"
							justifyContent="center"
							alignContent="center"
						>
							<Button
								height={majorScale(7)}
								iconBefore={
									<Image
										src={connectionImages[connection]}
										width={30}
										height={30}
									/>
								}
								onClick={() => disconnect(connection)}
								minWidth={300}
								marginBottom={8}
							>
								<strong>Logout of {pascalCase(connection)}</strong>
							</Button>
						</Pane>
					);
				})}
		</Pane>
	);
};

export default LogoutManager;
