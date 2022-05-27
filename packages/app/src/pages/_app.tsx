import "es6-shim";

import React, { useEffect } from "react";
import { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";
// import { useRouter } from "next/router";
import { ThemeProvider, mergeTheme, defaultTheme } from "evergreen-ui";
import "modern-normalize";
import { setup as setupSignals } from "@/utils/signals";
import "@/styles/styles.scss";

const App = ({ Component, pageProps }: AppProps) => {
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

	// const router = useRouter();
	useEffect(() => {
		if (typeof window !== "undefined") {
			setupSignals();
		}

		// Ensure that the page is refreshed when router completes a url change
		// const reload = (url: string) => {
		// 	if (
		// 		url.startsWith("/magic") ||
		// 		window.location.pathname.startsWith("/magic")
		// 	) {
		// 		window.location.reload();
		// 	}
		// };
		// router.events.on("routeChangeStart", reload);
		// router.events.on("routeChangeComplete", reload);
		// return () => {
		// 	router.events.off("routeChangeStart", reload);
		// 	router.events.off("routeChangeComplete", reload);
		// };
	}, []);

	const { seo = {} } = pageProps;

	return (
		<ThemeProvider value={theme}>
			<main id="usher-app">
				<DefaultSeo title="Usher" {...seo} />
				<Component {...pageProps} />
			</main>
		</ThemeProvider>
	);
};

export default App;
