import { Pane, Text } from "evergreen-ui";
import Image from "next/image";

// import DummyChartActive from "./DummyChartActive.png";
import DummyChartInactive from "./DummyChartInactive.png";
import { Link } from "./types";

type Props = { link: Link };

const LinkChart: React.FC<Props> = ({ link }) => {
	return (
		<Pane display="flex" alignItems="flex-end">
			<Text fontSize="16px" lineHeight="12px" marginRight="6px">
				{link.hits}
			</Text>
			<Pane height={24} width={33}>
				<Image src={DummyChartInactive} />
			</Pane>
		</Pane>
	);
};

export default LinkChart;
