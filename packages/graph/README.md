# Graph

## Introduction

This package is designed to manage the ArangoDB structure (migration files) and offer serverless utilities for an efficient and scalable blockchain ecosystem.

## About technologies used

### Ceramic

Ceramic is a decentralized data network that functions like a decentralized MongoDB. It allows users to create and manage their JSON documents, which can only be modified by the user and are publicly readable. The documents can adhere to the schemas that we produce. Ceramic is used to enable wallets to create partnerships both via our UI and programmatically.

Learn more about Ceramic in their [official documentation →](https://developers.ceramic.network/learn/welcome/)

### ArangoDB

ArangoDB is a multi-model centralized database that offers NoSQL document storage, a graphing system to streamline the relationship between documents, and a rich JavaScript-like query language (AQL) to navigate data. ArangoDB is used to provide unique identification for each user while enabling them to create multiple associated DIDs using their wallets. A NoSQL GraphDB simplifies the indexing of public data for internal research purposes, enabling us to uncover insights through intricate relationships.

Learn more about ArangoDB and its query language, AQL, in their official documentation:

- ArangoDB: **[http://arangodb.com/](http://arangodb.com/)**
- AQL Documentation: **[https://www.arangodb.com/docs/stable/aql/index.html](https://www.arangodb.com/docs/stable/aql/index.html)**

### **ArangoMiGO**

ArangoMiGO is a database migration tool specifically designed for ArangoDB. It simplifies schema management and versioning, enabling developers to create, update, and manage database structures efficiently. ArangoMiGO helps in organizing and executing migration scripts in a controlled manner, ensuring that all changes to the database schema are applied in the correct order. It supports different migration strategies, such as creating, updating, or dropping collections, indexes, and graphs, while maintaining the integrity of the data.

Learn more about ArangoMiGO in their **[official documentation →](https://github.com/deusdat/arangomigo)**

### **Serverless Framework**

The Serverless Framework is an open-source tool for deploying and managing serverless applications on various cloud providers, such as AWS, Azure, and Google Cloud Platform. It allows developers to define resources, functions, and events in a `serverless.yml` configuration file. In this package, the framework is used to deploy AWS Lambda functions for utilities, leveraging AWS Lambda's event-driven architecture, automatic scaling, and fault tolerance.

Learn more about the Serverless Framework in their [official documentation →](https://www.serverless.com/framework/docs/getting-started)

## ****Getting Started****

### **Prerequisites**

Before you begin, be sure you have followed the installation guide at the root of this repository. If you wish to execute any of the scripts defined on this package, remember to navigate to `packages/graph` before executing.

### Environment setup

Properly configure the Graph package by setting up the following environment variables:

| Environment Variable    | Description |
|-------------------------| --- |
| `ARANGO_ROOT_PASSWORD`  | The super-secret and long password for the ArangoDB root user. Change this before going into production. |
| `ARANGO_PORT`           | The port on which ArangoDB is running, default is 8529. |
| `S3_REGION`             | The AWS region where the S3 bucket for backups is located. |
| `S3_BUCKET`             | The name of the S3 bucket where database backups will be stored. |
| `S3_ROOT`               | The root path within the S3 bucket where database backups will be stored. |
| `CERAMIC_URL`           | The URL of the Ceramic instance that the service connects to. |
| `ARANGO_URL`            | The URL of the ArangoDB instance that the service connects to. |
| `ARANGO_DATABASE`       | The name of the ArangoDB database used by the service. |
| `ARANGO_USERNAME`       | The username is used to connect to the ArangoDB instance. |
| `ARANGO_PASSWORD`       | The password used to connect to the ArangoDB instance. |
| `SENTRY_DSN`            | The Data Source Name (DSN) for Sentry, is used for error tracking and monitoring. |

### **Running Migrations**

The migration files located in the `migrations` folder set up the Usher database (ArangoDB) structure using ArangoMiGO. They create collections for storing data and graphs for representing relationships between different data points. Collections include entities like DIDs, campaigns, partnerships, and wallets, while graphs define relationships such as interactions and verified connections.

To perform migrations, run the following command:

```bash
yarn run migrate
```

[Learn more about ArangoMiGO migrations →](https://github.com/deusdat/arangomigo)

ArangoMiGO tracks executed migrations in a dedicated collection. When running migrations, it applies only new or unexecuted ones in order, ensuring consistency and smooth operation as you update your Usher Core implementation.

### Configuring Utilities

Serverless utilities were designed to run on AWS infrastructures as per described on the `serverless.yml` file at the root of the package.

## How to read it?

The Graph package is structured as follows:

- `aql`: Contains AQL scripts for database operations, such as `create-campaign.aql`.
- `migrations`: Includes migration scripts that alter the ArangoDB structure, like creating collections and graphs.
- `src`: Contains the main source code, including constants, environment configuration, lambda handlers, and utility functions.
- `tests`: Holds test files.

## Unit Testing

The package, including unit tests, avoid importing `@glaze` or `ceramic`-related packages as they're built with `{ "module": "esnext" }`, and this causes a great deal of pain to execute in a Node environment.

## What’s next?

[View other packages →](../)

[Go to Usher main documentation →](https://docs.usher.so/)
