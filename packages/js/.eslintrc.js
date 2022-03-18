const path = require("path");

module.exports = {
	extends: [
		"airbnb-base",
		"plugin:prettier/recommended",
		"plugin:import/errors",
		"plugin:import/warnings"
	],
	settings: {
		"import/resolver": {
			alias: {
				extensions: [".js", ".json"],
				map: Object.entries({
					"@": path.resolve(__dirname, "./src")
				})
			}
		}
	},
	env: {
		browser: true,
		node: true,
		es6: true
	},
	globals: {
		window: true
	},
	rules: {
		// See: https://github.com/benmosher/eslint-plugin-import/issues/496
		"import/no-extraneous-dependencies": 0,
		"no-console": ["warn"],
		"no-unused-vars": ["error", { ignoreRestSiblings: true }],
		"no-param-reassign": 0,
		"import/prefer-default-export": 0,
		"class-methods-use-this": 0,
		"prefer-template": 0,
		"no-extra-boolean-cast": 0,
		"no-underscore-dangle": 0,
		camelcase: 0
	}
};
