import React from "react";
import { FaviconTags } from "@/utils/generated-favicons/FaviconTags";

const Meta: React.FC = () => (
	<>
		<FaviconTags />
		<meta name="apple-mobile-web-app-capable" content="yes" />
	</>
);

export default Meta;
