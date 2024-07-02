/*
 * Necessary for mapping the old docs routes to the new ones
 * So any link to the old docs will be redirected to the new docs
 */

/**
 * @param {RedirectMapping} obj
 * @returns {DocusaurusRedirect}[]
 */
const getRedirectsFromMapping = (obj) => {
	return Object.entries(obj).map(([from, to]) => ({ from, to }));
};

module.exports = {
	getRedirectsFromMapping
};
