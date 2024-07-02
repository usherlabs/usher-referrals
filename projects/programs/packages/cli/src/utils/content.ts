import { readFileSync } from "fs";

/**
 * Get content provided by either '--file <string>' or --content <string>` option
 * @param options
 * @returns
 */
export function getContentByOptions(options: {
	file?: string;
	content?: string;
}) {
	const { file, content } = options;

	if (file) {
		return readFileSync(file, { encoding: "utf8" });
	}

	if (content) {
		return content;
	}

	throw new Error(
		"error: neither option '--file <string>' nor option '--content <string>' specified"
	);
}
