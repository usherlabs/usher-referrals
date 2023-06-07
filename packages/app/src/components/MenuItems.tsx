import { MenuItem } from "@/menu";
import { useUser } from "@/hooks";
import { useRouteChange } from "@/hooks/use-route-change";
import Anchor from "@/components/Anchor";
import { Button, Label } from "evergreen-ui";
import { css, cx } from "@linaria/core";
import React from "react";
import { useCustomTheme } from "@/brand/themes/theme";

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
	const { colors } = useCustomTheme();
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
							color={colors.aWhite[5]}
							className={cx(
								css`
									// FIXME
									// we should replace with theme colors, but it does not work with linaria
									:hover {
										label {
											color: hsla(0, 0%, 0%, 0.85) !important;
										}
										svg {
											color: hsla(0, 0%, 0%, 0.75) !important;
										}
									}
								`,
								currentPathname === item.href
									? css`
											svg {
												color: hsla(0, 0%, 0%, 0.85) !important;
											}

											label {
												color: hsla(0, 0%, 0%, 0.95) !important;
											}

											background-color: hsla(0, 0%, 100%, 0.9) !important;
									  `
									: ""
							)}
							iconBefore={item.icon}
							marginBottom={1}
						>
							<Label
								fontSize={fontSize || (isSmall ? 16 : 20)}
								fontWeight={400}
								color={colors.aWhite[3]}
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
