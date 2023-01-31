import { Pane, Text } from "evergreen-ui";
import Image from "next/image";

import { Link } from "../../programs/collections/types";
import DummyChartActive from "./DummyChartActive.png";
import DummyChartInactive from "./DummyChartInactive.png";

type Props = { link: Link; isActive: boolean };

const LinkChart: React.FC<Props> = ({ link, isActive }) => {
	return (
		<Pane display="flex" alignItems="flex-end">
			<Text fontSize="16px" lineHeight="12px" marginRight="6px">
				{link.hits}
			</Text>
			<Pane height={24} width={33}>
				{isActive ? (
					<Image src={DummyChartActive} />
				) : (
					<Image src={DummyChartInactive} />
				)}
			</Pane>
		</Pane>
	);
};

export default LinkChart;
