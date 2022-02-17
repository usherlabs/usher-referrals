/* eslint-disable no-console */

const SentryWebpackPlugin = require("@sentry/webpack-plugin");
const sanitizeFilename = require("sanitize-filename");
const { createSecureHeaders } = require("next-secure-headers");

const { alias } = require("./config/alias");
const pkg = require("./package.json");

const isProd = process.env.NODE_ENV === "production";

// Example of setting up secure headers
// @link https://github.com/jagaapple/next-secure-headers
const secureHeaders = createSecureHeaders({
	contentSecurityPolicy: {
		directives: {
			// defaultSrc: "'self'",
			// styleSrc: ["'self'"],
		}
	},
	...(isProd
		? {
				forceHTTPSRedirect: [
					true,
					{ maxAge: 60 * 60 * 24 * 4, includeSubDomains: true }
				]
		  }
		: {}),
	referrerPolicy: "same-origin"
});

// To Transpile Node Modules, refer to https://github.com/belgattitude/nextjs-monorepo-example/blob/main/apps/web-app/next.config.js#L39

module.exports = {
	async headers() {
		return [{ source: "/(.*)", headers: secureHeaders }];
	},

	webpack: (config, { isServer, webpack, dev }) => {
		// Sentry release
		const sentryRelease = sanitizeFilename(`${pkg.name}@${pkg.version}`);
		config.plugins.push(
			new webpack.DefinePlugin({
				"process.env.NEXT_PUBLIC_SENTRY_RELEASE": JSON.stringify(sentryRelease)
			})
		);

		// Add alias to Webpack
		const aliasToApply = {
			...config.resolve.alias,
			...alias
		};

		if (!isServer) {
			// Sentry alias
			aliasToApply["@sentry/node"] = "@sentry/browser";
		}

		config.resolve.alias = aliasToApply;

		if (isServer) {
			// Till undici 4 haven't landed in prisma, we need this for docker/alpine
			// @see https://github.com/prisma/prisma/issues/6925#issuecomment-905935585
			config.externals.push("_http_common");
		}

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
	env: {
		APP_NAME: pkg.name,
		APP_VERSION: pkg.version,
		BUILD_TIME: new Date().toISOString()
	},
	poweredByHeader: !isProd,
	reactStrictMode: !isProd,
	serverRuntimeConfig: {
		// to bypass https://github.com/zeit/next.js/issues/8251
		PROJECT_ROOT: __dirname
	}
};
