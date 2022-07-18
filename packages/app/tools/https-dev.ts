// Requires that localhost pem files are created in the package root dir using `mkcert`

import { createServer } from "https";
import { parse } from "url";
import next from "next";
import fs from "fs";

const port = 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
	key: fs.readFileSync("./localhost-key.pem"),
	cert: fs.readFileSync("./localhost.pem")
};

app.prepare().then(() => {
	createServer(httpsOptions, (req, res) => {
		const parsedUrl = parse(req.url || "", true);
		handle(req, res, parsedUrl);
	}).listen(port, () => {
		console.log(`ready - started server on url: https://localhost: ${port}`);
	});
});
