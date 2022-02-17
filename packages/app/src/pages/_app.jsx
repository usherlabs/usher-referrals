import { useEffect } from "react";
import { DefaultSeo } from "next-seo";
import PropTypes from "prop-types";

import "modern-normalize";

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
		<main>
			<DefaultSeo {...seo} />
			<Component {...pageProps} />;
		</main>
	);
};

App.propTypes = {
	Component: PropTypes.func.isRequired,
	pageProps: PropTypes.object.isRequired
};

export default App;
