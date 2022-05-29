import "es6-shim";

import React, { useEffect } from "react";
import { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";
import { ThemeProvider, mergeTheme, defaultTheme } from "evergreen-ui";
import { QueryClient, QueryClientProvider } from "react-query";
import "modern-normalize";
import { combineProviders } from "react-combine-providers";

import UserProvider from "@/providers/User";
import { setup as setupSignals } from "@/utils/signals";
import "@/styles/styles.scss";

const queryClient = new QueryClient();

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

	useEffect(() => {
		if (typeof window !== "undefined") {
			setupSignals();
		}
	}, []);

	const { seo = {}, noUser = false } = pageProps;

	const combinedProviders = combineProviders();

	combinedProviders.push(QueryClientProvider, { client: queryClient });
	combinedProviders.push(ThemeProvider, { value: theme });

	if (!noUser) {
		combinedProviders.push(UserProvider);
	}

	const MasterProvider = combinedProviders.master();

	return (
		<MasterProvider>
			<main id="usher-app">
				<DefaultSeo defaultTitle="Usher" titleTemplate="%s | Usher" {...seo} />
				<Component {...pageProps} />
			</main>
		</MasterProvider>
	);
};

export default App;
