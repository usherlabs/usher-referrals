import useLocalStorage from "react-use-localstorage";

function useActiveConfig() {
	return useLocalStorage("active-config", "");
}

export default useActiveConfig;
