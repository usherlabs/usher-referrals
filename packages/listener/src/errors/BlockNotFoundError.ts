import { CustomError } from "./CustomError";

export class BlockNotFoundError extends CustomError {
	constructor() {
		super("Block not found");
	}
}
