/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	moduleNameMapper: {
		"^@(/)(.*)$": `<rootDir>/src/$2`,
		"^@(tests/)(.*)$": `<rootDir>/tests/$2`
	}
};
