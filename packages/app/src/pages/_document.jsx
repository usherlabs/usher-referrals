import NextDocument, { Html, Head, Main, NextScript } from "next/document";
import Meta from "@/components/Meta";

class Document extends NextDocument {
	render() {
		return (
			<Html lang="en">
				<Head>
					<Meta />
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default Document;
