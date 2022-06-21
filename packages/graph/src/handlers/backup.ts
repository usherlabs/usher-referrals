// import { ScheduledEvent } from "aws-lambda";
import AWS from "aws-sdk";
import moment from "moment";
import path from "path";

import handleException from "@/utils/handle-exception";
import arangodump from "@/utils/arangodump";
import { s3Region, s3Root, s3Bucket } from "@/env-config";
import log from "@/utils/logger";

// configure AWS to log to stdout
AWS.config.update({
	// @ts-ignore
	logger: process.stdout
});

const s3 = new AWS.S3({
	region: s3Region
});

const generateBackupPath = (rootPath?: string, now = null) => {
	const n = now || moment().utc();
	const timestamp = moment(n).format("DD-MM-YYYY@HH-mm-ss");
	const day = moment(n).format("YYYY-MM-DD");
	const filename = `${timestamp}.backup`;
	const key = path.join(rootPath || "", day, filename);
	return key;
};

const backup = async () => {
	if (!s3Bucket) {
		throw new Error("S3_BUCKET not provided");
	}

	const key = generateBackupPath(s3Root);

	// spawn the dump process
	const stream = await arangodump();

	const result = await s3
		.upload({
			Key: key,
			Bucket: s3Bucket,
			Body: stream
		})
		.promise();

	log.info("Uploaded to", result.Location);

	return result;
};

export default async () => {
	try {
		return await backup();
	} catch (e) {
		if (e instanceof Error) {
			handleException(e);
		}
		return e;
	}
};
