import { useRouter } from "next/router";

function useRedir(url: string, redir: string = "") {
	const router = useRouter();
	const sp = router.asPath.split("?");
	const pathname = sp.shift();
	const search = `?${sp.join("?")}`;
	const params = new URLSearchParams(search);
	if (redir) {
		params.set("redir", redir);
	} else {
		params.set("redir", pathname || "/");
	}
	return [url, params.toString()].filter((s) => !!s).join("?");
}

export default useRedir;
