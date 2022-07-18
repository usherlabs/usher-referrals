import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter, NextHandler } from "next-connect";
import pino from "express-pino-logger";
import bearerToken from "express-bearer-token";

import { ApiRequest, ApiResponse, Exception } from "@/types";
import handleException from "@/utils/handle-exception";
import { isProd, logLevel } from "@/server/env-config";
import { appName } from "@/env-config";

export const expressMiddleware = (middleware: any) => {
	return async (
		req: NextApiRequest,
		res: NextApiResponse,
		next: NextHandler
	) => {
		await new Promise((resolve, reject) => {
			middleware(req, res, (err: any) => (err ? reject(err) : resolve(null)));
		});
		return next();
	};
};

export const onError = (
	err: any,
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

export function useRouteHandler<
	T extends ApiRequest = ApiRequest,
	H extends ApiResponse = ApiResponse
>() {
	const router = createRouter<T, H>();

	router.use(expressMiddleware(bearerToken()));

	// Add pino logger
	router.use(
		expressMiddleware(
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
		)
	);

	return {
		router,
		cors() {
			router.all((req, res, next) => {
				if (req.method === "OPTIONS") {
					// Safari (and potentially other browsers) need content-length 0,
					//   for 204 or they just hang waiting for a body
					req.log.debug("Hello OPTIONS");
					res.setHeader("Content-Length", "0");
					res.status(204).end();
				} else {
					next();
				}
			});

			return this;
		},
		handle() {
			// create a handler from router with custom
			// onError and onNoMatch
			return router.handler({
				onError,
				onNoMatch
			});
		}
	};
}
