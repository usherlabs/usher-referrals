import { promises as fs } from "fs";

export const readWallet = async (pathOrKey: string) => {
	let fileExists = false;
	try {
		const stat = await fs.stat(pathOrKey);
		if (stat.isFile()) {
			fileExists = true;
		}
	} catch (e: any) {
		// TODO: Use correct type
		if (e.code !== "ENOENT") {
			throw e;
		}
	}

	let privateKey;
	if (fileExists) {
		privateKey = (
			await fs.readFile(pathOrKey, {
				encoding: "utf8",
				flag: "r",
			})
		).toString();
	} else {
		privateKey = pathOrKey;
	}

	return privateKey;
};
