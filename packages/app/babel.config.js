const isProd = process.env.NODE_ENV === "production";

module.exports = {
	presets: [
		"next/babel",
		"@linaria",
		["@babel/preset-typescript", { allowDeclareFields: true }]
	],
	plugins: ["add-react-displayname"].concat(
		isProd ? [["transform-remove-console", { exclude: ["error", "warn"] }]] : []
	)
};
