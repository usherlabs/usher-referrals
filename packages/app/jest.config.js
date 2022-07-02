// jest.config.js
const nextJest = require("next/jest");

const createJestConfig = nextJest({
	// Provide the path to your Next.js app to load next.config.js and .env files in your test environment
	dir: __dirname
});

// Add any custom config to be passed to Jest
const jestConfig = {
	testEnvironment: "jest-environment-jsdom",
	// Add more setup options before each test is run
	setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
	// if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
	moduleDirectories: ["node_modules", "<rootDir>/src"],
	moduleNameMapper: {
		"^@(/)(.*)$": `<rootDir>/src/$2`,
		"^@(tests/)(.*)$": `<rootDir>/tests/$2`,
		"^@(public/)(.*)$": `<rootDir>/public/$2`
	}
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(jestConfig);
