import isEmpty from "lodash/isEmpty";
import ReactGA from "react-ga";
import Router from "next/router";

import { isProd, gaTrackingId, logrocketAppId } from "@/env-config";
import { Sentry } from "@/utils/handle-exception";

// Helper to ensure production
const mw =
	(fn: Function) =>
	(...params: any[]) => {
		if (!isProd || typeof window === "undefined") {
			return false;
		}
		return fn(...params);
	};

const getLogRocket = () => import("logrocket").then((m) => m.default || m);

/**
 * Setup tracking
 */
export const setup = mw(async () => {
	// Setup Ga
	if (!isEmpty(gaTrackingId)) {
		ReactGA.initialize(gaTrackingId);
		ReactGA.pageview(window.location.pathname + window.location.search);
		Router.events.on("routeChangeComplete", (url) => {
			setTimeout(() => {
				ReactGA.pageview(url);
			}, 0);
		});
	}

	// Setup Log Rocket
	if (!isEmpty(logrocketAppId)) {
		const LogRocket = await getLogRocket();
		const setupLogRocketReact = await import("logrocket-react").then(
			(m) => m.default || m
		);
		LogRocket.init(logrocketAppId);
		setupLogRocketReact(LogRocket);
		LogRocket.getSessionURL((sessionURL) => {
			Sentry.configureScope((scope) => {
				scope.setExtra("sessionURL", sessionURL);
			});
		});
	}
	return true;
});

/**
 * Accepts Callsesh user object
 *
 * @param   {Object}  user  Callsesh user object
 */
export const identifyUser = mw(async (id: string, properties: any) => {
	if (!id) {
		return null;
	}

	// Identify for GA
	if (!isEmpty(gaTrackingId)) {
		ReactGA.set({ userId: id });
	}

	if (!isEmpty(logrocketAppId)) {
		// Identify Log Rocket
		const LogRocket = await getLogRocket();
		LogRocket.identify(id, properties);
	}

	return null;
});
