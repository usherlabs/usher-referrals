# `@usher.so/campaigns`

Usher Campaigns is a package that contains logic to support the creation of a Campaign on Usher.

A Campaign is comprised of three components.

1. A mutable doc (JSON) on the Campaign Advertiser
2. A mutable doc on Campaign Details that do not affect the reward/event mechanisms.
3. An immutable doc that references the mutable docs, as well as includes data related to conversion events and rewards.

## Features

1. **Create Advertiser Doc**  
   The Advertiser Schema:

   ```json
   {
   	"name": "Advertiser Name",
   	"icon": "https://url_to.com/icon.png",
   	"description": "Service provider for DeFi strategy",
   	"externalLink": "https://advertiser_url.com",
   	"twitter": "https://twitter.com/advertiser_twitter_handle"
   }
   ```

   Creating Advertiser Doc:

   ```javascript
   import { Campaigns, parseAdvertiserDoc } from "@usher.so/campaigns";
   const advertiser = parseAdvertiserDoc({
   	name: "Advertiser Name",
   	icon: "https://url_to.com/icon.png",
   	description: "Service provider for DeFi strategy",
   	externalLink: "https://advertiser_url.com",
   	twitter: "https://twitter.com/advertiser_twitter_handle",
   });
   const campaignsProvider = new Campaigns();
   const ceramicTile = await campaignsProvider.createAdvertiser(
   	advertiser,
   	user_did
   );
   ```

2. **Create Campaign Details Doc**  
   The Campaign Details Schema:

   ```json
   {
   	"name": "Some new Campaign",
   	"description": "A description for my Campaign",
   	"destination_url": "https://google.com",
   	"external_link": "https://usher.so?ref=test-campaign",
   	"image": "https://usher-pub.s3.amazonaws.com/app/usher-logo-medium.png"
   }
   ```

   Creating Campaign Details Doc:

   ```javascript
   import { Campaigns, parseAdvertiserDoc } from "@usher.so/campaigns";
   const advertiser = parseAdvertiserDoc({
   	name: "Some new Campaign",
   	description: "A description for my Campaign",
   	destination_url: "https://google.com",
   	external_link: "https://usher.so?ref=test-campaign",
   	image: "https://usher-pub.s3.amazonaws.com/app/usher-logo-medium.png",
   });
   const campaignsProvider = new Campaigns();
   const tile = await campaignsProvider.createCampaignDetails(
   	campaignDetails,
   	user_did
   );
   ```

3. **Create a Campaign**  
   Example Campaign Schema:

   ```json
   {
   	"chain": "ethereum",
   	"disable_verification": true,
   	"events": [
   		{
   			"strategy": "flat",
   			"rate": 0.1,
   			"description": "Something happens on my website!"
   		}
   	],
   	"reward": {
   		"name": "ChainLink",
   		"ticker": "LINK",
   		"type": "erc20",
   		"address": "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"
   	},
   	"advertiser": "ceramic_document_stream_id",
   	"details": "ceramic_document_stream_id_2"
   }
   ```

   To create a Campaign,

   1. you first must deploy the Campaign Doc to Arweave where it resides immutably.
   2. you then must submit the Arweave Transaction ID to the Usher API where it is then indexed.

   These two steps are managed inside the Campaign Module under the `createCampaign` and `indexCampaign` methods of the `CampaignDoc`.

   A sample Campaign on Arweave can be found here:  
    [https://viewblock.io/arweave/tx/tXMBq2s8WVpi0javfvChBTw5mQqkRaw8msejyGoHHhA](https://viewblock.io/arweave/tx/tXMBq2s8WVpi0javfvChBTw5mQqkRaw8msejyGoHHhA)

   More information on the purpose of each Campaign property can be found here:  
    [https://docs.usher.so/advertise-and-grow-your-web3-brand/the-campaign-object](https://docs.usher.so/advertise-and-grow-your-web3-brand/the-campaign-object)

   ```javascript
   import { Campaigns, parseCampaignDoc } from "@usher.so/campaigns";
   const campaign = await parseCampaignDoc(campaignJson);

   	const campaignsProvider = new Campaigns();
   	const privateKey = await readWallet(walletData); // read private key of wallet from somewhere.

   	console.log("Uploading campaign to Arweave...");
   	const transactionId = await campaignsProvider.createCampaign(
   		campaign,
   		privateKey,
   		{
   			bundlrUrl // use a default -- ie. http://node1.bundlr.network,
   			currency, // set a currency -- ie. matic
   		}
   	);

   	await sleep(2000);
   	console.log(`Indexing campaign with origin ${transactionId} on Usher...`);

   	try {
   		const response = await campaignsProvider.indexCampaign(transactionId);
   		console.log("Indexed successfully!");
   		console.log(JSON.stringify(response.campaign, null, 2));
   	} catch (e) {
   		throw ono("Cannot index Campaign in Usher", e);
   	}
   ```

   While [Bundlr Network](https://bundlr.network/) is not required to submit the Arweave payloads, it does remove delays associated to Arweave's block time.

## 📕 Documentation

- Usher Campaigns Typescript Docs: [https://ts-docs.programs.usher.so/modules/Usher_Campaigns](https://ts-docs.programs.usher.so/modules/Usher_Campaigns)

## Troubleshooting

- For questions, support, and discussions: [Join the Usher Discord](https://go.usher.so/discord)
- For bugs and feature requests: [Create an issue on Github](https://github.com/usherlabs/programs/issues)
