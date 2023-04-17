# Graph

## Introduction

This package is designed to manage the ArangoDB structure (migration files) and offer serverless utilities for an
efficient and scalable blockchain ecosystem.

## About technologies used

### ArangoDB

ArangoDB is a multi-model centralized database that offers NoSQL document storage, a graphing system to streamline the
relationship between documents, and a rich JavaScript-like query language (AQL) to navigate data. ArangoDB is used to
provide unique identification for each user while enabling them to create multiple associated DIDs using their wallets.
A NoSQL GraphDB simplifies the indexing of public data for internal research purposes, enabling us to uncover insights
through intricate relationships.

Learn more about ArangoDB and its query language, AQL, in their official documentation:

- ArangoDB: [**http://arangodb.com/**](http://arangodb.com/)
- AQL Documentation: [**https://www.arangodb.com/docs/stable/aql/index.html**](https://www.arangodb.com/docs/stable/aql/index.html)

### **ArangoMiGO**

ArangoMiGO is a database migration tool specifically designed for ArangoDB. It simplifies schema management and
versioning, enabling developers to create, update, and manage database structures efficiently. ArangoMiGO helps in
organizing and executing migration scripts in a controlled manner, ensuring that all changes to the database schema are
applied in the correct order. It supports different migration strategies, such as creating, updating, or dropping
collections, indexes, and graphs, while maintaining the integrity of the data.

Learn more about ArangoMiGO in their [**official documentation →**](https://github.com/deusdat/arangomigo)

## **Getting Started**

### **Prerequisites**

Before you begin, be sure you have followed the installation guide at the root of this repository. If you wish to
execute any of the scripts defined on this package, remember to navigate to `packages/graph` before executing.

### Environment setup

Properly configure the Graph package by setting up the following environment variables:

| Environment Variable   | Description                                                                                              |
|------------------------|----------------------------------------------------------------------------------------------------------|
| `ARANGO_ROOT_PASSWORD` | The super-secret and long password for the ArangoDB root user. Change this before going into production. |
| `ARANGO_PORT`          | The port on which ArangoDB is running, default is 8529.                                                  |
| `S3_REGION`            | The AWS region where the S3 bucket for backups is located.                                               |
| `S3_BUCKET`            | The name of the S3 bucket where database backups will be stored.                                         |
| `S3_ROOT`              | The root path within the S3 bucket where database backups will be stored.                                |
| `CERAMIC_URL`          | The URL of the Ceramic instance that the service connects to.                                            |
| `ARANGO_URL`           | The URL of the ArangoDB instance that the service connects to.                                           |
| `ARANGO_DATABASE`      | The name of the ArangoDB database used by the service.                                                   |
| `ARANGO_USERNAME`      | The username is used to connect to the ArangoDB instance.                                                |
| `ARANGO_PASSWORD`      | The password used to connect to the ArangoDB instance.                                                   |
| `SENTRY_DSN`           | The Data Source Name (DSN) for Sentry, is used for error tracking and monitoring.                        |

### **Running Migrations**

The migration files located in the `migrations` folder set up the Usher database (ArangoDB) structure using ArangoMiGO.
They create collections for storing data and graphs for representing relationships between different data points.
Collections include entities like DIDs, campaigns, partnerships, and wallets, while graphs define relationships such as
interactions and verified connections.

To perform migrations, run the following command:

```bash
yarn run migrate
```

[Learn more about ArangoMiGO migrations →](https://github.com/deusdat/arangomigo)

ArangoMiGO tracks executed migrations in a dedicated collection. When running migrations, it applies only new or
unexecuted ones in order, ensuring consistency and smooth operation as you update your Usher Core implementation.

### Configuring Utilities

Serverless utilities were designed to run on AWS infrastructures as per described on the `serverless.yml` file at the
root of the package.

## How to read it?

The Graph package is structured as follows:

- `aql`: Contains AQL scripts for database operations, such as `create-campaign.aql`.
- `migrations`: Includes migration scripts that alter the ArangoDB structure, like creating collections and graphs.
- `src`: Contains the main source code, including constants, environment configuration, lambda handlers, and utility
	functions.
- `tests`: Holds test files.

## 🚧 Serverless utilities (Work in progress)

> Serverless utilities are not ready to be used yet. You may expect changes and/or unfinished functionalities here.
>

Serverless utilities were designed to run on AWS infrastructures as per described on the `serverless.yml` file at the
root of the package.

Proper indexing and backing up of data is crucial for maintaining a secure, efficient, and reliable system. Regular
indexing ensures up-to-date and accessible data, while backups protect against data loss and enable swift recovery in
case of failure.

### Setting up Recurring Database Indexing

To configure recurring database indexing, follow these steps:

1. Open the `serverless.yml` file located at the root of the `graph` package.
2. Locate the `ingest` function under the `functions` section.
3. Configure the desired interval for indexing by modifying the `schedule` attribute, e.g., `rate(5 minutes)` for
	 indexing every 5 minutes.

### Configuring AWS for Database Backups

To set up AWS for database backups, follow these steps:

1. Open the `serverless.yml` file located at the root of the `graph` package.
2. Locate the `backup` function under the `functions` section.
3. Configure the desired interval for backups by modifying the `schedule` attribute, eg., rate(1 day) for daily
		 backups.

### Deploying utilities

Before deploying the serverless utilities, ensure that you have properly configured the environment variables. To deploy
the utilities:

1. Open the terminal and navigate to the `graph` package directory.
2. Use the `serverless` command to deploy the utilities: Replace `<stage>` with the desired stage, e.g., `prod`
	 or `dev`.

```bash
serverless deploy --stage <stage>
```

Learn more about the Serverless Framework deployment options
in [their official documentation →](https://www.serverless.com/framework/docs/providers/aws/guide/deploying)

## What’s next?

[View other packages →](../)

[Go to Usher main documentation →](https://docs.usher.so/)
