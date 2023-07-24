import { extractStyles } from "evergreen-ui";
import Document, {
	DocumentContext,
	DocumentInitialProps,
	Head,
	Html,
	Main,
	NextScript
} from "next/document";

import Meta from "@/components/Meta";

type Props = DocumentInitialProps & {
	css: string;
	hydrationScript: JSX.Element;
};

class AppDocument extends Document<Props> {
	static async getInitialProps(ctx: DocumentContext) {
		const initialProps = await Document.getInitialProps(ctx);
		// `css` is a string with css from both glamor and ui-box.
		// No need to get the glamor css manually if you are using it elsewhere in your app.
		//
		// `hydrationScript` is a script you should render on the server.
		// It contains a stringified version of the glamor and ui-box caches.
		// Evergreen will look for that script on the client and automatically hydrate
		// both glamor and ui-box.
		const { css, hydrationScript } = extractStyles();

		return {
			...initialProps,
			css,
			hydrationScript
		};
	}

	render() {
		const { css, hydrationScript } = this.props;

		return (
			<Html lang="en">
				<Head>
					<link rel="preconnect" href="https://fonts.googleapis.com" />
					<link
						rel="preconnect"
						href="https://fonts.gstatic.com"
						crossOrigin={""}
					/>
					{/* ADD FONT SCRIPTS HERE */}
					<link
						href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap"
						rel="stylesheet"
					/>
					{/* -------- END -------- */}
					{/* eslint-disable-next-line */}
					<style dangerouslySetInnerHTML={{ __html: css }} />
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

export default AppDocument;
