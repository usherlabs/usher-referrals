import NextDocument, { Html, Head, Main, NextScript } from "next/document";
import { extractStyles } from "evergreen-ui";
import Meta from "@/components/Meta";

class Document extends NextDocument {
	static getInitialProps({ renderPage }) {
		const page = renderPage();
		// `css` is a string with css from both glamor and ui-box.
		// No need to get the glamor css manually if you are using it elsewhere in your app.
		//
		// `hydrationScript` is a script you should render on the server.
		// It contains a stringified version of the glamor and ui-box caches.
		// Evergreen will look for that script on the client and automatically hydrate
		// both glamor and ui-box.
		const { css, hydrationScript } = extractStyles();

		return {
			...page,
			css,
			hydrationScript
		};
	}

	render() {
		const { css, hydrationScript } = this.props;

		return (
			<Html lang="en">
				<Head>
					{/* eslint-disable */}
					<style dangerouslySetInnerHTML={{ __html: css }} />
					{/* eslint-enable */}
					<Meta />
				</Head>
				<body>
					<Main />
					{hydrationScript}
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default Document;
