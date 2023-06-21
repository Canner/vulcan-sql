# Use bullseye for glibc > 2.29
FROM node:16-bullseye AS build

# create app directory
WORKDIR /usr/app

# install dependencies
COPY package.json .
COPY index.js .
COPY pkg.config.json .

RUN npm install -g pkg
RUN npm install --omit=dev
COPY node_modules/@vulcan-sql/serve/src ./node_modules/@vulcan-sql/serve/src
COPY node_modules/@vulcan-sql/cli/src ./node_modules/@vulcan-sql/cli/src
COPY node_modules/@vulcan-sql/build/src ./node_modules/@vulcan-sql/build/src
COPY node_modules/@vulcan-sql/core/src ./node_modules/@vulcan-sql/core/src
COPY node_modules/@vulcan-sql/extension-dbt/src ./node_modules/@vulcan-sql/extension-dbt/src
COPY node_modules/@vulcan-sql/extension-driver-bq/src ./node_modules/@vulcan-sql/extension-driver-bq/src
COPY node_modules/@vulcan-sql/extension-driver-duckdb/src ./node_modules/@vulcan-sql/extension-driver-duckdb/src
COPY node_modules/@vulcan-sql/extension-driver-pg/src ./node_modules/@vulcan-sql/extension-driver-pg/src
COPY node_modules/@vulcan-sql/extension-driver-snowflake/src ./node_modules/@vulcan-sql/extension-driver-snowflake/src
RUN pkg ./index.js --config ./pkg.config.json

FROM debian:bullseye-slim

WORKDIR /usr/app

RUN apt update -y

# RUN wget https://cannerflow-temp-test-2-81vs8q.s3.ap-northeast-1.amazonaws.com/index-linux
# COPY index-linux .
COPY --from=build /usr/app/dist-bin/index-linux /usr/app/vulcan
RUN chmod +x vulcan

ENV NODE_ENV production

CMD [ "/usr/app/vulcan", "version" ]
