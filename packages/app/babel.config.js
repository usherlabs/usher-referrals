const isProd = process.env.NODE_ENV === "production";

module.exports = {
	presets: ["next/babel", "@linaria"],
	plugins: ["add-react-displayname"].concat(
		isProd ? [["transform-remove-console", { exclude: ["error", "warn"] }]] : []
	)
};
