import { Pane, ThemeProvider } from "evergreen-ui";

import PageHeader from "@/components/PageHeader";
import { newTheme } from "@/themes/newTheme";
import { CollectionsContextProvider } from "@/providers/Collections";
import Collections from "@/components/Collection/Collections";

type Props = {};

const CollectionsPage: React.FC<Props> = () => {
	return (
		<ThemeProvider value={newTheme}>
			<Pane display="flex" flexDirection="column" height="100vh" padding="40px">
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
