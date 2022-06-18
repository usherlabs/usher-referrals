import * as Sentry from "@sentry/node";
import { RewriteFrames } from "@sentry/integrations";

import { isProd, sentry } from "@/env-config";
import log from "./logger";

const sentryOptions = {
	dsn: sentry.dsn,
	enabled: process.env.NODE_ENV !== "test",
	release: sentry.release,
	environment: process.env.NODE_ENV,
	attachStacktrace: true,
	integrations: [
		new RewriteFrames({
			root: global.__dirname
		})
	]
};

if (sentry.dsn) {
	// If developing locally
	if (!isProd) {
		// Don't actually send the errors to Sentry
		Sentry.init({
			...sentryOptions,
			beforeSend: () => null,
			maxBreadcrumbs: 10
		});
	} else {
		Sentry.init({
			...sentryOptions,
			maxBreadcrumbs: 50,
			ignoreErrors: ["Non-Error exception captured"]
		});
	}
}

export { Sentry };

const handleException = (err: Error) => {
	// Always log
	log.error(err);

	return Sentry.captureException(err);
};

export default handleException;
