import * as mediaQueries from "@/utils/media-queries";
import { css } from "@linaria/core";
import { Heading, Pane, Paragraph } from "evergreen-ui";
import { useCustomTheme } from "@/brand/themes/theme";

type Props = {
	title: string;
	description: string;
};

const PageHeader: React.FC<Props> = ({ title, description }) => {
	const { colors } = useCustomTheme();

	return (
		<Pane
			width="100%"
			borderBottom="1px solid rgba(87, 93, 114, 0.2)"
			className={css`
				${mediaQueries.isLarge} {
					padding: 5px 5px !important;
				}
			`}
		>
			<Heading
				is="h1"
				width="100%"
				fontWeight={700}
				fontSize="2em"
				marginBottom={20}
			>
				{title}
			</Heading>
			<Paragraph
				size={400}
				fontSize="1.2em"
				marginBottom={10}
				color={colors.gray800}
			>
				{description}
			</Paragraph>
		</Pane>
	);
};

export default PageHeader;
