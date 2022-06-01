import { useEffect, useState } from "react";

const createUrl = (url: string, redir: string) => {
	if (!redir) {
		return url;
	}

	const sp = url.split("?");
	const pathname = sp.shift();
	const search = `?${sp.join("?")}`;
	const params = new URLSearchParams(search);

	params.set("redir", redir);

	return `${pathname}?${params.toString()}`;
};

function useRedir(url: string, redir: string = "") {
	const [newUrl, setNewUrl] = useState(url);
	useEffect(() => {
		if (redir) {
			setNewUrl(createUrl(url, redir));
		} else if (typeof window !== "undefined") {
			setNewUrl(
				createUrl(url, window.location.pathname + window.location.search)
			);
		}
	}, []);

	return newUrl;
}

export default useRedir;
