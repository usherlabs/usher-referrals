import { AppProps } from "next/app";
// import { useEffect } from "react";
// import { DefaultSeo } from "next-seo";

import "modern-normalize";

// import ContractProvider from "@/providers/Contract";
// import { setup as setupSignals } from "@/utils/signals";

import "@/styles/styles.scss";

const App = ({ Component, pageProps }: AppProps) => {
	// useEffect(() => {
	// 	if (typeof window !== "undefined") {
	// 		setupSignals();
	// 	}
	// }, []);

	// const { seo = {} } = pageProps;

	// return (
	// 	<ContractProvider>
	// 		<main id="usher-app">
	// 			<DefaultSeo title="Usher" {...seo} />
	// 			<Component {...pageProps} />
	// 		</main>
	// 	</ContractProvider>
	// );

	return (
		<main id="usher-app"><Component {...pageProps} /></main>
	);
};

export default App;