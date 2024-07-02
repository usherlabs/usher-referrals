import os from "os";
import { ZodError } from "zod";

function handleZodError(error: ZodError) {
	const message = error.issues
		.map((issue) => `${issue.path}: ${issue.message}`)
		.join(os.EOL);

	console.error(message);
}

export function handleError(error: Error) {
	if (error instanceof ZodError) {
		handleZodError(error);
	} else {
		console.error(error.message);
	}
}
