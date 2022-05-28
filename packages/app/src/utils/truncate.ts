function truncate(
	str: string,
	frontLen: number,
	backLen: number,
	seperator = "..."
) {
	const strLen = str.length;
	if (
		(frontLen === 0 && backLen === 0) ||
		frontLen >= strLen ||
		backLen >= strLen ||
		frontLen + backLen >= strLen
	) {
		return str;
	}
	if (backLen === 0) {
		return str.slice(0, frontLen) + seperator;
	}
	return str.slice(0, frontLen) + seperator + str.slice(strLen - backLen);
}

export default truncate;
