import * as Sentry from "@sentry/nextjs";
import type { NextjsOptions } from "@sentry/nextjs/types/utils/nextjsOptions";
import { isProd, sentry } from "@/env-config";
import { Exception, ExceptionContext, User } from "@/types";

const sentryOptions: NextjsOptions = {
	dsn: sentry.dsn,
	enabled: process.env.NODE_ENV !== "test",
	release: sentry.release,
	environment: process.env.NODE_ENV,
	attachStacktrace: true
};

// If developing locally
if (!isProd) {
	// Don't actually send the errors to Sentry
	sentryOptions.beforeSend = () => null;
	sentryOptions.maxBreadcrumbs = 10;
} else {
	sentryOptions.maxBreadcrumbs = 50;
	sentryOptions.ignoreErrors = ["Non-Error exception captured"];
}

if (sentry.dsn) {
	Sentry.init(sentryOptions);

	// Scope configured by default, subsequent calls to "configureScope" will add additional data
	Sentry.configureScope((scope) => {
		scope.setTag("package", "app");

		// See https://www.npmjs.com/package/@sentry/node
		scope.setTag("nodejs", process.version);
		scope.setTag("nodejsAWS", process.env.AWS_EXECUTION_ENV || null); // Optional - Available on production environment only
		scope.setTag("memory", process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE || null); // Optional - Available on production environment only
		scope.setTag(
			"runtimeEngine",
			typeof window !== "undefined" ? "browser" : "server"
		);
		scope.setTag("buildTime", process.env.BUILD_TIME);
	});
}

export { Sentry };

export const setUser = (user: User | null) => {
	Sentry.configureScope((scope) => {
		scope.setUser(user);
	});
};

const handleException = (
	err: Exception | Error | any, // type any here in case it's a random unknown error...
	ctx?: ExceptionContext
) => {
	if (!sentry.dsn || !isProd) {
		console.trace(err, ctx); // eslint-disable-line
	}

	Sentry.configureScope((scope) => {
		if (err.message) {
			// De-duplication currently doesn't work correctly for SSR / browser errors
			// so we force deduplication by error message if it is present
			scope.setFingerprint([err.message]);
		}

		if ("statusCode" in err && err.statusCode) {
			scope.setExtra("statusCode", err.statusCode);
		}

		if (ctx) {
			const { req, res, errorInfo, query, pathname } = ctx;

			if (res && res.statusCode) {
				scope.setExtra("statusCode", res.statusCode);
			}

			if (typeof window !== "undefined") {
				scope.setTag("ssr", false);
				scope.setExtra("query", query);
				scope.setExtra("pathname", pathname);
			} else {
				scope.setTag("ssr", true);
				if (req) {
					scope.setExtra("url", req.url);
					scope.setExtra("method", req.method);
					scope.setExtra("headers", req.headers);
					scope.setExtra("query", req.query);
				}
			}

			if (errorInfo) {
				Object.keys(errorInfo).forEach((key) =>
					scope.setExtra(key, errorInfo[key])
				);
			}
		}
	});

	return Sentry.captureException(err);
};

export default handleException;
