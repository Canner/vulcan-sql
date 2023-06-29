# Use bullseye for glibc > 2.29
FROM node:16-bullseye AS build

# create app directory
WORKDIR /usr/app

# install dependencies
COPY /dist/packages/catalog-server/ .
RUN npm install --omit=dev

FROM node:16-bullseye-slim
WORKDIR /usr/app
COPY --from=build /usr/app /usr/app
ENV NODE_ENV production

CMD [ "./node_modules/.bin/next", "start", "-p", "4200" ]