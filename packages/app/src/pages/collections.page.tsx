import { css } from "@linaria/core";
import { Pane, ThemeProvider } from "evergreen-ui";

import Collections from "@/components/Collection/Collections";
import PageHeader from "@/components/PageHeader";
import { CollectionsContextProvider } from "@/providers/Collections";
import { newTheme } from "@/brand/themes/newTheme";
import * as mediaQueries from "@/utils/media-queries";

type Props = {};

const CollectionsPage: React.FC<Props> = () => {
	return (
		<ThemeProvider value={newTheme}>
			<Pane
				display="flex"
				flexDirection={"column"}
				flex={1}
				padding="10px"
				className={css`
					${mediaQueries.gtLarge} {
						padding: 40px !important;
					}
				`}
			>
				<PageHeader
					title="Collections"
					description="Collect wallet connections through a shareable invite link."
				/>
				<CollectionsContextProvider>
					<Collections />
				</CollectionsContextProvider>
			</Pane>
		</ThemeProvider>
	);
};

export default CollectionsPage;
