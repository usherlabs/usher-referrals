# App

## Introduction

Spin up the Usher Next.js app to deliver a user-friendly interface for your Partner Network participants.

## How to run it?

### Locally

1. Make sure you have followed the install instructions provided at the root of this repository.
2. Navigate to this directory in your terminal.
3. Read the `.env.example` to learn which services to incorporate.
4. Copy the `.env.example` to a `.env` file within the `packages/app`
5. Execute `pnpm dev` to start the development server.

The app should now be accessible at `http://localhost:3000`.

For more information on how to get started with Next.js, please refer to the **[official Next.js documentation](https://nextjs.org/docs/getting-started)**.

### Deploy

You may use any method you prefer to deploy the app. We will guide you through deploying with Vercel. Any other deployment method compatible with NextJS structure may be utilized. Please file an issue on this repository if you would like to see a different kind of deployment method that creates friction for you.

#### Deploy on Vercel

1. If you haven't already, sign up for a **[Vercel account](https://vercel.com/signup)**.
2. Go to the **[Vercel dashboard](https://vercel.com/dashboard)**.
3. Click on the "Import Project" button.
4. Choose "Import Git Repository" and provide the URL of your Usher Core Git repository.
5. Configure your Project Settings
   1. **Build & Development Settings** should include a **Build Command**: `cd ../.. && turbo run build --filter=...@usher/app`
   2. **Root Directory** is `packages/app`.
   3. Enable "Include source files outside of the Root Directory in the Build Step."
6. It is required for you to set in the "Environment Variables" section during the import process or later in the project settings.
7. Click "Deploy" to start the deployment process.

Vercel will automatically build and deploy your app. Once the deployment is complete, you'll receive a unique URL where your app is accessible.

To set up continuous deployment with Vercel and GitHub, follow the **[official Vercel documentation](https://vercel.com/docs/git)**. This will automatically deploy your app whenever you push changes to your GitHub repository.

For more advanced deployment configurations, consult the **[Vercel documentation](https://vercel.com/docs/configuration)**.

## How does this work?

The app is built using Next.js, offering an engaging and user-friendly interface for managing and interacting with Usher functionalities. It communicates with the Usher Core backend, blockchain, and external APIs using Next.js serverless functions located in the `pages/api` directory.

These serverless functions handle API requests and allow us to manage data and perform server-side processing tasks with ease. The app offers a variety of features, including wallet management, user profiles, partnerships, referrals, campaigns, captcha validation, collections, verification processes, bot detection, marketing, and conversions.

To maintain a clean and organized API structure, we've incorporated `next-connect` as middleware for Next.js API routes, similar to `Express.js`.

## How to read it?

We recommend you get comfortable with [NextJS](https://nextjs.org/docs/getting-started) before diving in.

### `src` File structure

- `assets`: Stores all static assets used within the Partner dApp that are not related to a database entry.
- `brand`: All brand-related components are centralized in this directory to ease the customization of the application UI. We can change the most relevant aspects of branding by tweaking `brand.config.tsx`.
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

## Re-branding

To incorporate our pages into your application, we’ve facilitated the process of re-branding. You can find all critical components related to branding UI at `src/brand`, so you can quickly adapt to your organization's needs.

Besides updating `src/brand/brand.config.tsx`, you will need to generate your favicons for your application by using our tool:

- Update `app/tools/favicons/favicons-config.ts` accordingly. [Learn more →](https://github.com/itgalaxy/favicons)
- Update `app/tools/source-icon.svg` to the desired icon.
- run `pnpm generate-favicon`. It’ll also automatically run at the build step.

## What’s next?

[View other packages →](../)

[Go to Usher main documentation →](https://docs.usher.so/)

[Go to NextJS documentation →](https://nextjs.org/docs/getting-started)
