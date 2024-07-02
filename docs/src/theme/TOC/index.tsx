import React from "react";
import TOC from "@theme-original/TOC";
import type TOCType from "@theme/TOC";
import type { WrapperProps } from "@docusaurus/types";
import EditThisPage from "@docusaurus/theme-classic/lib/theme/EditThisPage";
import { useDoc } from "@docusaurus/theme-common/internal";

type Props = WrapperProps<typeof TOCType>;

export default function TOCWrapper(props: Props): JSX.Element {
	const {
		metadata: { editUrl }
	} = useDoc();
	return (
		<div className="toc-wrapper">
			<h2>On this page</h2>
			<TOC {...props} />
			<EditThisPage editUrl={editUrl} />
			<div
				className={
					"text-xs text-black-2 dark:text-white-2 mt-4 text-center  font-mono"
				}
			>
				made with <span className={"text-emphasis"}>♥</span> <br /> by usherlabs
			</div>
		</div>
	);
}
