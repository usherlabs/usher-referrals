import React from "react";
import { Pane, PaneProps, Paragraph, Spinner, Strong } from "evergreen-ui";

import ErrorText from "./ErrorText";

export type Props = PaneProps & {
	id: string;
	label?: string;
	description?: string | React.ElementType;
	placeholder?: string;
	error?: string;
	children?: React.ReactNode;
	isRequired?: boolean;
	iconLeft?: React.ElementType;
	iconRight?: React.ElementType;
	iconSize?: number;
	iconProps?: Record<string, any>;
	labelSize?: number;
	labelProps?: Record<string, any>;
	descriptionProps?: Record<string, any>;
	errorProps?: Record<string, any>;
	inputContainerProps?: Record<string, any>;
	isLoading?: boolean;
};

const InputField: React.FC<Props> = ({
	id,
	label,
	description,
	placeholder,
	error,
	children,
	isRequired,
	labelSize,
	labelProps,
	descriptionProps,
	errorProps,
	inputContainerProps,
	iconRight: IconRight,
	iconLeft: IconLeft,
	iconSize,
	iconProps,
	isLoading,
	...props
}) => {
	const inputPropsSetup = {
		spellCheck: false,
		required: isRequired,
		id,
		background: "inherit"
	};

	let Description: React.ElementType | undefined;
	if (typeof description !== "string" && React.isValidElement(description)) {
		Description = description;
	}

	return (
		<Pane width="100%" {...props}>
			<Pane width="100%">
				{(label || isRequired) && (
					<Pane
						is="label"
						display="block"
						htmlFor={id}
						marginBottom={6}
						{...labelProps}
					>
						{isRequired && (
							<Paragraph
								fontWeight={900}
								opacity="0.5"
								textTransform="uppercase"
								fontSize={10}
								letterSpacing={1}
							>
								Required
							</Paragraph>
						)}
						<Strong size={labelSize}>{label}</Strong>
					</Pane>
				)}
				{typeof description === "string" && description ? (
					<Paragraph marginBottom={12} width="100%" {...descriptionProps}>
						{description}
					</Paragraph>
				) : (
					Description && (
						<Pane marginBottom={12} width="100%" {...descriptionProps}>
							<Description />
						</Pane>
					)
				)}
			</Pane>
			<Pane
				display="flex"
				width="100%"
				flexDirection="row"
				alignItems="center"
				background="#fff"
				border
				borderRadius={8}
				overflow="hidden"
				padding={2}
				{...inputContainerProps}
			>
				{(isLoading || IconLeft) && (
					<Pane padding={12} display="flex" alignItems="center" {...iconProps}>
						{isLoading ? (
							<Spinner size={18} />
						) : (
							IconLeft && <IconLeft size={iconSize} />
						)}
					</Pane>
				)}
				<Pane flex={1} width="100%">
					{React.Children.map(children, (child) => {
						// See: https://stackoverflow.com/questions/55464194/how-to-define-typescript-for-react-children-map
						const elementChild = child as React.ReactElement;
						return React.cloneElement(elementChild, { ...inputPropsSetup });
					})}
				</Pane>
				{IconRight && (
					<Pane padding={12} display="flex" alignItems="center" {...iconProps}>
						<IconRight size={iconSize} />
					</Pane>
				)}
			</Pane>
			{!!error && <ErrorText {...errorProps} text={error} />}
		</Pane>
	);
};

InputField.defaultProps = {
	label: "",
	description: "",
	placeholder: "",
	error: "",
	children: undefined,
	isRequired: false,
	iconLeft: undefined,
	iconRight: undefined,
	iconSize: 16,
	iconProps: {},
	labelSize: 400,
	labelProps: {},
	descriptionProps: {},
	errorProps: {},
	inputContainerProps: {},
	isLoading: false
};

export default InputField;
