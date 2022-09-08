# Playground 1 - Basic VulcanSQL project with MoMA dataset

This project contains these resources for testing your development:

- Latest VulcanSQL packages that are built from local files.
- Basic VulcanSQL configuration.
- In-memory data warehouse - [DuckDB](https://duckdb.org/) and its driver.
- Testing data: [The Museum of Modern Art (MoMA)](https://github.com/MuseumofModernArt/collection).

## Install

```bash
cd ./lab/playground1
make
```

- This command installs VulcanSQL CLI too, you can use `vulcan start` instead of `make` if the source codes aren’t changed.

## Testing Data

After installation, you can find `artists.csv` and `artworks.csv` under folder `test-data`. They are the data we used for this playground. You can also access the data base via [DuckDB CLI](https://duckdb.org/docs/api/cli): `duckdb ./test-data/moma.db`
