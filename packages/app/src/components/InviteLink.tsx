import React, { useCallback } from "react";
import { css } from "@linaria/core";
import { ClipboardIcon, PaneProps, TextInput, toaster } from "evergreen-ui";
import CopyToClipboard from "react-copy-to-clipboard";

import InputField from "@/components/InputField";
import { useCustomTheme } from "@/brand/themes/theme";

export type Props = PaneProps & {
	link?: string;
};

const InviteLink: React.FC<Props> = ({ link, ...props }) => {
	const { colors } = useCustomTheme();

	const onCopy = useCallback(() => {
		toaster.notify("Invite link has been copied!", {
			id: "link-copy"
		});
	}, []);

	return (
		<CopyToClipboard text={link || ""} onCopy={onCopy}>
			<InputField
				id="invite-link"
				iconRight={ClipboardIcon}
				iconSize={18}
				iconProps={{
					color: colors.gray600
				}}
				background="tint2"
				cursor="pointer"
				inputContainerProps={{
					className: css`
						:active {
							background: rgb(240, 240, 240) !important;
							transition: background 0.25s;
						}
					`
				}}
				isLoading={!link}
				{...props}
			>
				<TextInput
					placeholder="Loading your shareable link..."
					readOnly
					value={link}
					height={42}
					width="100%"
					border="none"
					cursor="pointer"
				/>
			</InputField>
		</CopyToClipboard>
	);
};

InviteLink.defaultProps = {
	link: ""
};

export default InviteLink;
