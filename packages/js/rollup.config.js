import path from "path";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import external from "rollup-plugin-peer-deps-external";
import { terser } from "rollup-plugin-terser";
import { uglify } from "rollup-plugin-uglify";
import filesize from "rollup-plugin-filesize";
import visualizer from "rollup-plugin-visualizer";
import injectProcessEnv from "rollup-plugin-inject-process-env";
import sourcemaps from "rollup-plugin-sourcemaps";
import alias from "@rollup/plugin-alias";
import dotenv from "@gedhean/rollup-plugin-dotenv";

import pkg from "./package.json";

const isProd = process.env.NODE_ENV === "production";

const input = "src/index.js";
const extensions = [".js", ".json"];
const codes = [
	"THIS_IS_UNDEFINED",
	"MISSING_GLOBAL_NAME",
	"CIRCULAR_DEPENDENCY"
];
const minifyExtension = (pathToFile) => pathToFile.replace(/\.js$/, ".min.js");
const discardWarning = (warning) => {
	if (codes.includes(warning.code)) {
		return;
	}

	console.error(warning);
};

const plugins = [
	commonjs(),
	babel({
		presets: ["@babel/preset-env"],
		plugins: [
			[
				"@babel/plugin-transform-runtime",
				{
					regenerator: true
				}
			]
		],
		babelHelpers: "runtime",
		exclude: "node_modules/**",
		extensions,
		babelrc: false
	}),
	alias({
		entries: [{ find: "@", replacement: path.resolve(__dirname, "./src") }]
	}),
	external(),
	resolve({
		browser: true,
		extensions,
		preferBuiltins: false
	}),
	filesize(),
	visualizer(),
	dotenv(),
	injectProcessEnv({
		NODE_ENV: process.env.NODE_ENV || "development"
	})
];
if (!isProd) {
	plugins.push(sourcemaps());
}

export default [
	// CommonJS
	{
		output: {
			file: pkg.main,
			format: "cjs",
			exports: "named"
		},
		plugins
	},
	{
		output: {
			file: minifyExtension(pkg.main),
			format: "cjs",
			exports: "named"
		},
		plugins: [...plugins, uglify()]
	},

	// UMD
	{
		output: {
			file: pkg.browser,
			format: "umd",
			name: "usher",
			esModule: false,
			exports: "named"
		},
		plugins
	},
	{
		output: {
			file: minifyExtension(pkg.browser),
			format: "umd",
			name: "usher",
			esModule: false,
			exports: "named"
		},
		plugins: [...plugins, terser()]
	},

	// ES
	{
		output: {
			file: pkg.module,
			format: "es",
			exports: "named"
		},
		plugins
	},
	{
		output: {
			file: minifyExtension(pkg.module),
			format: "es",
			exports: "named"
		},
		plugins: [...plugins, terser()]
	}
].map((conf) => ({
	input,
	onwarn: discardWarning,
	treeshake: true,
	...conf
}));
