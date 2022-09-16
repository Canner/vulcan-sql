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
   ```
