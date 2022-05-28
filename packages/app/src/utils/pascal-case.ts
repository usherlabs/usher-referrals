import startCase from "lodash/startCase";

export default (str: string) => {
	return startCase(str).split(" ").join("");
};
