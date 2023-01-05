import { Pane } from "evergreen-ui";

import PageHeader from "@/components/PageHeader";

type Props = {};

const Conversions: React.FC<Props> = () => {
	return (
		<Pane marginX="auto" width="100%">
			<PageHeader
				title="Conversions"
				description="Collect wallet connections through a shareable invite link."
			/>
		</Pane>
	);
};

export default Conversions;
