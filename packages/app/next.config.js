/* eslint-disable no-console */

const withSourceMaps = require("@zeit/next-source-maps")();
const withPlugins = require("next-compose-plugins");
const SentryWebpackPlugin = require("@sentry/webpack-plugin");
const filenamify = require("filenamify");

const { alias } = require("./config/alias");
const pkg = require("./package.json");

const isProd = process.env.NODE_ENV === "production";

module.exports = (phase, ...nextParams) => {
	const nextConfig = {
		// Explicitly define environment variables to be used at build time.
		env,
		webpack: (config, { isServer, webpack, dev }) => {
			// Sentry release
			const sentryRelease = filenamify(`${pkg.name}@${pkg.version}`, {
				replacement: "-"
			});
			config.plugins.push(
				new webpack.DefinePlugin({
					"process.env.NEXT_PUBLIC_SENTRY_RELEASE":
						JSON.stringify(sentryRelease)
				})
			);

			// Add alias to Webpack
			const aliasToApply = {
				...config.resolve.alias,
				...alias,
				// Add react alias -- this allows us to link other projects without referencing duplicate react libraries.
				react: require.resolve("react"),
				formik: require.resolve("formik")
			};

			if (!isServer) {
				// Sentry alias
				aliasToApply["@sentry/node"] = "@sentry/browser";
			}

			config.resolve.alias = aliasToApply;

			// When all the Sentry configuration env variables are available/configured
			// The Sentry webpack plugin gets pushed to the webpack plugins to build
			// and upload the source maps to sentry.
			// This is an alternative to manually uploading the source maps
			// See: https://github.com/zeit/next.js/blob/canary/examples/with-sentry-simple/next.config.js
			if (
				!dev &&
				process.env.SENTRY_DSN &&
				process.env.SENTRY_ORG &&
				process.env.SENTRY_PROJECT &&
				process.env.SENTRY_AUTH_TOKEN
			) {
				config.plugins.push(
					new SentryWebpackPlugin({
						release: sentryRelease,
						include: ".next",
						ignore: ["node_modules"],
						urlPrefix: "~/_next"
					})
				);
			}

			// Add markdown loader for legal pages
			config.module.rules.push({
				test: /\.md$/,
				use: "raw-loader"
			});

			return config;
		},
		target: "serverless",
		poweredByHeader: !isProd,
		reactStrictMode: !isProd
	};

	// Next plugins expect a config object and respond with an object.
	return withPlugins([withSourceMaps], nextConfig)(phase, ...nextParams);
};
