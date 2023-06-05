import _ from "lodash";

const titleCase = "Usher";
export const brandName = {
	titleCase,
	snakeCase: _.snakeCase(titleCase),
	lowerCase: _.lowerCase(titleCase)
};
