FROM node:16-alpine
# Annotation required by Github to link with our repository
LABEL org.opencontainers.image.source https://github.com/canner/vulcan-sql

# We'll execute docker build from project root. Using absolute path to avoid "forbidden path outside the build contex" error
COPY /dist/packages/cli/ /usr/cli
WORKDIR /usr/cli
ENV NODE_ENV=production
RUN npm i
RUN npm i -g .

WORKDIR /usr/app
ENTRYPOINT ["vulcan"]
