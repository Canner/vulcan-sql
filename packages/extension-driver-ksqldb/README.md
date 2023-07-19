# extension-driver-ksqldb

This is the KSqlDb driver for VulcanSQL, provided by [Canner](https://cannerdata.com/).

## Installation

1. Install the package:

   ```bash
   npm i @vulcan-sql/extension-driver-ksqldb
   ```

2. Update your `vulcan.yaml` file to enable the extension:

   ```yaml
   extensions:
     ksqldb: '@vulcan-sql/extension-driver-ksqldb'
   ```

3. Create a new profile in your `profiles.yaml` file or in the designated profile paths. For more information, please refer to the [KsqlDb documentation](https://ksqldb.io/) for the available arguments.

   ```yaml
   - name: ksql # Profile name
     type: ksqldb
     connection:
       # Optional: KSqlDb instance URL. Default is http://localhost:8088.
       host: 'www.example.com:8088'
   ```

## Testing

To run tests for the `extension-driver-ksqldb` module, use the following command:

```bash
nx test extension-driver-ksqldb
```
