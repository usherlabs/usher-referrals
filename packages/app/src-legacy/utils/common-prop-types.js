import PropTypes from "prop-types";

export const ChildrenProps = PropTypes.oneOfType([
	PropTypes.string,
	PropTypes.func,
	PropTypes.node,
	PropTypes.arrayOf(PropTypes.node)
]);

export const ElementProps = PropTypes.oneOfType([
	PropTypes.element,
	PropTypes.object,
	PropTypes.func
]);
