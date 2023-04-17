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

### ArangoMiGO

ArangoMiGO is a database migration tool specifically designed for ArangoDB. It simplifies schema management and
versioning, enabling developers to create, update, and manage database structures efficiently. ArangoMiGO helps in
organizing and executing migration scripts in a controlled manner, ensuring that all changes to the database schema are
applied in the correct order. It supports different migration strategies, such as creating, updating, or dropping
collections, indexes, and graphs, while maintaining the integrity of the data.

Learn more about ArangoMiGO in their [**repository →**](https://github.com/deusdat/arangomigo)

## Getting Started

### Prerequisites

Before you begin, be sure you have followed the installation guide at the root of this repository. If you wish to
execute any of the scripts defined on this package, remember to navigate to `packages/graph` before executing.

### Setting up an ArangoDB instance

We'll cover two different ways in which you may spin up an ArangoDB instance.

**Using Docker**

Using Docker is a convenient way to create an ArangoDB instance. In this case, you already have a **`docker-compose.yml`** file. To set up an ArangoDB instance using this file, follow these steps:

1. Ensure Docker is installed on the machine you intend to set the database. Using your local machine you may follow the **[official installation guide](https://docs.docker.com/get-docker/)**.
2. `ARANGO_ROOT_PASSWORD` is the only required environment variable for this step, containing the password for the `root` user to be created. You may get an overview of it at [environment variables overview section](#environment-variables-overview).
3. Run **`docker-compose up`** in your project directory. This command will download the ArangoDB image (if not already downloaded) and start the ArangoDB instance with the specified configuration.
4. Access the ArangoDB Web UI by navigating to **`http://localhost:8529`**. Log in using the **`root`** username and the password you set in the **`.env`** file.

With these steps, you will have an ArangoDB instance up and running.

**Using a cloud ArangoDB instance**

1. Sign up for an account on the [ArangoGraph Insights Platform](https://www.arangodb.com/docs/stable/arangograph/), a fully managed ArangoDB service.
2. Follow the platform's documentation to set up a managed ArangoDB instance. Make sure to note down the connection details, such as the instance URL, port number, database name, username, and password.
3. Update your Usher Core configuration to use the cloud ArangoDB instance by setting the appropriate environment variables, such as `ARANGO_URL` and `ARANGO_PORT`.

By following these steps, you will have a cloud ArangoDB instance connected to your Usher Core implementation through the ArangoGraph Insights Platform.

### Using ArangoMiGO to manage migrations

**Setting up ArangoMiGO**

To set up ArangoMiGO, you'll need to install Golang and build the binary. Follow these steps:

1. Install Golang by following the [official installation guide](https://golang.org/doc/install).
2. Navigate to the directory you wish to clone and build arangomigo.
2. Clone the ArangoMiGO repository by running the following command:

```
git clone https://github.com/deusdat/arangomigo.git
```

Navigate to the cloned repository directory and install the ArangoMiGO binary:

```
cd arangomigo
go install
```

This command will build an arangomigo executable and then make it available to your environment.

**Running migrations**

Once you've set up ArangoMiGO, you can use it to manage database migrations. Follow these steps:

1. Copy the **`.arangomigo.example.yml`** file to **`.arangomigo.yml`** and fill in the values related to the ArangoDB instance you want to use.
2. Run migrations using the following command:

```
yarn run migrate
```

This command will execute the migration scripts located in the **`migrations`** folder, setting up the Usher database structure in the specified ArangoDB instance.


ArangoMiGO keeps track of executed migrations in a dedicated collection. When running migrations, it applies only new or unexecuted ones in order, ensuring consistency and smooth operation as you update your Usher Core implementation.

[Learn more about ArangoMiGO migrations →](https://github.com/deusdat/arangomigo)

### Creating a dedicated database user
After executing migrations for the first time, an `usher` database will be created using the root user. However, for security reasons, it is recommended to create a dedicated user for the Usher Core service to interact with the ArangoDB instance. To create a new user using the ArangoDB Web UI, follow these steps, as [described on this page](https://www.arangodb.com/docs/stable/programs-web-interface-users.html):

1. Access the ArangoDB Web UI by navigating to **`http://localhost:8529`** for a local instance, or use the appropriate URL for a cloud instance. Log in using the **`root`** username and the password you set in the **`.env`** file or provided by your cloud provider.
2. Once logged in, click on the "_System" database in the top-right corner.
3. Navigate to the "USERS" tab and click on the "Add User" button.
4. Fill in the new user's details. Choose a username and password for the new user, and make sure to enable the "Active" checkbox.
5. Click on the "Create" button to create the new user.
6. To grant administrative permissions to the new user for the **`usher`** database, click on the user's name in the "USERS" tab, then scroll down to the "Database Access" section. Find the **`usher`** database in the list and set the "Access Level" dropdown to "Admin". Click "Save" to apply the changes.
7. Update your Usher Core configuration to use the new user by setting the **`ARANGO_USERNAME`** and **`ARANGO_PASSWORD`** environment variables to the new user's credentials.

Now, your Usher Core implementation will use the dedicated user to interact with the ArangoDB instance, providing better security.

## Environment variables overview

| Environment Variable   | Description                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
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

For local development, there's a convenient `.env.example` file at the root of this package. Copy it to `.env` and fill in the values as needed.


## How to read it?

The Graph package is structured as follows:

- `aql`: Contains AQL scripts for database operations, such as `create-campaign.aql`.
- `migrations`: Includes migration scripts that alter the ArangoDB structure, like creating collections and graphs.
- `src`: Contains the main source code, including constants, environment configuration, lambda handlers, and utility
	functions.
- `tests`: Holds test files.

## 🚧 Serverless utilities (Work in progress)

> Serverless utilities are not ready to be used yet. You may expect changes and/or unfinished functionalities here.

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
