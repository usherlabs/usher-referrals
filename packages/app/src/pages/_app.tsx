import "es6-shim";

import React, { useEffect } from "react";
import { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";
import { ThemeProvider, mergeTheme, defaultTheme } from "evergreen-ui";
import { QueryClient, QueryClientProvider } from "react-query";
import { useRouter } from "next/router";
import "modern-normalize";

import UserProvider from "@/providers/User";
import { setup as setupSignals } from "@/utils/signals";
import "@/styles/styles.scss";
import DashboardContainer from "@/containers/Dashboard";
import Preloader from "@/components/Preloader";
import "@/integrations";
import { isProd } from "@/env-config";
import { AppEvents, events } from "@/utils/events";

if (!isProd) {
	// @ts-ignore
	import("@/admin");
}

const queryClient = new QueryClient();

const dynamicStaticPathnames = ["/inv/[id]"];

const App = ({ Component, pageProps }: AppProps) => {
	const router = useRouter();

	const theme = mergeTheme(defaultTheme, {
		// See https://github.com/segmentio/evergreen/blob/master/src/themes/deprecated/foundational-styles/fontFamilies.js
		fontFamilies: {
			/**
			 * @property {string} display - Used for headings larger than 20px.
			 */
			display: `"DM Sans", "SF UI Display", -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,

			/**
			 * @property {string} ui - Used for text and UI (which includes almost anything).
			 */
			ui: `"DM Sans", "SF UI Text", -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,

			/**
			 * @property {string} mono - Used for code and sometimes numbers in tables.
			 */
			mono: `"DM Sans", "SF Mono", "Monaco", "Inconsolata", "Fira Mono", "Droid Sans Mono", "Source Code Pro", monospace`
		}
	});

	useEffect(() => {
		if (typeof window !== "undefined") {
			setupSignals();
			events.emit(AppEvents.PAGE_LOAD, window.location.href);
		}
		const routeChangeComplete = (url: string) => {
			events.emit(AppEvents.PAGE_CHANGE, url);
		};
		router.events.on("routeChangeComplete", routeChangeComplete);
		return () => {
			router.events.off("routeChangeComplete", routeChangeComplete);
		};
	}, []);

	const { seo = {}, noUser = false } = pageProps;

	const AppMain = (
		<main id="usher-app">
			<DefaultSeo defaultTitle="Usher" titleTemplate="%s | Usher" {...seo} />
			<Component {...pageProps} />
		</main>
	);

	// Used for dynamic routes that use getStaticProps
	if (router.isFallback && dynamicStaticPathnames.includes(router.pathname)) {
		return (
			<ThemeProvider value={theme}>
				<Preloader />
			</ThemeProvider>
		);
	}

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider value={theme}>
				{noUser ? (
					AppMain
				) : (
					<UserProvider>
						<DashboardContainer>{AppMain}</DashboardContainer>
					</UserProvider>
				)}
			</ThemeProvider>
		</QueryClientProvider>
	);
};

export default App;
