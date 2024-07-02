import { EnvOptions } from "@usher.so/shared";

export class AuthOptions extends EnvOptions {
	readonly ceramicUrl: string;

	constructor(options?: Partial<AuthOptions>) {
		super(options);

		this.ceramicUrl = this.getValue(
			options?.ceramicUrl,
			"https://ceramic-clay.3boxlabs.com",
			"https://ceramic.usher.so"
		);
	}

	static readonly default = new AuthOptions();
}
