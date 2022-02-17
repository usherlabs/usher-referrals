/**
 * Alias config file
 */

const path = require("path");

/**
 * @param {Object} mapToFolders
 * eg.
 * {
 * 	'@': 'src',
 * 	'@tests': 'tests'
 * }
 */
const createAlias = (mapToFolders = {}, pathSegments) => ({
	/**
	 * eg.
	 * {
	 *  '@': '/Users/ryansoury/dev/callsesh',
	 *  '@tests': '/Users/ryansoury/dev/callsesh/tests'
	 * }
	 */
	alias: Object.entries(mapToFolders).reduce((result, [map, target]) => {
		result[map] = path.resolve(...pathSegments, target);
		return result;
	}, {}),

	/**
	 * eg.
	 * {
	 * 	"^@(/)(.*)$": "<rootDir>/$2",
	 *  "^@(tests/)(.*)$": "<rootDir>/tests/$2"
	 * }
	 */
	jestAlias: Object.entries(mapToFolders).reduce((result, [map, target]) => {
		const s = map.substring(1);
		result[`^@(${s}/)(.*)$`] = `<rootDir>/${target !== "test" && target}${
			target ? "/" : ""
		}$2`;
		return result;
	}, {})
});

const mapToFolders = {
	"@": "src",
	"@tests": "tests"
};

const { alias, jestAlias } = createAlias(mapToFolders, [__dirname, "../"]);
module.exports.alias = alias;
module.exports.jestAlias = jestAlias;
