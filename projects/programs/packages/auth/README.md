# `@usher.so/auth`

Usher Auth is a package that contains all of the authentication processes required to interface with Ceramic and with Usher's APIs.

## Features

### Wallet Abstraction

The Usher Auth module abstracts authentication with different wallets and authentication methods.  
During authentication, a unique DID is produced deterministically dependent on the authentication method.  
Authentication methods supported:

- Metamask
- Coinbase Wallet
- Wallet Connect
- Magic SDK
- Arweave (JWK) compatibile wallets

### Authentication

```javascript
import { Connections } from "@usher.so/shared";

const authInstance = new Authenticate(arweave, ethProvider);

await authInstance.withEthereum(
	wallet.accounts[0].address,
	Connections.METAMASK
);
const ethAuth = authInstance.getAuth(wallet.accounts[0].address);

// Print DID for this Auth
console.log(ethAuth.did.id);
```

### Auth Tokens for API usage

By generating a unique DID for each specific authentication, there is now a collection of authentications that represent the same user.  
Each DID exposes the same interface for using cryptography to identify the underlying authentication/user.  
A token can be generated using this collection of authentications to uniquely indetify the user inside of a backend stateless environment. ie. a centralised serverless API handler.  
An API can then intelligently store each unqiue DID in relation to each other, ideally in a graph, to produce a profile of a user based on their authentication methods.

#### Generating an Auth Token

```javascript
import { Connections } from "@usher.so/shared";

const authInstance = new Authenticate(arweave, ethProvider);

await authInstance.withEthereum(
	wallet.accounts[0].address,
	Connections.METAMASK
);
await authInstance.withArweave(
	arweaveWalletAddress,
	Connections.ARCONNECT,
	arConnect // window.arweaveWallet
);

// Print DID for this Auth
const token = await authInstance.getAuthToken();
console.log(token);
```

#### Validating an Auth Token

The following example illustrates Auth Token validation inside of an Express.js Middleware/Handler.

```javascript
import { Base64 } from "js-base64";
import { DagJWS, DID } from "dids";
import { getResolver as getKeyResolver } from "key-did-resolver";

const verify = async (did: string, sig: DagJWS): Promise<boolean> => {
	const instance = new DID({
		resolver: {
			...getKeyResolver(),
		},
	});
	const result = await instance.verifyJWS(sig, { issuer: did });
	if (result.kid) {
		return true;
	}

	return false;
};

// --- Inside of Express.js handler
let payload;
try {
	payload = JSON.parse(Base64.decode(req.token));
} catch (e) {
	req.log.debug("Failed to parse token");
	return res.status(403).json({
		success: false,
	});
}

// Payload is an array of dids and their respective signature
try {
	const user = (
		await Promise.all(
			payload.map(
				async ([did, sig, wallet]: [string, DagJWS, string[] | undefined]) => {
					try {
						const instance = new DID({
							resolver: {
								...getKeyResolver(),
							},
						});
						const result = await instance.verifyJWS(sig, { issuer: did });
						const verified = !!result.kid;
						if (verified) {
							return {
								did,
								wallet: wallet
									? {
											chain: wallet[0],
											address: wallet[1],
									  }
									: null,
							};
						}
					} catch (e) {
						//* This will fail if the Signature Payload includes sepcial characters
						req.log.debug(
							{ error: e, did, sig, wallet },
							"Cannot verify JWS for DID"
						);
					}
					return null;
				}
			)
		)
	).filter((did) => typeof did !== null && !isEmpty(did));

	if (user.length === 0) {
		req.log.debug("No user loaded");
		return res.status(403).json({
			success: false,
		});
	}

	req.user = user;

	// Perform some logic on the user

	return next();
} catch (e) {
	req.log.error(e);
	return res.status(403).json({
		success: false,
	});
}
```

## 📕 Documentation

- Usher Auth Typescript Docs: [https://ts-docs.programs.usher.so/modules/Usher_Auth](https://ts-docs.programs.usher.so/modules/Usher_Auth)

## Troubleshooting

- For questions, support, and discussions: [Join the Usher Discord](https://go.usher.so/discord)
- For bugs and feature requests: [Create an issue on Github](https://github.com/usherlabs/programs/issues)
