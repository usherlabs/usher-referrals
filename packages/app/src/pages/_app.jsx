import { useEffect } from "react";
import { DefaultSeo } from "next-seo";
import PropTypes from "prop-types";

import "modern-normalize";

import ContractProvider from "@/providers/Contract";
import { setup as setupSignals } from "@/utils/signals";

import "@/styles/styles.scss";

const App = ({ Component, pageProps }) => {
	useEffect(() => {
		if (typeof window !== "undefined") {
			setupSignals();
		}
	}, []);

	const { seo = {} } = pageProps;

	return (
		<ContractProvider>
			<main id="usher-app">
				<DefaultSeo title="Usher" {...seo} />
				<Component {...pageProps} />
			</main>
		</ContractProvider>
	);
};

App.propTypes = {
	Component: PropTypes.func.isRequired,
	pageProps: PropTypes.object.isRequired
};

export default App;
