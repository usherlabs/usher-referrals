import { useContext } from "react";

import { GunContext } from "@/providers/Gun";

function useContract() {
	const { loading } = useContext(GunContext);

	return loading;
}

export default useContract;
