/* eslint-disable no-var, vars-on-top */

import { PrismaClient } from "@prisma/client";

// Initiating a variable within the Global scope
// Required before the `import` treats this piece of code as a module
// Use `var` to maximise the scope of the variable.
declare global {
	var prisma: PrismaClient | undefined;
}

export const prisma =
	globalThis.prisma ||
	new PrismaClient({
		// log: ["query", "error", "warn"],
	});

if (process.env.NODE_ENV !== "production") {
	globalThis.prisma = prisma; // for testing and dev purposes.
}

export default prisma;
