# UsherJS

UsherJS is the latest version of Usher's Referral and Conversion Tracking Library - enabling you to automatically cache Usher Referral Tokens, and use said tokens to process Conversions and Reward your Partners once your Users take any action, such as:

1. stake Crypto
2. purchase an NFT
3. deposit funds into your dApp or Browser Extension
4. ... or take just about any other action on your dApp

## 📕 Documentation

- Integrate UsherJS: [https://docs.usher.so](https://docs.usher.so)
- UsherJS Typescript Docs: [https://ts-docs.js.usher.so](https://ts-docs.js.usher.so)
- View integration example: [See file](https://github.com/usherlabs/usher.js/blob/master/tools/index.html)
- Learn about Usher: [https://usher.so](https://usher.so)

## 🚀 Getting Started

When installing UsherJS on your Web App or dApp, **it is highly recommended to load UsherJS on every page**.
This way, no matter where the Campaign redirects your Referred Users, UsherJS is installed to parse the URL immediately.

### Using with `<script>`

```html
<script src="https://cdn.jsdelivr.net/npm/@usher.so/js"></script>
<script>
	(function () {
		function convert() {
			console.log("Usher loves Arweave!");
			const usher = window.Usher();
			usher.convert({
				id: "QOttOj5CmOJnzBHrqaCLImXJ9RwHVbMDY0QPEmcWptQ",
				chain: "arweave",
				eventId: 0,
				metadata: {
					amount: 100
				}
			});
		}
		if (typeof window.Usher === "undefined") {
			window.UsherLoaders = window.UsherLoaders || [];
			window.UsherLoaders.push(convert);
		} else {
			convert();
		}
	})();
</script>
<!-- UsherJS can even be loaded here with the use of window.UsherLoaders -->
```

### Using as an NPM Package

1. Install the package

```shell
# npm
npm i @usher.so/js

# yarn
yarn add @usher.so/js
```

2. Import the package into your project and you're good to go (with typescript compatibility)

```javascript
import { Usher } from "@usher.so/js";

const usher = Usher();
(async () => {
	const conversion = await usher.convert({
		id: "ida4Pebl2uULdI_rN8waEw65mVH9uIFTY1JyeZt1PBM",
		chain: "arweave",
		eventId: 0,
		commit: 10,
		// nativeId: "user_wallet_address",
		metadata: {
			hello: "world",
			key: "value"
		}
	});

	console.log("Conversion Result: ", conversion);
})();
```

## 🦾 UsherJS API

### Instantiating

UsherJS can be instantiated by optionally passing a `config` object.

```javascript
const usher = Usher();

// or
const usher2 = Usher({ apiUrl: "https://app.staging.usher.so/api" });

// or
const usher3 = Usher({ apiUrl: "<YOUR_USHER_NODE_URL>/api" });
```

#### Options

| **Option**         | **Type**      | **Default**                | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------ | ------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apiUrl`           | string        | "https://app.usher.so/api" | The URL to the Usher Core API to use for Conversion Tracking                                                                                                                                                                                                                                                                                                                                                                                   |
| `conflictStrategy` | string (enum) | "passthrough"              | An enum to indicate how to handle conflicting tokens for the same campaign. The option can be either be `"passthrough"` or `"overwrite"`. In the "passthrough" scenario, referal tokens are backlogged for the same campaign. Any previously tracked referral token is saved to the browser until it expires or is used. In the "overwrite", any new referral token that is saved overwrites other saved tokens relative to the same campaign. |

### Methods

Example method use:

```javascript
usher.parse();
const token = usher.token({
	id: "my_campaign_id",
	chain: "arweave"
});
usher.anchor("#my-anchor-element", {
	id: "my_campaign_id",
	chain: "arweave"
});
usher.convert({
	id: "my_campaign_id",
	chain: "arweave",
	eventId: 0
});
```

| **Method**                            | **Parameters**                                                                                                   | **Description**                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `config()`                            | [Config](https://ts-docs.js.usher.so//types/types.Config)                                                        | A string to indicate the event to execute, or the callback to register                                                                                                                                                                                                                                                                                           |
| `convert(conversion)`                 | [Conversion](https://ts-docs.js.usher.so//types/types.Conversion)                                                | An object with parameters implicating how the Conversion is handled, and the relevant Campaign and Campaign Event.                                                                                                                                                                                                                                               |
| `parse(url, keepQueryParam)`          | `url: string`, `keepQueryParam: boolean` (Default: false)                                                        | A method used to parse the current URL Query Parameters and save the Usher Referral Token `_ushrt`. **This method is immediately called when UsherJS is loaded on a Browser-based Web App**. A provided URL will be parsed instead of the current web page URL. By default, the current web page URL has the `_ushrt` query parameter cleared after it is saved. |
| `token()`                             | `{ id: string; chain: string }`                                                                                  | Fetch the currently saved Referral Token that will be used in the next executed conversion - `convert(conversion)`                                                                                                                                                                                                                                               |
| `anchor(anchorSelector, campaignRef)` | `anchorSelector: string`, `ref:` [CampaignReference](https://ts-docs.js.usher.so//types/types.CampaignReference) | Modify the `href` attribute on an `<a>` Anchor HTML Element to include the currently saved Referral Token. This can be used to pass the `_ushrt` Referral Token between websites/origins/domains.                                                                                                                                                                |
| `flush()`                             | -                                                                                                                | Flush all saved tokens from browser storage                                                                                                                                                                                                                                                                                                                      |

## 🧑‍💻 Testing Integration

To test your integration of UsherJS, be sure to configure using `Usher({ apiUrl })`. You can use our [Usher Staging Environment](https://app.staging.usher.so/), or you can use your own Usher Core Node.

[Learn more about the Usher Core Node →](https://github.com/usherlabs/usher)

### Testing with Usher Staging Environment

You may use our Staging Environment to test your integration of UsherJS. To do so, you will need to:

1. Copy and use the identifier of a Test Campaigns over at the [Usher Staging Environment](https://app.staging.usher.so/).
2. Set the `apiUrl` option when instantiating UsherJS to `https://app.staging.usher.so/api`

### Testing with your own Usher Core Node

Deploy your own Usher Core Node to test your integration. To do so, you will need to:

1. Copy and use the identifier of a newly created Test Campaign to trigger conversions against.
2. Set the `apiUrl` option when instantiating UsherJS to the URL of your Usher Core API. (e.g. on local development: `http://localhost:3000/api`)

## 🐒 Development

First, clone the repo and then startup our local dev environment:

```
$ git clone git@github.com:usherlabs/usher.js.git
$ cd usher.js
$ yarn
$ yarn dev
```

In a separate Terminal Tab, serve the Example HTML file:

```
yarn local
```

Then, make your changes and test them out using the [test Campaign on the Usher Staging Environment](https://app.staging.usher.so/campaign/arweave/ida4Pebl2uULdI_rN8waEw65mVH9uIFTY1JyeZt1PBM)!
This specific Test Campaign has a destination URL [http://localhost:3001/](http://localhost:3001/)

You may also use your own Usher Core Node to contribute to the development of Usher.js.
