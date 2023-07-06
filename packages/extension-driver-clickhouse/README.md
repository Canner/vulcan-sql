# extension-driver-clickhouse

[ClickHouse](https://clickhouse.com/) driver for VulcanSQL.

## Install

1. Install package

   ```sql
   npm i @vulcan-sql/extension-driver-clickhouse
   ```

2. Update `vulcan.yaml`, enable the extension.

   ```yaml
   extensions:
     clickhouse: '@vulcan-sql/extension-driver-clickhouse'
   ```

3. Create a new profile in `profiles.yaml` or in your profiles' paths. Please check [arguments of ClickHouse Client](https://clickhouse.com/docs/en/integrations/language-clients/nodejs) for further information.

   ```yaml
   - name: ch # profile name
     type: clickhouse
     connection:
       # Optional: ClickHouse instance URL. default is http://localhost:8123.
       host: 'www.example.com:8123'
       # Optional: The request timeout in milliseconds. Default value: 30000
       request_timeout: 60000
       # Optional: Maximum number of sockets to allow per host. Default value: Infinity.
       max_open_connections: 10
       # Optional: Data applications operating with large datasets over the wire can benefit from enabling compression. Currently, only GZIP is supported using zlib. Please see https://clickhouse.com/docs/en/integrations/language-clients/nodejs#compression
       compression:
         # Optional: "response: true" instructs ClickHouse server to respond with compressed response body. Default: true
         response: true
         # Optional: "request: true" enabled compression on the client request body. Default value: false
         request: false
       # Optional: The name of the user on whose behalf requests are made. Default value: 'default'
       username: 'user'
       # The user password. Default: ''.
       password: 'pass'
       # Optional: The name of the application using the Node.js client. Default value: VulcanSQL
       application: 'VulcanSQL'
       # Optional: Database name to use. Default value: 'default'
       database: 'hello-clickhouse'
       # Optional: ClickHouse settings to apply to all requests, below is a sample.
       # For all settings, please see the https://clickhouse.com/docs/en/operations/settings, the definition see https://github.com/ClickHouse/clickhouse-js/blob/0.1.1/src/settings.ts
       clickhouse_settings:
         # Optional: Allow Nullable types as primary keys. (default: false)
         allow_nullable_key: true
       # Optional: configure TLS certificates, please see https://clickhouse.com/docs/en/integrations/language-clients/nodejs#tls-certificates
       tls:
         # Optional The CA Cert file path
         ca_cert: 'ca-cert-file-path'
         # Optional: The Cert file path
         cert: 'cert-file-path'
         # Optional: The key file path
         key: 'key-path'
       # Optional: ClickHouse Session ID to send with every request
       session_id: ''
       # Optional: HTTP Keep-Alive related settings, please see https://clickhouse.com/docs/en/integrations/language-clients/nodejs#keep-alive
       keep_alive:
         # Optional: Enable or disable HTTP Keep-Alive mechanism. Default: true
         enabled: true
         # Optional:  How long to keep a particular open socket alive on the client side (in milliseconds).
         # Should be less than the server setting (see `keep_alive_timeout` in server's `config.xml`).
         # Currently, has no effect if  is unset or false. Default value: 2500 (based on the default ClickHouse server setting, which is 3000)
         socket_ttl: 2500
         # Optional: If the client detects a potentially expired socket based on the this socket will be immediately destroyed before sending the request ,and this request will be retried with a new socket up to 3 times. Default: false (no retries)
         retry_on_expired_socket: false
   ```

At the above, it not contains `log` option, because the `logs` need to define a Logger class and assign to it, so it could not set by `profiles.yaml`.

## Note

The ClickHouse support parameterize query to prevent SQL Injection by prepared statement. The named placeholder define by `{name:type}`, please see [Query with Parameters](https://clickhouse.com/docs/en/integrations/language-clients/nodejs#queries-with-parameters).

However, The VulcanSQL API support API query parameter is JSON format, so it not support [variety types like ClickHouse](https://clickhouse.com/docs/en/integrations/language-clients/nodejs#supported-clickhouse-data-types), The VulcanSQL will only support to convert below types:

- `boolean` to `Boolean` ClickHouse type
- `number` to `Int` or `Float` ClickHouse type
- `string` to `String` ClickHouse type

Therefore, if you would like to query the data is a special type from ClickHouse, e.g: `Array(Unit8)`, `Record<K, V>`, `Date`, `DateTime` ...etc, you could use the ClickHouse [Regular Function](https://clickhouse.com/docs/en/sql-reference/functions) or [Type Conversion Function](https://clickhouse.com/docs/en/sql-reference/functions/type-conversion-functions) to do it.

Example:

```sql
-- If the val from API query parameter is '1990-11-01', and the born_date columns type is Date32 type
-- What is the toDate function, please see https://clickhouse.com/docs/en/sql-reference/functions/type-conversion-functions#todate
SELECT * FROM users WHERE born_date = toDate({val:String});
```

## ⚠️ Caution

ClickHouse driver currently not yet support for caching datasets feature.

If you use the ClickHouse driver and setup the cache options in API Schema yaml, it will throw error.

## Testing

```bash
nx test extension-driver-clickhouse
```
