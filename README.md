<div align="center">
  <h1>Usher Core</h1>
	<div>
		<span>
			<a href="https://www.npmjs.com/package/prisma"><img src="https://img.shields.io/badge/-web3-blue" /></a>
		</span>
		<span>
			<a href="https://www.gnu.org/licenses/agpl-3.0"><img src="https://img.shields.io/badge/License-AGPL_v3-blue.svg" /></a>
		</span>
	</div>
</div>

![Usher Banner](https://camo.githubusercontent.com/4a4439986d28507dd8b0e89e1855eaf5d362ce08c2de16223c0af6f5917f1313/68747470733a2f2f75736865722d7075622e73332e616d617a6f6e6177732e636f6d2f6d6973632f62616e6e6572732f42616e6e65722e6a7067)

<div align="center">
   <a href="https://www.usher.so">Website</a>
   <span> | </span>
   <a href="https://docs.usher.so">Full Docs</a>
   <span> | </span>
   <a href="https://go.usher.so/discord">Discord</a>
   <span> | </span>
   <a href="https://go.usher.so/twitter">Twitter</a>
</div>

## 👋 Introduction

**Usher Core** is a monorepo containing the packages that run Usher’s primary decentralized application (dApp). It is
designed to provide a seamless experience for end users and empower the development of robust communities.

In this repository, you will find comprehensive documentation to understand how the **Usher Core** functions, how to
understand our implementation approach and other technical details. For additional concepts around **Usher Core** on
our [documentation page](https://docs.usher.so/).

Want to know more about Usher before diving into this repository? Find more on [our page](https://www.usher.so/)
or [Usher’s main documentation](https://docs.usher.so/).

> ⚠ If you want to learn how to interact with the Usher server from your own dApp, and not deploy an Usher instance,
> please proceed to the [Usher Programs repository](https://github.com/usherlabs/programs).

> ⚠ If you want to learn how to interact with an Usher instance, sending tracking conversions from your own web based application to an Usher instance, please proceed to the [Usher.js documentation](https://docs.usher.so/integrating-with-usherjs/what-is-usherjs).

## **🧭** Navigation

[→ Homepage](https://usher.so/)

[→ Main documentation](https://docs.usher.so/)

→ Core documentation [WIP]

## **🌟** Features

Usher Core encompasses the necessary code to run:

- A user-friendly front-end interface for end users
- Database migrations to ensure smooth updates
- Database utilities for backup, indexing, and other essential tasks
- Command-line tools for administrative support
- A listener that facilitates conversions based on smart contract events. [Learn more →](https://docs.usher.so/getting-started/how-smart-contracts-are-used)

## **📡** Technology stack

- **[Turborepo](https://turbo.build/repo):** powers a blazing-fast build step
- **[Yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/):** package manager with monorepo support
- **[NextJS](https://nextjs.org/):** React framework for web applications
- **[Ceramic network](https://ceramic.network/)**: Decentralized data network. Public NoSQL document storage where a
  user owns his data
- **[Humanode](https://humanode.io/)**: OAuth and [Sybil Resistance](https://blog.humanode.io/attack-on-sybil/)
  technology
- **[ArangoDB](https://arangodb.com/)**: Multi-mode centralized graph database. NoSQL document storage.

## **📐** Core architecture

![Usher core architecture](images/docs/CoreArchitecture.png)

- **Core dApp**: Usher Core's central component is a NextJS-based dApp that provides an accessible and user-friendly
  interface for managing campaigns. It also ensures smooth interaction with other services by employing deployed
  serverless functions.
- **User-owned Database**: By leveraging Ceramic's decentralized data storage network, Usher Core provides a secure and
  user-centric data management solution. Ceramic schemas ensure organized and consistent data storage for elements like
  partnerships, campaign details, and advertiser profiles while allowing users to maintain control over their data.
- **Sybil Resistance**: Employs Humanode's Sybil Resistance and OAuth systems to maintain the integrity of user
  interactions within the platform, ensuring that only genuine users can participate in the ecosystem and preserving the
  security and trustworthiness of user accounts.
- **Graph Database**: Centralized storage using ArangoDB, a multi-mode graph database. It holds data about user
  interactions, partnerships, campaigns, and more.

## 🛰️ Usher Ecossystem

### Usher Core (you are here)

Usher Core is the central component of the Usher ecosystem, responsible for operating the primary decentralized application (dApp) driving the Usher experience. Deploying an Usher Core node sets up the fundamental infrastructure, which includes a user-friendly frontend interface and communication with essential databases, allowing you to manage your own partnerships and campaigns with ease and efficiency.

### Usher Programs

Usher Programs streamline integration between your application and an Usher Core instance, focusing on campaign and partnership management. It supports authentication and wallet connections, ensuring smooth integration and seamless user interactions with your application.

[Learn more at Usher Programs' repository →](https://github.com/usherlabs/programs)

### Usher.js

Usher.js is a JavaScript library enabling brands to manage and track referrals and conversions within JavaScript-enabled web applications or browser extensions. You may set it up to track conversions in various scenarios, such as user registration, staking cryptocurrency, or depositing funds into a crypto wallet.

Designed to connect seamlessly to any Usher node, Usher.js references the node's URL when instantiating the UsherJS object, simplifying conversion tracking across web apps and dApps.

[Learn more at Usher.js' repository →](https://github.com/usherlabs/usher.js)

## 📦 Packages Overview

| Package Name                             | Description                                                                                             |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [packages/admin](./packages/admin)       | CLI for executing administrative functions on the Usher node.                                           |
| [packages/app](./packages/app)           | Next.js app provides a user-friendly interface for managing and interacting with Usher functionalities. |
| [packages/graph](./packages/graph)       | Manages ArangoDB structure (migration files) and provides serverless utilities for scalability.         |
| [packages/listener](./packages/listener) | Monitors and processes smart-contract-based conversion events in blockchain ecosystems.                 |

## 🏁 Getting started

1. Ensure your system meets the requirements:

- Node.js (v14 or higher)
- Yarn (v1)

1. Clone the repository:

```bash
git clone https://github.com/usherlabs/usher.git
cd usher
```

2. To install dependencies, run `yarn install` in the root directory.

	 > Usher Core is a monorepo with multiple packages in the `packages` directory. Each package has its own `package.json` and scripts. Learn more about [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/).

3. For package overviews and instructions to start services, refer to the respective package documentation.


## **🚀** Usage and Deployment

Users can interact with your deployed Usher Core node in two ways:

- By using the frontend interface deployed by the same node
- By integrating directly with your servers, utilizing [User Programs](https://github.com/usherlabs/programs) to achieve
  seamless integration.

Deploying each of the packages is a straightforward process. You may find more information about each of them in their respective README files. But here we'll get an overview of the process.


### Setting up our Core Next.js application

[This guide provided at `packages/app`](./packages/app/README.md#how-to-run-it) will help you set up the Next.js application for Usher Core.

By following it, you will be able to:

- Run the Next.js application locally
- Deploy this application to Vercel

### Setting up ArangoDB

[This guide provided at `packages/graph`](./packages/graph/README.md#setting-up-an-arangodb-instance) will help you set up ArangoDB for Usher Core.

By following it, you will be able to:

- Set up an ArangoDB instance on ArangoDB Cloud or on-premise, even at your local machine
- Set up a database and a database user for Usher Core usage

### Setting up migrations with ArangoMiGO

[This guide provided at `packages/graph`](./packages/graph/README.md#using-arangomigo-to-manage-migrations) will help you set up ArangoMiGO to manage migrations on your ArangoDB instance.

By following it, you will be able to:

- Install Golang and necessary dependencies to run ArangoMiGO
- Install ArangoMiGO
- Run the migration files to create and update the database structure required by Usher Core

### Setting up the Listener Node (Optional)

[This guide provided at `packages/listener`](./packages/listener/README.md#deploy) will help you set up the Listener Node for Usher Core.

It will help you to either:

- Use the Listener Node locally
- Deploy the Listener Node using docker
- Manually deploy the Listener Node to a VPS (e.g. Ubuntu)

You may want to deploy the Listener Node if you want to track conversions on blockchain ecosystems or other smart contracts.

### During these steps you may find it helpful to:

- **[Create a Vercel account](https://vercel.com/signup)** to support the deployment of the `app` package.
- **[Set up ArangoDB Cloud or On-Premise](https://www.arangodb.com/)** to handle Usher's data. Refer to the `graph`
	package to learn more.
- **[Create a Sentry account](https://sentry.io/signup/)** to enable error tracking and monitoring for your Usher Core
	deployment. This will help you identify and resolve issues more efficiently, ensuring a smoother user experience.

But bear in mind that these are not mandatory steps. You may choose to deploy Usher Core using other preferred services as well.


## 😵‍💫 Troubleshooting

- Don’t forget to check if our [Documentation](https://docs.usher.so/) already covers you
- For questions, support, and discussions:[Join the Usher Discord →](https://go.usher.so/discord)
- For bugs and feature requests:[Create an issue on Github →](https://github.com/usherlabs/core/issues)

## 🤔 **Missing Something Important to You?**

We know that everyone has different needs, and we want Usher to be as helpful and adaptable as possible. If you think
we're missing a feature that would make a big difference for you, we're all ears!

To suggest a new feature, just head over to our **[GitHub repository](https://github.com/usherlabs/usher)** and create a
new issue. Remember to add the `suggestion` tag to your issue, so we can find and prioritize your request.

Our team is always working to enhance and grow Usher, and your input is super valuable in guiding the project's future.
By sharing your suggestions, you're helping to improve the Usher community and make the product even better for
everyone. So, if you have a cool idea, don't hesitate to let us know!

## 💚 Contributing

There are many ways you can contribute to taking Usher’s mission to empower partnerships even further.

- Open issues for bugs, typos, any kind of errors you encountered, or features you missed
- Submit pull requests for something you are able to tackle (tests are always great ways to start it out)
- Engage with our community on our [Discord server](https://go.usher.so/discord) or
  our [Twitter profile](https://twitter.com/usher_web3)
- What about writing an article and exposing it somewhere? How great would be to help people know there is Usher out
  there desiring to help them build strong communities? Spread the word!

## 🛣️ **Roadmap**

### **ComposeDB**

As part of our future roadmap, we're evaluating the possibility of migrating
to [ComposeDB](https://composedb.js.org/docs/0.4.x/graph-structure), a graph structure built for managing data on
Ceramic. This transition aims to streamline our data handling processes by utilizing a decentralized graph structure
that supports accounts and documents.

ComposeDB would enable us to manage Ceramic's Decentralized Identifiers (DIDs) and provide secure authentication for
various entities.

### Log Store

We are working on incorporating
a [decentralized time series database for event management](https://www.usher.so/network/). By transforming real-time
data streams into queryable datasets and utilizing Arweave's permanent storage, Log Store ensures data reliability and
easy access.

Log Store will empower users to customize storage preferences and stake cryptocurrency to cover storage costs. This
decentralized approach enhances event management in Web3 applications, analytics, and business intelligence. Ultimately,
our aim is to simplify data handling while unlocking its full potential in the constantly evolving Web3 landscape.

### Remittance Protocol

Usher is working on integrating a Remittance Protocol for decentralized funds management.

This protocol leverages the power of EVM smart contracts and the security of the Internet Computer platform to handle
crypto incentives deposited by Partner Program Operators and distribute rewards to users participating in marketing
campaigns.

Our ultimate goal is to create a secure, transparent, and user-friendly way for operators to deposit incentives and for
users to claim their rewards. We believe that by using EVM smart contracts and the Internet Computer's decentralized
infrastructure, we can create a trustless and automatic system that genuinely rewards Partners for their marketing
efforts.

## 🗎 License

Copyright (c) 2022 Usher Labs Pty Ltd & Ryan Soury

This program is free software: you can redistribute it and/or modify it under the terms of the MIT License as published
by the Massachusetts Institute of Technology.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the MIT License for more details.

You should have received a copy of the MIT License along with this program. If not, see [https://opensource.org/licenses/MIT](https://opensource.org/licenses/MIT).

The Usher project is a collaborative effort, and we want to extend our gratitude to all contributors who have helped
shape and improve the software.
