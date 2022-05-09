import { initGun, Gun } from "@/utils/gun-client";

export enum SupportedChains {
	ARWEAVE = "ar"
}

type EncryptionOptions = {
	algorithm: string; // encryption algorithm
	hash: string; // encryption hash
	salt?: string; // optional salt
};

interface IWalletProvider {
	encrypt(data: string, options?: EncryptionOptions): Promise<Uint8Array>;
	decrypt(data: Uint8Array, options?: EncryptionOptions): Promise<string>;
}

class Wallet {
	private readonly HASH = "nVT9L9aocoUuC4rCs27tnKxDrwNvjRCK";

	private provider: IWalletProvider;

	private chainId: string;

	protected address: string = "";

	protected active: boolean = false;

	protected key: { pub: string; epub: string; data: Uint8Array } | undefined;

	constructor(
		address: string,
		provider: IWalletProvider,
		chainId: SupportedChains = SupportedChains.ARWEAVE
	) {
		this.address = address;
		this.provider = provider;
		this.chainId = chainId;
	}

	public getAddress() {
		return this.address;
	}

	public isActive() {
		return this.active;
	}

	public async setup() {
		const isFetched = await this.get();
		if (!isFetched) {
			await this.create();
		}
	}

	public async get() {
		const gun = (await initGun())();
		const data = await gun.get(this.getNamespace()).then();
		if (data) {
			console.log(data);
			this.active = data.active;
			return true;
		}
		return false;
	}

	public async create() {
		const sea = Gun.SEA;
		const gun = (await initGun())();
		const pair = await sea.pair();
		const { pub, epub, ...pairData } = pair;
		const encPair = await this.provider.encrypt(JSON.stringify(pairData), {
			algorithm: "AES-CTR",
			hash: this.HASH
		});
		const key = { pub, epub, data: encPair };
		const data = await gun
			.get(this.getNamespace())
			.put({ active: true, key })
			.then();
		if (data) {
			this.active = data.active;
			this.key = data.key;
			return true;
		}
		return false;
	}

	// public async link(wallet: Wallet) {

	// }

	protected getNamespace() {
		return `wallet/${this.chainId}/${this.address}`;
	}
}

export default Wallet;
