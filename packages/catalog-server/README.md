# catalog-server

This package serves as a catalog page for VulcanSQL.

## Install

1. Install package

    ```bash
    npm i @vulcan-sql/catalog-server
    ```

2. Use [@vulcan-sql/cli](https://www.npmjs.com/package/@vulcan-sql/cli) to start the catalog server.
<br/>(The VulcanSQL server needs to listen first.)

    ```bash
    vulcan catalog
    ```

3. Open in browser. By default, it is http://localhost:4200.


## Running a Production

1. Use [@vulcan-sql/cli](https://www.npmjs.com/package/@vulcan-sql/cli) to generate the catalog server assets.

    Node.js:
    ```bash
      vulcan package -o node -t catalog-server
    ```
    Copy the files in the `./dist` folder to your production servers. Then run `npm install` && `node index.js` to start the server.

    Docker:
    ```bash
      vulcan package -o docker -t catalog-server
      docker build -t <tag> ./dist
    ```


## Configurations (optional)

These are some configurations related with catalog in `vulcan.yaml`.
- The listen `port` can be change or just directly use `vulcan catalog -p 4200`.
- The production packager `folderPath` also can be change if needed.

```yaml
# change the listen port
catalog:
  port: 4200

# change the production packager folder path
node-packager:
  catalog-server:
    folderPath: dist
docker-packager:
  catalog-server:
    folderPath: dist

```

