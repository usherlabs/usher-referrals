import * as mediaQueries from "@/utils/media-queries";
import { css } from "@linaria/core";
import { Heading, Pane } from "evergreen-ui";

type Props = {
	title: string;
	description: string;
};

const PageHeader: React.FC<Props> = ({ title, description }) => {
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
			<Heading is="h1" width="100%" fontWeight={700} fontSize="2em">
				{title}
			</Heading>
			<p>{description}</p>
		</Pane>
	);
};

export default PageHeader;
