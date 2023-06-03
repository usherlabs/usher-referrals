/**
 * Component to show Value of a Commission or Reward with Icons or a Ticker
 */

import React from "react";
import {
	Card,
	Heading,
	Label,
	Pane,
	PaneProps,
	Spinner,
	Text
} from "evergreen-ui";
import { useCustomTheme } from "@/brand/themes/theme";

type Props = PaneProps & {
	value: string | number | React.ReactNode;
	id: string;
	label: string;
	topLabel?: string;
	ticker?: string;
	iconLeft?: React.ElementType;
	iconRight?: React.ElementType;
	isLoading?: boolean;
	iconProps?: Record<string, any>;
	labelProps?: Record<string, any>;
};

const MetricCard: React.FC<Props> = ({
	value,
	ticker,
	id,
	label,
	topLabel,
	iconRight: IconRight,
	iconLeft: IconLeft,
	iconProps = {},
	labelProps = {},
	isLoading = false,
	...props
}) => {
	const { colors } = useCustomTheme();

	return (
		<Card
			elevation={0}
			id={id}
			paddingX={25}
			paddingY={20}
			background="tint2"
			borderRadius={8}
			{...props}
		>
			<Pane
				display="flex"
				flexDirection="row"
				justifyContent="space-between"
				marginBottom={12}
			>
				{IconLeft && <IconLeft {...iconProps} />}
				<Pane display="flex" flexDirection="row">
					{topLabel && (
						<Label opacity={0.5} margin={0} marginLeft={12} {...labelProps}>
							{topLabel}
						</Label>
					)}
					{IconRight && <IconRight marginLeft={8} {...iconProps} />}
				</Pane>
			</Pane>

			<Pane
				display="flex"
				flexDirection="row"
				alignItems="baseline"
				paddingTop={16}
			>
				{isLoading ? (
					<Spinner size={24} marginBottom={8} />
				) : (
					<>
						<Heading is="h5" size={900} margin={0}>
							{value}
						</Heading>
						{ticker && (
							<Text marginLeft={8} size={500} opacity={0.8}>
								{ticker}
							</Text>
						)}
					</>
				)}
			</Pane>
			<Pane>
				<Label color={colors.gray700}>{label}</Label>
			</Pane>
		</Card>
	);
};

export default MetricCard;
