import { setup as setupSignals } from "@/utils/signals";

import "modern-normalize";
import "@/styles.css";

function MyApp({ Component, pageProps }) {
	return <Component {...pageProps} />;
}


class App extends NextApp {
	componentDidMount() {
		if (typeof window !== "undefined") {
			setupSignals();
		}
	}

	render() {
		const { Component, pageProps = {} } = this.props;

		const { seo = {} } = pageProps;

		return (
			<StyletronProvider value={engine} debug={debug} debugAfterHydration>
				<BaseProvider theme={theme}>
					<UserProvider>
						<RouteReferrerProvider>
							<DefaultSeo {...seoConfig} {...seo} />
							<ToasterContainer
								placement={TOOLTIP_PLACEMENT.topRight}
								autoHideDuration={10000}
								overrides={{
									Root: {
										style: {
											zIndex: "99999999"
										}
									}
								}}
							>
								<Container id="callsesh-app">
									<Component {...pageProps} />
								</Container>
							</ToasterContainer>
						</RouteReferrerProvider>
					</UserProvider>
				</BaseProvider>
			</StyletronProvider>
		);
	}
}

export default App;


export default MyApp;
