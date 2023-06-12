const isProd = process.env.NODE_ENV === "production";
const enableConsoleLogs = process.env.ENABLE_CONSOLE_LOGS === "true";

module.exports = {
	presets: [
		"next/babel",
		["@babel/preset-typescript", { allowDeclareFields: true }],
		"@linaria/babel-preset",
	],
	plugins: ["add-react-displayname"].concat(
		isProd && !enableConsoleLogs
			? [["transform-remove-console", { exclude: ["error", "warn"] }]]
			: []
	)
};
