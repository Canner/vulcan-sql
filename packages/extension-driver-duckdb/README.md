# extension-driver-duckdb

[Duckdb](https://duckdb.org/) driver for Vulcan SQL

## Install

1. Install package

   ```sql
   npm i @vulcan-sql/extension-driver-duckdb
   ```

2. Update `vulcan.yaml`, enable the extension.

   ```yaml
   extensions:
     duckdb: '@vulcan-sql/extension-driver-duckdb'
   ```

3. Create a new profile in `profiles.yaml` or in your profiles' paths.

   ```yaml
   - name: duck # profile name
     type: duckdb
     connection:
       # Optional: Path to your persistent DB, if this value is not set, we use in-memory database. (default: ":memory:")
       persistent-path: 'path-to-a-folder'
       # Optional: Whether log query requests (default: false)
       log-queries: false
       # Optional: Whether log query requests' parameters, please be aware that query parameters might contain sensitive data (default: false)
       log-parameters: false
       # Optional: Contains the configuration parameters DuckDB need (ex: for duckdb extension "httpfs", it will needs region, accessKeyId, ...)
       # You can read more in the [duckdb extension page](https://duckdb.org/docs/extensions/overview) 
       configuration-parameters: 
         region?: string
         accessKeyId?: string
         secretAccessKey?: string
         # alternative option for accessKeyId and secretAccessKey
         sessionToken?: string
         endpoint?: string
         url_style?: string
         use_ssl?: boolean
   ```

 4. Environment Variables
    - DUCKDB_EXECUTE_CHUNK_SIZE: Optional, dafult 2000. The data chunk size, we will acquire this size of data using conn.all() at once and get the rest of data using conn.stream to prevent from OOM, this parameter will affect the **API performance** and **server memory usage**.
    - DUCKDB_THREADS: Optional, if not been set, use used duckdb default thread value.