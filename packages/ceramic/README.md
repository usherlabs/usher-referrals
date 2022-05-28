# Ceramic Utility for Usher

- Generated DID Key - `openssl rand -hex 32`
- **Glaze CLI** -- [https://developers.ceramic.network/tools/glaze/example/](https://developers.ceramic.network/tools/glaze/example/)

## Getting Started

1. Install the Glaze CLI - `yarn global add @glazed/cli`
2. Fetch the DID Key from your Team Lead


## Models

### [`magic-wallets`](./models/MagicWallet.json)

- [Schema](./schema/MagicWallet.json):
  - See [./schema/MagicWallet.json](./schema/MagicWallet.json)
- Definition: `k3y52l7qbv1fry9ckuzglu1tqo69m7or7qwayc09i8njfrddsit05acie3ys02zgg`
	```json
		{"name":"A magic wallet","description":"A magic wallet associated to a DID","schema":"ceramic://k3y52l7qbv1fry3dgjlthkoygw6a8p50cjth9texpv1looy8umrbbkrpnrbjj80sg"}
	```

### Deploying Models

```shell
glaze model:deploy magic-wallets ./models/MagicWallet.json
```
