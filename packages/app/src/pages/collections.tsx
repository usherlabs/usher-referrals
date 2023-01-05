import { Pane } from "evergreen-ui";

import PageHeader from "@/components/PageHeader";

type Props = {};

const Collections: React.FC<Props> = () => {
	return (
		<Pane marginX="auto" width="100%">
			<PageHeader
				title="Collections"
				description="Collect wallet connections through a shareable invite link."
			/>
		</Pane>
	);
};

export default Collections;
