---
sidebar_position: 4
---

# UsherJS API & Properties

Instantiating the UsherJS library provides a JavaScript object that responds to a few methods. These allow you to manage
referral tokens and execute on conversions.

:::tip
To get more details on object and method types, you can refer to the [**documentation we have generated**](https://ts-docs.js.usher.so/) for our API and properties.
:::

### `usher.convert(conversion)`

To submit a conversion, you must provide parameters that identify the Campaign you are creating a conversion for, as
well as provide additional data that affects the way conversions are processed.

```javascript
Usher("convert", {
	id: "ida4Pebl2uULdI_rN8waEw65mVH9uIFTY1JyeZt1PBM",
	chain: "arweave",
	eventId: 0,
	commit: 10,
	nativeId: "ksFTLgrwQGtNrhRz6MWyd3a4lvK1Oh-QF1HYcEeeFVk",
	metadata: {
		amount: 1000,
		convertType: "defi",
		action: "stake"
	}
});
```

**Method parameters**

<table><thead><tr><th>Object Property Name/Key</th><th>Type</th><th>Description</th><th data-type="checkbox" data-hidden>Required</th></tr></thead><tbody><tr><td><strong>id</strong></td><td>string</td><td>The Identifer of the Campaign acquired during Campaign creation</td><td>true</td></tr><tr><td><strong>chain</strong></td><td>string</td><td>The blockchain identifer acquired during Campaign creation</td><td>true</td></tr><tr><td><strong>eventId</strong></td><td>integer</td><td>The identifier of the Campaign Event defined during Campaign creation. <br/>This is usually <strong><code>0</code></strong> for single event Campaigns. <br/>Where different rewards can be distributed at different points throughout the Referred User journey, this can <strong><code>0</code></strong> to <strong><code>X</code></strong>.</td><td>true</td></tr><tr><td><strong>nativeId</strong></td><td>string</td><td>An identifier of the User native to the Web3 Brand's Web App. <br/>This can be a Web3 Wallet Address used to authorise into the Web3 Brand's Web App.<br/><br/>By default, assigning submitting a Native ID is a way to ensure that the Referred User can only ever be converted once.<br/>Combining this with a Campaign Event <strong>Native Limit</strong> can deliver an experience where a Referred User can continue to convert until their conversions have <strong>committed</strong> enough to have reached the <strong>Native Limit</strong>.</td><td>false</td></tr><tr><td><strong>commit</strong></td><td>integer</td><td>An arbitrary value that indicates how much of the Event this Conversion consumes for the Referred (Native) User and/or whether to Event Reward Rate should be calculated.<br/>This parameter is only necessary where the Event has a corresponding <strong>Native Limit</strong> or where rewards are issued <strong>Per Commit.</strong></td><td>false</td></tr><tr><td><strong>metadata</strong></td><td>object</td><td>An arbitrary record of key/values that the Brand can use.</td><td>false</td></tr><tr><td><strong>metadata.amount</strong></td><td>integer</td><td>The only <strong>special</strong> key in the <code>metadata</code> <strong></strong> property is the <code>amount</code> key.<br/>This is the amount of value to be used when calculating a <strong>percentage-</strong>based reward.<br/>ie. For DeFi or Commerce applications that reward commissions as percentage-based calculations.</td><td>false</td></tr></tbody></table>

### `usher.parse(url?, keepQueryParams?)`

This method is used to parse the current URL query parameters to extract and save the Usher Referral Token. The Query
Parameter `_ushrt` is appended to the Campaign Destination URL automatically when an Usher Invite Link is visited.&#x20;

:::info
This method is immediately called when UsherJS is loaded on a Browser-based Web App.
:::

If a URL is provided, it will be parsed instead of the current web page URL.&#x20;

By default, the current web page URL has the `_ushrt` query parameter cleared after it is saved.

### `usher.token(campaignReference)`

A method to fetch the currently saved Referral Token that will be used in the next executed
conversion - `convert(conversion)`

This can be useful if your conversion tracking process involves more long-formed and controlled referral token storage.

**Method parameters**

| Object Property Name/Key | Type                            | Description                 |
| ------------------------ | ------------------------------- | --------------------------- |
| campaignReference        | `{ id: string, chain: string }` | A reference to the Campaign |

### `usher.anchor(anchorSelector, campaignReference)`

Modify the `href` attribute on an `<a>` Anchor HTML Element to include the currently saved Referral Token.&#x20;

This can be used to pass the `_ushrt` Referral Token between websites/origins/domains.

**Method parameters**

| Object Property Name/Key | Type                            | Description                                                   |
| ------------------------ | ------------------------------- | ------------------------------------------------------------- |
| anchorSelector           | string                          | CSS Selector that points to the Anchor Element to be modified |
| campaignReference        | `{ id: string, chain: string }` | A reference to the Campaign                                   |

### `usher.config(config?)`

A method to update the configuration of the UsherJS object.

### `usher.flush()`

A method to flush/remove all cached referral tokens stored in Browser Storage.
