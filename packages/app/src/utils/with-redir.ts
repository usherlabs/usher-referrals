export default (url: string, redir?: string) => {
	const sp = url.split("?");
	sp.shift();
	const search = `?${sp.join("?")}`;
	const params = new URLSearchParams(search);
	const r =
		redir || typeof window !== "undefined"
			? window.location.pathname + window.location.search
			: "";

	if (!r) {
		return url;
	}

	params.set("redir", r);

	return `?${params.toString()}`;
};
