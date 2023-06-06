/**
 * Component to show Value of a Commission or Reward with Icons or a Ticker
 */

import React from "react";
import { Label, Pane, Spinner, Text } from "evergreen-ui";

import { css } from "@linaria/core";
import * as mediaQueries from "@/utils/media-queries";

type Props = {
	value: string | number | React.ReactNode;
	id: string;
	label: string;
	iconLeft?: React.ElementType;
	iconRight?: React.ElementType;
	isLoading?: boolean;
	iconProps?: Record<string, any>;
	labelProps?: Record<string, any>;
};

const Metric: React.FC<Props> = ({
	value,
	id,
	label,
	iconRight: IconRight,
	iconLeft: IconLeft,
	iconProps = {},
	labelProps = {},
	isLoading = false
}) => {
	return (
		<Pane
			id={id}
			paddingX={20}
			paddingY={15}
			paddingBottom={25}
			className={css`
				${mediaQueries.isSmall} {
					padding-top: 25px !important;
					padding-bottom: 25px !important;
				}
			`}
		>
			<Pane
				display="flex"
				flexDirection="row"
				justifyContent="space-between"
				marginBottom={12}
			>
				<Pane display="flex" flexDirection="row">
					{IconLeft && <IconLeft marginRight={8} {...iconProps} />}
					<Label opacity={0.8} margin={0} {...labelProps}>
						{label}
					</Label>
				</Pane>
				{IconRight && <IconRight {...iconProps} />}
			</Pane>
			<Pane>
				{isLoading ? (
					<Spinner size={24} />
				) : (
					<Text fontSize="2em">{value}</Text>
				)}
			</Pane>
		</Pane>
	);
};

export default Metric;
