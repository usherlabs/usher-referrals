const { alias } = require("./config/alias");

module.exports = {
	extends: [
		"airbnb",
		"plugin:prettier/recommended",
		// Add specific rules for react
		"plugin:react/recommended",
		"plugin:react-hooks/recommended",
		"plugin:jsx-a11y/recommended",
		// Add specific rules for nextjs
		"plugin:@next/next/core-web-vitals",
		// Add specific rules for Jest
		"plugin:jest/recommended"
	],
	root: true,
	env: {
		browser: true,
		es6: true,
		node: true
	},
	ignorePatterns: ["**/node_modules", "**/dist", "**/build"],
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
			globalReturn: false
		},
		ecmaVersion: 2020,
		sourceType: "module"
	},
	globals: {
		context: "readonly",
		cy: "readonly",
		assert: "readonly",
		Cypress: "readonly"
	},
	settings: {
		react: {
			version: "detect"
		},
		next: {
			rootDir: "packages/app/"
		},
		"import/resolver": {
			alias: {
				extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
				map: [...Object.entries(alias)]
			}
		}
	},
	rules: {
		// See: https://github.com/benmosher/eslint-plugin-import/issues/496
		// https://stackoverflow.com/questions/44939304/eslint-should-be-listed-in-the-projects-dependencies-not-devdependencies
		"import/no-extraneous-dependencies": ["error", { devDependencies: true }],
		"import/prefer-default-export": 0,
		"no-console": ["warn"],
		"no-unused-vars": ["error", { ignoreRestSiblings: true }],
		"react/jsx-props-no-spreading": 0,
		"react/forbid-prop-types": [
			"error",
			{
				forbid: ["any", "array"],
				checkContextTypes: true,
				checkChildContextTypes: true
			}
		],
		"react/react-in-jsx-scope": "off",
		"jsx-a11y/anchor-is-valid": "off",
		"react/no-unescaped-entities": "off",
		// next/image might not be yet a good move as of NextJs v11.
		// https://github.com/vercel/next.js/discussions/16832
		"@next/next/no-img-element": "off"
	}
};
