import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { Transform } from "stream";
import { arangoUrl, arangoPassword, arangoUsername } from "@/env-config";

function spawnDump(dir: string, args: string[], env = {}) {
	const dumpPath = path.join(dir, "arangodump");
	if (!fs.existsSync(dumpPath)) {
		throw new Error(`arangodump not found at ${dumpPath}`);
	}

	return spawn(dumpPath, args, {
		env
	});
}

const dump = (dumpSpawnFn = spawnDump): Promise<Transform> => {
	return new Promise((resolve, reject) => {
		let headerChecked = false;
		let stderr = "";

		// spawn arangodump process
		const ts = Date.now();
		const args = [
			`--server.endpoint ${arangoUrl}`,
			`--server.username ${arangoUsername}`,
			`--server.password ${arangoPassword}`,
			`--server.authentication true`,
			`--all-databases true`,
			`--output-directory "${ts}"`
		];
		const process = dumpSpawnFn("bin", args);

		// hook into the process
		process.stderr.on("data", (data) => {
			stderr += data.toString("utf8");
		});

		process.on("close", (code) => {
			// reject our promise if arangodump had a non-zero exit
			if (code !== 0) {
				return reject(new Error(`arangodump process failed: ${stderr}`));
			}
			// check that pgdump actually gave us some data
			if (!headerChecked) {
				return reject(new Error("arangodump gave us an unexpected response"));
			}
			return null;
		});

		// watch the arangodump stdout stream so we can check it's valid
		const transformer = new Transform({
			transform(chunk, enc, callback) {
				this.push(chunk);
				// if stdout begins with 'PGDMP' then the backup has begun
				// otherwise, we abort
				if (!headerChecked) {
					headerChecked = true;
					// resolve(transformer);
					// if (chunk.toString("utf8").startsWith("PGDMP")) {
					if (chunk.toString("utf8")) {
						resolve(transformer);
					} else {
						reject(new Error("arangodump gave us an unexpected response"));
					}
				}
				callback();
			}
		});

		// pipe arangodump to transformer
		process.stdout.pipe(transformer);
	});
};

export default dump;
