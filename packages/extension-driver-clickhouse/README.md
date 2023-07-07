# extension-driver-clickhouse

This is the ClickHouse driver for VulcanSQL, provided by [Canner](https://canner.io/).

## Installation

1. Install the package:

   ```bash
   npm i @vulcan-sql/extension-driver-clickhouse
   ```

2. Update your `vulcan.yaml` file to enable the extension:

   ```yaml
   extensions:
     clickhouse: '@vulcan-sql/extension-driver-clickhouse'
   ```

3. Create a new profile in your `profiles.yaml` file or in the designated profile paths. For more information, please refer to the [ClickHouse Client documentation](https://clickhouse.com/docs/en/integrations/language-clients/nodejs) for the available arguments.

   ```yaml
   - name: ch # Profile name
     type: clickhouse
     connection:
       # Optional: ClickHouse instance URL. Default is http://localhost:8123.
       host: 'www.example.com:8123'
       # Optional: Request timeout in milliseconds. Default value: 30000
       request_timeout: 60000
       # Optional: Maximum number of sockets to allow per host. Default value: Infinity.
       max_open_connections: 10
       # Optional: Compression settings for data transfer. Currently, only GZIP compression using zlib is supported. See https://clickhouse.com/docs/en/integrations/language-clients/nodejs#compression for details.
       compression:
         # Optional: "response: true" instructs ClickHouse server to respond with a compressed response body. Default: true
         response: true
         # Optional: "request: true" enables compression on the client request body. Default value: false
         request: false
       # Optional: The name of the user on whose behalf requests are made. Default value for username: 'default'
       username: 'user'
       # The user's password. Default: ''.
       password: 'pass'
       # Optional: The name of the application using the Node.js client. Default value: VulcanSQL
       application: 'VulcanSQL'
       # Optional: Database name to use. Default value: 'default'
       database: 'hello-clickhouse'
       # Optional: ClickHouse settings to apply to all requests. The following is a sample configuration.
       # For all available settings, see https://clickhouse.com/docs/en/operations/settings.
       # For the definition, see https://github.com/ClickHouse/clickhouse-js/blob/0.1.1/src/settings.ts
       clickhouse_settings:
         # Optional: Allow Nullable types as primary keys. Default: false
         allow_nullable_key: true
       # Optional: Configure TLS certificates. See https://clickhouse.com/docs/en/integrations/language-clients/nodejs#tls-certificates
       tls:
         # Optional: The path to the CA Cert file
         ca_cert: 'ca-cert-file-path'
         # Optional: The path to the Cert file
         cert: 'cert-file-path'
         # Optional: The path to the key file
         key: 'key-path'
       # Optional: ClickHouse Session ID to send with every request
       session_id: ''
       # Optional: HTTP Keep-Alive related settings. See https://clickhouse.com/docs/en/integrations/language-clients/nodejs#keep-alive
       keep_alive:
         # Optional: Enable or disable HTTP Keep-Alive mechanism. Default: true
         enabled: true
         # Optional: How long to keep a particular open socket alive on the client side (in milliseconds).
         # Should be less than the server setting (see `keep_alive_timeout` in the server's `config.xml`).
         # Currently, has no effect if unset or false. Default value: 2500 (based on the default ClickHouse server setting, which is 3000)
         socket_ttl: 2500
         # Optional: If the client detects a potentially expired socket based on this value, the socket will be immediately destroyed before sending the request, and the request will be retried with a new socket up to 3 times. Default: false (no retries)
         retry_on_expired_socket: false
   ```

The `log` option is not included above because it requires defining a Logger class and assigning it. Therefore, it cannot be set through `profiles.yaml`.

## Note

ClickHouse supports parameterized queries to prevent SQL injection using prepared statements. Named placeholders are defined using the `{name:type}` syntax. For more information, refer to the [Query with Parameters](https://clickhouse.com/docs/en/integrations/language-clients/nodejs#queries-with-parameters) section in the ClickHouse documentation.

However, the VulcanSQL API supports JSON format for API query parameters and does not support the full range of types available in ClickHouse. VulcanSQL only supports the conversion of the following types:

- `boolean` to ClickHouse type `Bool`
- `number` to ClickHouse types `Int` or `Float`
- `string` to ClickHouse type `String`

Therefore, if you need to query data with special types in ClickHouse, such as `Array(Unit8)`, `Record<K, V>`, `Date`, `DateTime`, and so on, you can use ClickHouse [Regular Functions](https://clickhouse.com/docs/en/sql-reference/functions) or [Type Conversion Functions](https://clickhouse.com/docs/en/sql-reference/functions/type-conversion-functions) to handle them.

Example:

```sql
-- If the `val` from the API query parameter is '1990-11-01' and the `born_date` column is of type `Date32`,
-- you can use the toDate function to convert the value. See https://clickhouse.com/docs/en/sql-reference/functions/type-conversion-functions#todate
SELECT * FROM users WHERE born_date = toDate({val:String});
```

## ⚠️ Caution

The ClickHouse driver currently does not support caching datasets. If you use the ClickHouse driver with caching dataset features, it will result in failure.

## Testing

To run tests for the `extension-driver-clickhouse` module, use the following command:

```bash
nx test extension-driver-clickhouse
```
