import NextDocument, { Head, Main, NextScript } from "next/document";
import Meta from "@/components/Meta";

class Document extends NextDocument {
	render() {
		return (
			<html lang="en">
				<Head>
					<Meta />
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</html>
		);
	}
}

export default Document;
