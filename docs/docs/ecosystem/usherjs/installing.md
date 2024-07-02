---
sidebar_position: 2
---

# Installation

:::tip
When installing UsherJS on your Web App or dApp, **it is highly recommended to load UsherJS on every page**. This way, no matter where the Campaign redirects your Referred Users, UsherJS is installed to parse the current URL immediately.
:::

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
:::note
`window.UsherLoaders` can be used to register a function that will execute when UsherJS loads onto the page.
:::


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
