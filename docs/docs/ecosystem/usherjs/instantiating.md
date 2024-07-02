---
sidebar_position: 3
---

# Instantiating Usher.js

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