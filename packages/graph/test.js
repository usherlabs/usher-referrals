import "ts-mocha";
import Mocha from "mocha";

const mocha = new Mocha();
mocha.addFile(`tests/**/*.test.ts`);
mocha.run((failures) => {
	process.on("exit", () => {
		process.exit(failures); // exit with non-zero status if there were failures
	});
});

// TS_NODE_PROJECT="./src/tsconfig.json" TS_CONFIG_PATHS=true node --experimental-specifier-resolution=node --loader ts-node/esm ./test.js
