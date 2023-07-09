
.PHONY: install build start pkg-core pkg-build pkg-serve pkg-cli clean pkg-extension-driver-duckdb

# start vulcan server (default goal)
start: build test-data/moma.db ../../node_modules
	@vulcan start

# build the required packages
build: pkg-core pkg-build pkg-serve pkg-catalog-server pkg-cli pkg-extension-driver-duckdb pkg-extension-authenticator-canner pkg-extension-driver-clickhouse


# build for core pakge
pkg-core: ../../node_modules
	@cd ../..; \
	yarn nx build core; \
	mkdir -p ./labs/playground1/node_modules/@vulcan-sql; \
	rm -rf ./labs/playground1/node_modules/@vulcan-sql/core; \
	cp -R ./dist/packages/core ./labs/playground1/node_modules/@vulcan-sql

# build for build pakge
pkg-build: ../../node_modules
	@cd ../..; \
	yarn nx build build; \
	mkdir -p ./labs/playground1/node_modules/@vulcan-sql; \
	rm -rf ./labs/playground1/node_modules/@vulcan-sql/build; \
	cp -R ./dist/packages/build ./labs/playground1/node_modules/@vulcan-sql

# build for serve pakge
pkg-serve: ../../node_modules
	@cd ../..; \
	yarn nx build serve; \
	mkdir -p ./labs/playground1/node_modules/@vulcan-sql; \
	rm -rf ./labs/playground1/node_modules/@vulcan-sql/serve; \
	cp -R ./dist/packages/serve ./labs/playground1/node_modules/@vulcan-sql

# build for catalog-server pakge
pkg-catalog-server: ../../node_modules
	@cd ../..; \
	yarn nx build catalog-server; \
	mkdir -p ./labs/playground1/node_modules/@vulcan-sql; \
	rm -rf ./labs/playground1/node_modules/@vulcan-sql/catalog-server; \
	cp -R ./dist/packages/catalog-server ./labs/playground1/node_modules/@vulcan-sql

# build for extension-driver-duckdb pakge
pkg-extension-driver-duckdb: ../../node_modules
	@cd ../..; \
	yarn nx build extension-driver-duckdb; \
	mkdir -p ./labs/playground1/node_modules/@vulcan-sql; \
	rm -rf ./labs/playground1/node_modules/@vulcan-sql/extension-driver-duckdb; \
	cp -R ./dist/packages/extension-driver-duckdb ./labs/playground1/node_modules/@vulcan-sql

pkg-extension-authenticator-canner: ../../node_modules
	@cd ../..; \
	yarn nx build extension-authenticator-canner; \
	mkdir -p ./labs/playground1/node_modules/@vulcan-sql; \
	rm -rf ./labs/playground1/node_modules/@vulcan-sql/extension-authenticator-canner; \
	cp -R ./dist/packages/extension-authenticator-canner ./labs/playground1/node_modules/@vulcan-sql

pkg-extension-driver-clickhouse: ../../node_modules
	@cd ../..; \
	yarn nx build extension-driver-clickhouse; \
	mkdir -p ./labs/playground1/node_modules/@vulcan-sql; \
	rm -rf ./labs/playground1/node_modules/@vulcan-sql/extension-driver-clickhouse; \
	cp -R ./dist/packages/extension-driver-clickhouse ./labs/playground1/node_modules/@vulcan-sql; \
	cp -R ./packages/extension-driver-clickhouse/node_modules/@clickhouse ./labs/playground1/node_modules


# build and install for cli pakge
pkg-cli: ../../node_modules
	@cd ../..; \
	yarn nx install cli;

test-data/artists.csv:
	@echo "downloading artists.csv ..."; \
	curl -s -o "test-data/artists.csv" "https://media.githubusercontent.com/media/MuseumofModernArt/collection/master/Artists.csv"

test-data/artworks.csv:
	@echo "downloading artworks.csv ..."; \
	curl -s -o "test-data/artworks.csv" "https://media.githubusercontent.com/media/MuseumofModernArt/collection/master/Artworks.csv"

test-data/moma.db: test-data/artists.csv test-data/artworks.csv
	@cd test-data; \
	node getdata.js

# install node modules for parent folder
../../node_modules: ../../package.json
	@cd ../..; \
	yarn

clean:
	@rm -rf node_modules; \
	rm -rf test-data/*.csv; \
	rm -rf test-data/moma.db