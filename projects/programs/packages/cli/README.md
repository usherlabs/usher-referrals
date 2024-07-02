# `@usher.so/cli`

## Installation & Setup

Install using npm with the -g global flag, or yarn using the global scope. Depending on your unique setup and configuration, you may need to use the sudo command.

```shell
npm i -g @usher.so/cli

OR

yarn global add @usher.so/cli
```

To fund Arweave transaction submissions via the Bundlr Network, it is also important to install the Bundlr CLI in order to fund your instant Arweave data uploads.

See more information on the Bundlr CLI here: [https://docs.bundlr.network/docs/CLI/Installation-Setup](https://docs.bundlr.network/docs/CLI/Installation-Setup)

## Usage

The command `usher --help` returns a list of all commands and option flags.

```shell
$ usher --help

Usage: Usher CLI [options] [command]

Options:
  -v, --version     output the version number
  -h, --help        display help for command

Commands:
  advertiser        Manage Advertiser
  campaign-details  Manage Campaign Details
  campaign          Manage Campaigns
  help [command]    display help for command
```

### Authenticate with an Advertiser DID

To create, deploy and update Ceramic Documents (aka Streams), you are required to create a DID.

To simply create a new DID and Seed Key:

```shell
usher advertiser auth
```

**Be sure to store your Seed Key in a safe place.**

### Create an Advertiser Profile/Doc

1. Use the `template` command to create a JSON template file that you can edit to your preference.
   ```shell
    usher advertiser template > advertiser.json
   ```
2. Once you've editted the `advertiser.json` file, create the Advertiser Doc:
   ```shell
    usher advertiser create --file ./advertiser.json --key auth_seed_key
   ```
3. To verify that you have created the doc, you can find the doc in your doc list:
   ```shell
    usher advertiser list
   ```

### Create a Campaign Details Doc

1. Use the `template` command to create a JSON template file that you can edit to your preference.
   ```shell
    usher campaign-details template > details.json
   ```
2. Once you've editted the `details.json` file, create the Campaign Details Doc:
   ```shell
    usher campaign-details create --file ./details.json --key auth_seed_key
   ```
3. To verify that you have created the doc, you can find the doc in your doc list:
   ```shell
    usher campaign-details list
   ```

### Create a Campaign

1. Use the `template` command to create a JSON template file that you can edit to your preference.
   ```shell
    usher campaign template > campaign.json
   ```
2. Take note of your Campaign Details and Adveriser Doc/Stream Identifiers.
   - These identifiers are relevant to the Ceramic Network.
   - `usher campaign-details list` and `usher advertiser list` can be used to fetch the relevant Ceramic Doc/Stream identifiers.
   - An example of an identifer is: `kjzl6cwe1jw149392kdn0ny2dgskjvwykev1b1jxxegvt83cjgqzbbkbkrk70w5`
3. Once you've editted the `campaign.json` file, create the Campaign:
   ```shell
    usher campaign create --file ./campaign.json --key auth_seed_key --wallet wallet_private_key_or_file --currency matic --advertiser advertiser_stream_id --details details_stream_id
   ```

This process will automatically index the Campagin on Usher after deploying the payload to the immutable Arweave storage environment.

> **Bundlr Funding Error**:  
> If you receive an error related to funding Bundlr, it is important you install the Bundlr CLI and perform the funding process with the relevant currency/network
>
> ```shell
> npx bundlr fund 172936555468356 -h http://node1.bundlr.network -w wallet_private_key -c matic
> ```
>
> You can learn more about this here: [https://docs.bundlr.network/docs/CLI/Funding-A-Node](https://docs.bundlr.network/docs/CLI/Funding-A-Node)
>
> If you have funds on the Bundlr Network at a different Bundlr Node URL, be sure to pass the `--bundlr-url` to the `usher campaign create` command.

### Index a Campaign

If you have made changes to your Campaign Details or Advertiser docs, you will need to re-index the Usher Campaign.

```shell
usher campaign index arweave_tx_id
```

## Troubleshooting

- For questions, support, and discussions: [Join the Usher Discord](https://go.usher.so/discord)
- For bugs and feature requests: [Create an issue on Github](https://github.com/usherlabs/programs/issues)
