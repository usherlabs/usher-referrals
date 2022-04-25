import { toaster } from "evergreen-ui";

export const error = () => {
	const msg = `Oops! Something went wrong. Please contact support, or refresh and try again.`;
	toaster.danger(msg, { duration: 10 });
};
