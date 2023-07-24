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

const nextConfig = {
	// Instruction: Ignoring single paths in headers https://github.com/vercel/next.js/discussions/16768
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: createSecureHeaders(secureHeaderOptions)
			}
		];
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
	},
	images: {
		domains: ["gateway.pinata.cloud", "usher.so", "pages.usher.so"]
	},
	experimental: {
		images: {
			allowFutureImage: true
		}
	},
	webpack: (config) => {
		// eslint-disable-next-line no-param-reassign
		config.resolve.symlinks = false;
		config.resolve.fallback = { fs: false, net: false, tls: false };
		return config;
	},
	pageExtensions: ["page.tsx", "page.ts", "page.jsx", "page.js"]
};

module.exports = withLinaria(nextConfig);
