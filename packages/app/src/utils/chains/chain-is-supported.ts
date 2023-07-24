import { Chains } from "@usher.so/shared";

export function chainIsSupported(chain: string): chain is Chains {
	return Object.values(Chains).includes(chain as Chains);
}
