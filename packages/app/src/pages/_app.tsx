import "es6-shim";

import "ka-table/style.scss";
import React, { useEffect } from "react";
import { AppProps } from "next/app";
import { DefaultSeo, NextSeoProps } from "next-seo";
import { ThemeProvider } from "evergreen-ui";
import { QueryClient, QueryClientProvider } from "react-query";
import { useRouter } from "next/router";
import Script from "next/script";
import "modern-normalize";

import UserProvider from "@/providers/user/User";
import { setup as setupSignals } from "@/utils/signals";
import "@/styles/styles.scss";
import DashboardContainer from "@/containers/Dashboard";
import Preloader from "@/components/Preloader";
import "@/integrations";
import { isProd, mauticOrigin } from "@/env-config";
import { AppEvents, events } from "@/utils/events";

import { initOnboard } from "@/utils/onboard";
import { theme } from "@/brand/themes/theme";
import { brandName } from "@/brand/utils/names";
import { useRouteChange } from "@/hooks";
import { css } from "@linaria/core";
import { Provider } from "jotai";

type Props = AppProps & {
	pageProps: {
		seo?: NextSeoProps;
		noUser?: boolean;
	};
};

initOnboard();

if (!isProd) {
	// @ts-ignore
	import("@/admin");
}

const queryClient = new QueryClient();

const dynamicStaticPathnames = ["/inv/[id]", "/link/[id]"];

const routeChangeComplete = (url: string) => {
	events.emit(AppEvents.PAGE_CHANGE, { url });
};

const App = ({ Component, pageProps }: Props) => {
	const router = useRouter();

	useEffect(() => {
		if (typeof window !== "undefined") {
			setupSignals();
			events.emit(AppEvents.PAGE_LOAD, { url: window.location.href });
		}
	}, []);

	useRouteChange(routeChangeComplete);

	const { seo = {}, noUser = false } = pageProps;

	const AppMain = (
		<main
			className={css`
				display: flex;
				flex-direction: column;
				flex: 1;
				min-width: 0;
			`}
			id={`${brandName.snakeCase}-main`}
		>
			<DefaultSeo
				defaultTitle={brandName.titleCase}
				titleTemplate={`%s | ${brandName.titleCase}`}
				{...seo}
			/>
			<Component {...pageProps} />
			{mauticOrigin && (
				<Script
					id="mautic-tracking"
					strategy="afterInteractive"
					dangerouslySetInnerHTML={{
						__html: `
							(function(w,d,t,u,n,a,m){w['MauticTrackingObject']=n;
									w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)},a=d.createElement(t),
									m=d.getElementsByTagName(t)[0];a.async=1;a.src=u;m.parentNode.insertBefore(a,m)
							})(window,document,'script','${mauticOrigin}/mtc.js','mt');

							mt('send', 'pageview');
						`
					}}
				/>
			)}
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
				<Provider>
					{noUser ? (
						AppMain
					) : (
						<UserProvider>
							<DashboardContainer>{AppMain}</DashboardContainer>
						</UserProvider>
					)}
				</Provider>
			</ThemeProvider>
		</QueryClientProvider>
	);
};

export default App;
