FROM node:16 AS build

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .
COPY packages/listener/package.json ./packages/listener/
RUN pnpm install

COPY . .

WORKDIR /app/packages/listener
RUN pnpm install
RUN pnpm build

FROM node:16-alpine
ENV NODE_ENV=production

COPY --from=build /app/packages/listener/build /app

CMD [ "node", "/app/main.js" ]
