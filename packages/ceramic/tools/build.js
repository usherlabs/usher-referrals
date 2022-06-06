const { build } = require("esbuild");
const path = require("path");
const { Command } = require("commander");

const program = new Command();

program.option("-w, --watch", "Build on file change").action((arg, options) => {
	build({
		entryPoints: [path.resolve(__dirname, "../src/cmd.js")],
		bundle: true,
		outdir: "./build",
		platform: "node",
		external: [],
		watch: !!options.watch
	})
		.then(() => console.log(`Build successful!`))
		.catch(() => process.exit(1));
});
