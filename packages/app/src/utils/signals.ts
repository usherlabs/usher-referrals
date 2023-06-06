import isEmpty from "lodash/isEmpty";
import Router from "next/router";

import {
	gaTrackingId,
	juneApiKey,
	logrocketAppId,
	mauticOrigin,
	mixpanelAppId
} from "@/env-config";
import { Sentry } from "@/utils/handle-exception";
import { AppEvents, events } from "@/utils/events";
import { isEmail } from "@/utils/is-email";
import { Analytics } from "@june-so/analytics-next";

declare global {
	interface Window {
		mt: (type: string, event: string, properties?: Object) => void;
	}
}

// Helper to ensure production
const mw =
	(fn: Function) =>
	(...params: any[]) => {
		if (
			// !isProd ||
			// ? Tracking now runs when appropriate Ids are provided for signal packages
			typeof window === "undefined"
		) {
			return false;
		}
		return fn(...params);
	};

const getLogRocket = () => import("logrocket").then((m) => m.default || m);
const getReactGA = () => import("react-ga").then((m) => m.default || m);
const getMixpanel = () =>
	import("mixpanel-browser").then((m) => m.default || m);

let june: Analytics;
const getJune = async (writeKey: string) => {
	if (!june) {
		const { AnalyticsBrowser } = await import("@june-so/analytics-next").then(
			(m) => m.default || m
		);
		const [analytics] = await AnalyticsBrowser.load({
			writeKey,
			apiHost: "api.june.so/sdk"
		});
		june = analytics;
	}
	return june;
};

/**
 * Setup tracking
 */
export const setup = mw(async () => {
	// Setup Ga
	if (!isEmpty(gaTrackingId)) {
		const ReactGA = await getReactGA();
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

	// Setup Mixpanel
	if (!isEmpty(mixpanelAppId)) {
		const mixpanel = await getMixpanel();
		mixpanel.init(mixpanelAppId);
		// Catch all tracking
		Object.values(AppEvents).forEach((appEvent) => {
			events.on(appEvent, (properties: Object) => {
				mixpanel.track(appEvent, properties);
			});
		});
	}

	if (!isEmpty(juneApiKey)) {
		// Catch all tracking
		const juneInstance = await getJune(juneApiKey);
		Object.values(AppEvents).forEach((appEvent) => {
			events.on(appEvent, (properties: Object) => {
				juneInstance.track(appEvent, properties);
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

	if (!isEmpty(gaTrackingId)) {
		// Identify for GA
		const ReactGA = await getReactGA();
		ReactGA.set({ userId: id });
	}

	if (!isEmpty(logrocketAppId)) {
		// Identify Log Rocket
		const LogRocket = await getLogRocket();
		LogRocket.identify(id, properties);
	}

	if (!isEmpty(mixpanelAppId)) {
		// Identify Mixpanel
		const mixpanel = await getMixpanel();
		mixpanel.identify(id);
	}

	if (!isEmpty(mauticOrigin) && typeof window?.mt !== "undefined") {
		window.mt("send", "pageview", {
			[isEmail(id) ? "email" : "id"]: id
		});
	}

	if (!isEmpty(juneApiKey)) {
		const juneInstance = await getJune(juneApiKey);
		juneInstance.identify(id, properties);
	}

	return null;
});
