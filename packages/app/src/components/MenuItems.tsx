import { MenuItem } from "@/menu";
import { useUser } from "@/hooks";
import { useRouteChange} from "@/hooks/use-route-change";
import Anchor from "@/components/Anchor";
import { Button, Label } from "evergreen-ui";
import { css, cx } from "@linaria/core";
import React from "react";

export const MenuItems = ({
	items,
	isSmall = false,
	fontSize
}: {
	items: MenuItem[];
	isSmall?: boolean;
	fontSize?: number;
}) => {
	const { isAuthenticated } = useUser();
	const { currentPathname } = useRouteChange();
	return (
		<>
			{items
				.filter((item) => !item.isSecured || isAuthenticated)
				.map((item) => (
					<Anchor
						key={item.text}
						href={item.href}
						external={item.isExternal || false}
					>
						<Button
							appearance="minimal"
							borderRadius="10px"
							boxShadow="none !important"
							width="100%"
							height={isSmall ? 42 : 52}
							display="flex"
							justifyContent="start"
							className={cx(
								css`
									:hover label {
										color: #000 !important;
									}
								`,
								currentPathname === item.href
									? css`
											 {
												background-color: #ffffff;
											}
									  `
									: ""
							)}
							iconBefore={item.icon}
							marginBottom={1}
						>
							<Label
								fontSize={fontSize || (isSmall ? 16 : 20)}
								fontWeight={400}
								color="#7F92A4"
								pointerEvents="none"
							>
								{item.text}
							</Label>
						</Button>
					</Anchor>
				))}
		</>
	);
};
