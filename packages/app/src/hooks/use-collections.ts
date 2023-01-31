import { useContext } from "react";

import {
	CollectionsContext,
	ICollectionsContext
} from "@/providers/Collections";

export function useCollections() {
	return useContext<ICollectionsContext>(CollectionsContext);
}
