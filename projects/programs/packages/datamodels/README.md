# `@usher.so/datamodels` - Ceramic Data Models for Usher

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
  {
  	"name": "A magic wallet",
  	"description": "A magic wallet associated to a DID",
  	"schema": "ceramic://k3y52l7qbv1fry3dgjlthkoygw6a8p50cjth9texpv1looy8umrbbkrpnrbjj80sg"
  }
  ```

### Deploying Models

```shell
glaze model:deploy magic-wallets ./models/MagicWallet.json
```

### Updating Models

As per this [Discord Message](https://discord.com/channels/682786569857662976/937412186781909012/964094124649242654), Schema Documents are Streams, so it's just be a matter of applying a new commit using the `TileDocument.update()`.
Glaze does not currently support this natively.
**The commit updates to a schema should have backward compatibility -- based on logic.**

```shell
glaze stream:state kjzl6cwe1jw14a4khio3qvh7jen9decdi4xgvg3xivzo5ms2cig6h7l7rx2tfct                                                                                                         03:03:19 pm
✔ Successfully queried stream kjzl6cwe1jw14a4khio3qvh7jen9decdi4xgvg3xivzo5ms2cig6h7l7rx2tfct
{
  type: 0,
  content: {
    type: 'object',
    title: 'MagicWallets',
    '$schema': 'http://json-schema.org/draft-07/schema#',
    properties: {
      arweave: {
        type: 'object',
        title: 'arweave',
        properties: {
          data: { type: 'string', title: 'data' },
          address: { type: 'string', title: 'address' }
        }
      }
    }
  },
  metadata: {
    unique: 'YuG5O0/EWtisz+no',
    controllers: [ 'did:key:z6MkwVNrdkjiAzEFoWVq9J1R28gyUpA3Md7Bdx8DaABhQzVX' ]
  },
  signature: 2,
  anchorStatus: 0,
  log: [
    {
      cid: CID(bagcqceraykyfiubvaascq26dtg4rfdukuh3h6imoku6p2vuebeckdmsszd6q),
      type: 0
    }
  ]
}
```

## Executing Commands

Running commands directly requires the following:

```shell
node --experimental-specifier-resolution=node --loader ts-node/esm ./cmd/arcampaigns.ts ls
```

The reason is because the core depedencies are ESM-only.
