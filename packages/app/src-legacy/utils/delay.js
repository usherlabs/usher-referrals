const delay = (timeout) =>
	new Promise((resolve) => {
		setTimeout(resolve, timeout);
	});

export default delay;
