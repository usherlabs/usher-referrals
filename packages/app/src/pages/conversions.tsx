import { Pane } from "evergreen-ui";

import PageHeader from "@/components/PageHeader";

type Props = {};

const Conversions: React.FC<Props> = () => {
	return (
		<Pane display="flex" flexDirection="column" height="100vh" padding="40px">
			<PageHeader
				title="Conversions"
				description="Collect wallet connections through a shareable invite link."
			/>
		</Pane>
	);
};

export default Conversions;
