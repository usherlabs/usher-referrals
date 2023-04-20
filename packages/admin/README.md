# Admin

## Introduction

This package builds into a CLI that enables you to execute some administrative functions on your Usher node.

## Environment variables

You may need to set up the following environment variables to be able to run this CLI:

| Environment Variable | Description                                                                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ARWEAVE_LOCAL_PORT   | Set this if you need to run on a local instance of Arweave - ie. [ArLocal](https://github.com/textury/arlocal).                                            |
| CERAMIC_URL          | Set this to use a Ceramic URL. https://ceramic.usher.so/ for Production and https://ceramic-clay.3boxlabs.com/ development.                                |
| DID_KEY              | A secret key for managing the Ceramic Streams. Use [`@glaze/cli`](https://github.com/ceramicstudio/js-glaze/tree/main/packages/cli) to create your own DID |

## Available commands

```
Usage: uadmin [options] [command]

Options:
  -h, --help      display help for command

Commands:
  schema          Manage Usher Ceramic Schema
  tile            Manage Usher Ceramic Tiles
  definition      Manage Usher Ceramic Definitions
  arweave         Manage Arweave
  app             Admin utils for the Next.js Usher dApp
  did [options]   Show DID for Key
  help [command]  display help for command
```

---

### `adminu schema update`

Update Schema in a Ceramic Model

**Usage**

```
adminu schema update <id> <filepath>
```

**Arguments:**

- id: Schema Stream ID that will be updated
- filepath: Path to Schema file that will be used as the updated version

**Options:**

- `--key, -k <string>`: DID Key

---

### `adminu tile load`

Load a Ceramic Tile by ID

**Usage**

```
adminu tile load <id>
```

**Arguments:**

- id: Tile Stream ID that will be updated

**Options:**

- `--key, -k <string>`: DID Key
- `--commits, -c`: Show all commits for the Stream

---

### `adminu definition update`

Update Definition in a Ceramic Model

**Usage**

```
adminu definition update <id> <content>
```

**Arguments:**

- id: Definition Stream ID that will be updated
- content: Definition JSON string that will be used as the updated version

**Options:**

- `-k, --key <string>`: DID Key

---

### `adminu arweave wallet new`

Create a new Arweave Wallet for internal Campaign purposes

**Usage**

```
adminu arweave wallet new
```

**Options:**

- `-k, --key <string>`: DID Key
- `-l, --local`: Use Arweave Local
- `-r, --recipient <string...>`: Additional DID Recipients for the Encrypted Wallet

---

### `adminu app revalidate`

Get Auth Token for use with Next.js Usher dApp API

**Usage**

```
adminu app revalidate
```

**Options:**

- `--key, -k <string>`: DID Key
- `--path, -p <string>`: dApp Path to revalidate
- `--host, -h <string>`: dApp host/origin (default: https://app.usher.so)

---

### `adminu did`

Show DID for Key

**Usage**

```
adminu did
```

**Options:**

- `--key, -k <string>`: DID Key

---

### `adminu did decrypt`

Decrypt a Base64 Encoded JWE

**Usage**

```
adminu did decrypt
```

**Options:**

- `--key, -k <string>`: DID Key

---

### `adminu did encrypt`

Encrypt and encode a string

**Usage**

```
adminu did encrypt
```

**Options:**

- `--key, -k <string>`: DID Key
- `-r, --recipient <string...>`: Additional DID Recipients for the Encrypted Wallet

---

### `adminu did auth-token`

Get Auth Token for use with Next.js Usher dApp API

**Usage**

```
adminu did auth-token
```

**Options:**

- `--key, -k <string>`: DID Key

---

## About technologies used

- `arweave`: Arweave client used to create new wallets
- `ceramic`: There are several support commands to help manage Ceramic decentralized schemas

## What’s next?

[View other packages →](../)

[Go to Usher main documentation →](https://docs.usher.so/)
