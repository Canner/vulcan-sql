# Use bullseye for glibc > 2.29
FROM node:16-bullseye AS build

# create app directory
WORKDIR /usr/app

# install dependencies
COPY package.json .
RUN npm install --omit=dev

FROM node:16-bullseye-slim
WORKDIR /usr/app
COPY --from=build /usr/app /usr/app
COPY config.json .
COPY index.js .
COPY result.json .
ENV NODE_ENV production

CMD [ "node", "index.js" ]