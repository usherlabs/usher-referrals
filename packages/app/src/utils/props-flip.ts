/**
 * This util accepts a condition, and an Object with array values.
 * The array values should only contain 2 elements. The first element returns as the result value if the condition is true, and the second returns if the condition is false.
 */

const propsFlip = (cond: boolean, obj: Record<string, any>) => {
	return Object.entries(obj).reduce(
		(acc: Record<string, any>, [key, val]: [string, any]) => {
			const value = val[cond ? 0 : 1];
			if (typeof value !== "undefined" && value !== null) {
				acc[key] = value;
			}
			return acc;
		},
		{}
	);
};

export default propsFlip;
