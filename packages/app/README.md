# App

## Introduction

This package contains the code to spin up a Next.js app that runs on Usher, providing a user-friendly interface for managing and interacting with Usher functionalities. The app not only serves as a front-end solution for the Usher Core but also spins up endpoints to communicate with this Usher node.

## How to run it?

### Locally

1. Make sure you have followed the install instructions provided at the root of this repository.
2. Navigate to this directory in your terminal.
3. Execute `yarn dev` to start the development server.

The app should now be accessible at `http://localhost:3000`.

### Deploy

You can deploy the app using any Next.js deployment method. We recommend using Vercel for a seamless experience. To learn more, visit **[Vercel's deployment documentation](https://nextjs.org/learn/basics/deploying-nextjs-app/deploy).**

## How does this work?

The app is built using Next.js, offering an engaging and user-friendly interface for managing and interacting with Usher functionalities. It communicates with the Usher Core backend, blockchain, and external APIs using Next.js serverless functions located in the `pages/api` directory.

These serverless functions handle API requests and allow us to manage data and perform server-side processing tasks with ease. The app offers a variety of features, including wallet management, user profiles, partnerships, referrals, campaigns, captcha validation, collections, verification processes, bot detection, marketing, and conversions.

To maintain a clean and organized API structure, we've incorporated `next-connect` as middleware for Next.js API routes, similar to `Express.js`.

## How to read it?

We recommend you get comfortable with [NextJS](https://nextjs.org/docs/getting-started) before diving in.

### `src` File structure

- `assets`: Stores all static assets used within the Partner dApp that are not related to a database entry.
- `components`: Contains React.js components that primarily render JSX markup. Some components include logic to reduce repeated code.
- `containers`: Houses React.js components that serve as the foundation for a UI and/or wrap other components.
- `hooks`: Contains React.js hooks for reusable functional component state/variable management.
- `modules`:
	- `auth`: An authentication module for DID creation based on wallet connection and multi-wallet functionality management.
- `pages`: Required folder for Next.js, serving as the entry point to the Next.js file/page routing mechanism. [Learn more →](https://nextjs.org/docs/basic-features/pages)
	- `api`: API endpoints leveraging the Next.js file/page routing system. Endpoint handlers in these files use the next-connect NPM package to deliver an API management experience similar to express.js. [Learn more →](https://github.com/hoangvvo/next-connect)
- `providers`: Contains React.js Context Providers that manage global states.
- `seed`: Holds seed data to be used in place of actual API requests for streamlined local development.
- `server`: Contains configuration and handlers relevant only to server-side logic, such as middleware for API endpoints.
- `styles`: Includes basic SCSS files for styling components that cannot be reached via the standard Component UI Library.
- `utils`: Stores small reusable utility functions.
- `admin.ts`: Loaded only in development. Exposes functions that can be called from the Browser Console to simplify Client → Data Network interactions.
- `api.ts`: Contains a boilerplate for creating API requests to the backend, including type management for parameters and responses.
- `constants.ts`: Hosts all constant variables.
- `env-config.ts`: Contains all NEXT_PUBLIC environment variables exposed to the front end.
- `integrations.ts`: A single file for integrations with third-party tracking libraries or event management libraries.
- `types.ts`: Houses all TypeScript Types.

## What’s next?

[View other packages →](../)

[Go to Usher main documentation →](https://docs.usher.so/)

[Go to NextJS documentation →](https://nextjs.org/docs/getting-started)
