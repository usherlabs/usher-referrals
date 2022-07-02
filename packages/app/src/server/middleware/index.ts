import { NextApiResponse, NextApiRequest } from "next";
import nextConnect from "next-connect";
import pino from "express-pino-logger";
import bearerToken from "express-bearer-token";
import { Exception } from "@/types";

import handleException from "@/utils/handle-exception";
import { isProd, logLevel } from "@/server/env-config";
import { appName } from "@/env-config";

export const onError = (
	err: Exception,
	req: NextApiRequest,
	res: NextApiResponse
) => {
	handleException(err);
	req.log.error({ err }, "500 Error Response");

	const output: {
		success: boolean;
		code: number;
		message: string;
		error: Exception | null;
	} = {
		success: false,
		code: 500,
		message: "Internal Server Error",
		error: null
	};
	if (!isProd) {
		output.message = err.message;
		output.error = err;
	}
	return res.status(500).json(output);
};

export const onNoMatch = (req: NextApiRequest, res: NextApiResponse) => {
	return res.status(404).json({
		success: false,
		code: 404,
		message: "Not Found"
	});
};

export default function getHandler() {
	const handler = nextConnect({
		onError,
		onNoMatch
	});

	handler.use(bearerToken());

	// Add pino logger
	handler.use(
		pino({
			name: appName,
			level: logLevel || "info",
			transport: !isProd
				? {
						target: "pino-pretty",
						options: {
							colorize: true
						}
				  }
				: undefined
		})
	);

	return handler;
}
