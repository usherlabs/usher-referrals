FROM node:16 AS build

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY packages/listener/package.json ./packages/listener/
RUN yarn install

COPY . .

WORKDIR /app/packages/listener
RUN yarn install
RUN yarn build

FROM node:16-alpine
ENV NODE_ENV=production

COPY --from=build /app/packages/listener/build /app

CMD [ "node", "/app/main.js" ]
