import _ from "lodash";
import { brandConfig } from "@/brand";

const titleCase = brandConfig.companyName;
export const brandName = {
	titleCase,
	snakeCase: _.snakeCase(titleCase),
	lowerCase: _.lowerCase(titleCase)
};
