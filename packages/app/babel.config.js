const isProd = process.env.NODE_ENV === "production";
const enableConsoleLogs = process.env.ENABLE_CONSOLE_LOGS === "true";

module.exports = {
	presets: [
		"next/babel",
		"@linaria",
		["@babel/preset-typescript", { allowDeclareFields: true }]
	],
	plugins: ["add-react-displayname"].concat(
		isProd && !enableConsoleLogs
			? [["transform-remove-console", { exclude: ["error", "warn"] }]]
			: []
	)
};
