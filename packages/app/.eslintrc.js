const { alias } = require("./config/alias");

module.exports = {
	extends: ["next/core-web-vitals", "prettier"],
	settings: {
		next: {
			rootDir: "packages/app/"
		},
		"import/resolver": {
			alias: {
				extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
				map: [...Object.entries(alias)]
			}
		}
	}
};
