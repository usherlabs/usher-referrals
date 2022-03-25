import { useEffect } from "react";
import { DefaultSeo } from "next-seo";
import PropTypes from "prop-types";
import { supabase } from "@/utils/supabase-client";

import "modern-normalize";

import UserProvider from "@/providers/User";
import WalletProvider from "@/providers/Wallet";
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
		<WalletProvider>
			<UserProvider value={supabase}>
				<main id="usher-app">
					<DefaultSeo title="Usher" {...seo} />
					<Component {...pageProps} />
				</main>
			</UserProvider>
		</WalletProvider>
	);
};

App.propTypes = {
	Component: PropTypes.func.isRequired,
	pageProps: PropTypes.object.isRequired
};

export default App;
