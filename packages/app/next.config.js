/* eslint-disable no-console */
const { createSecureHeaders } = require("next-secure-headers");
const withLinaria = require("next-linaria");

const pkg = require("./package.json");

const isProd = process.env.NODE_ENV === "production";
console.log(`Welcome to Next.js - Node Env: ${process.env.NODE_ENV}`);

// Example of setting up secure headers
// @link https://github.com/jagaapple/next-secure-headers
const secureHeaderOptions = {
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
};

// To Transpile Node Modules, refer to https://github.com/belgattitude/nextjs-monorepo-example/blob/main/apps/web-app/next.config.js#L39
const nextConfig = {
	// Ignoring single paths in headers https://github.com/vercel/next.js/discussions/16768
	async headers() {
		return [
			{
				source: "/satellite",
				headers: createSecureHeaders({
					...secureHeaderOptions,
					frameGuard: false
				})
			},
			{
				source: "/((?!satellite$|satellite/).*)",
				headers: createSecureHeaders(secureHeaderOptions)
			}
		];
	},

	webpack: (config, { isServer }) => {
		if (isServer) {
			// Till undici 4 haven't landed in prisma, we need this for docker/alpine
			// @see https://github.com/prisma/prisma/issues/6925#issuecomment-905935585
			config.externals.push("_http_common");
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

module.exports = withLinaria(nextConfig);
