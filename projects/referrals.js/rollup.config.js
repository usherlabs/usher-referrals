/* eslint-disable no-console */

import path from "path";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import external from "rollup-plugin-peer-deps-external";
import filesize from "rollup-plugin-filesize";
import visualizer from "rollup-plugin-visualizer";
import alias from "@rollup/plugin-alias";
import dotenv from "@gedhean/rollup-plugin-dotenv";
import json from "@rollup/plugin-json";
import nodePolyfills from "rollup-plugin-polyfill-node";
import esbuild from "rollup-plugin-esbuild";
import typescript from "rollup-plugin-typescript2";
import dtsBundle from "rollup-plugin-dts-bundle";

import pkg from "./package.json";

const isProd = process.env.NODE_ENV === "production";

console.log(`Running in ${isProd ? "Production" : "Development"}`);

const input = "src/index.ts";
const extensions = [".ts", ".js", ".json"];
const codes = [
	"THIS_IS_UNDEFINED",
	"MISSING_GLOBAL_NAME",
	"CIRCULAR_DEPENDENCY"
];
// const minifyExtension = (pathToFile) => pathToFile.replace(/\.js$/, ".min.js");
const discardWarning = (warning) => {
	if (codes.includes(warning.code)) {
		return;
	}

	console.error(warning);
};

const plugins = [
	typescript(),
	dtsBundle({
		bundle: {
			name: pkg.name,
			main: "build/src/index.d.ts",
			out: "typings.d.ts"
		}
		// deleteOnComplete: ["build/src/**/*.d.ts"]
	}),
	dotenv(),
	// NOTE: we've tried using rollup-plugin-inject-process-env
	// however it will get an error on environments that doesn't support
	// process.env reassignmment
	// injectProcessEnv({
	// 	NODE_ENV: process.env.NODE_ENV || "development",
	// 	APP_NAME: pkg.name,
	// 	APP_VERSION: pkg.version
	// }),
	esbuild({
		include: /\.ts?$/,
		exclude: /node_modules/,
		sourceMap: !isProd,
		minify: isProd,
		tsconfig: "./tsconfig.json",
		target: "es6",
		define: {
			"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
			"process.env.APP_NAME": JSON.stringify(pkg.name),
			"process.env.APP_VERSION": JSON.stringify(pkg.version)
		},
		loaders: {
			// Add .json files support
			".json": "json"
		}
	}),
	commonjs(),
	json(),
	nodePolyfills({ include: ["crypto"] }),
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
	visualizer()
];

export default [
	// CommonJS (Node)
	{
		output: {
			file: pkg.main,
			format: "cjs",
			exports: "named",
			sourcemap: !isProd
		},
		plugins
	},

	// UMD / IIFE / Browser
	{
		output: {
			file: pkg.browser,
			format: "umd",
			name: "usher",
			esModule: false,
			exports: "named",
			sourcemap: !isProd
		},
		plugins
	},

	// ES (Import/Export)
	{
		output: {
			file: pkg.module,
			format: "es",
			exports: "named",
			sourcemap: !isProd
		},
		plugins
	}
].map((conf) => ({
	input,
	onwarn: discardWarning,
	treeshake: true,
	...conf
}));
