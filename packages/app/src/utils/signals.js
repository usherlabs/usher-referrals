import isEmpty from "is-empty";
import ReactGA from "react-ga";
import Router from "next/router";
import { isProd, gaTrackingId } from "@/env-config";
import isUserOperator from "@/utils/is-operator";
import { Sentry } from "@/utils/handle-exception";

// Helper to ensure production
const mw =
	(fn) =>
	(...params) => {
		if (!isProd) {
			return false;
		}
		return fn(...params);
	};

const getLogRocket = () => import("logrocket").then((m) => m.default || m);

/**
 * Setup tracking
 */
export const setup = mw(async () => {
	if (typeof window !== "undefined") {
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
		const LogRocket = await getLogRocket();
		const setupLogRocketReact = await import("logrocket-react").then(
			(m) => m.default || m
		);
		LogRocket.init("vzsg8h/callsesh");
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
export const identifyUser = mw(async (user) => {
	if (isEmpty(user)) {
		return null;
	}

	if (typeof window !== "undefined") {
		// Identify for GA
		if (!isEmpty(gaTrackingId)) {
			ReactGA.set({ userId: user.id });
		}

		// Identify Log Rocket
		const LogRocket = await getLogRocket();
		LogRocket.identify(
			user.id,
			isEmpty(user.username)
				? {}
				: {
						name: user.nickname,
						username: user.username,
						country: user.country,
						currency: user.currency,
						operator: isUserOperator(user)
				  }
		);
	}

	return user;
});
