# extension-driver-snowflake

[snowflake](https://www.snowflake.com/en/) driver for VulcanSQL.

## Install

1. Install package

   ```sql
   npm i @vulcan-sql/extension-driver-snowflake
   ```

2. Update `vulcan.yaml`, enable the extension.

   ```yaml
   extensions:
     snowflake: '@vulcan-sql/extension-driver-snowflake'
   ```

3. Create a new profile in `profiles.yaml` or in your profiles' paths.
   Please check [arguments of Snowflake SDK](https://docs.snowflake.com/en/user-guide/nodejs-driver-use.html#setting-the-connection-options) and [options of Generic Pool](https://github.com/coopernurse/node-pool) for further information.

   ```yaml
   - name: snow # profile name
     type: snowflake
     connection:
       # Required: Your account identifier. https://docs.snowflake.com/en/user-guide/admin-account-identifier.html
       account: 'xy12345.ap-northeast-1.aws'
       # Required: The login name for your Snowflake user or your Identity Provider (e.g. your login name for Okta).
       username: 'vulcan'
       # Optional: Specifies the name of the client application connecting to Snowflake.
       application: 'VulcanSQL'
       # Optional: Specifies the authenticator to use for verifying user login credentials.
       authenticator: 'SNOWFLAKE'
       # Optional: Password for the user. Set this option if you set the authenticator option to SNOWFLAKE or the Okta URL endpoint for your Okta account.
       password: 'pass'
       # Optional: Specifies the OAuth token to use for authentication. Set this option if you set the authenticator option to OAUTH.
       token: ''
       # Optional: Specifies the private key (in PEM format) for key pair authentication
       privateKey: ''
       # Optional: Specifies the local path to the private key file (e.g. rsa_key.p8)
       privateKeyPath: ''
       # Optional: Specifies the passcode to decrypt the private key file, if the file is encrypted.
       privateKeyPass: ''
       # Optional: The default database to use for the session after connecting.
       database: ''
       # Optional: The default virtual warehouse to use for the session after connecting. Used for performing queries, loading data, etc.
       warehouse: ''
       # Optional: Number of milliseconds to keep the connection alive with no response. Default: 60000 (1 minute).
       timeout: 60000
       # Optional: The default security role to use for the session after connecting.
       role: ''
       # Optional: The default schema to use for the session after connecting.
       schema: ''
       # Optional: Maximum number of connection to create at any given time. (default=1)
       max: 1
       # Optional: Minimum number of connection to keep at any given time. If this is set >= max, the pool will silently set the min to equal max. (default=0)
       min: 0
       # Optional: Maximum number of queued connections allowed.
       maxWaitingClients: 0
       # Optional: Max milliseconds a request will wait for a connection before timing out. (default no limit), if supplied should non-zero positive integer.
       acquireTimeoutMillis: 0
       # Optional: Max milliseconds a connection will wait for closing before timing out. (default no limit), if supplied should non-zero positive integer.
       destroyTimeoutMillis: 0
   ```

## Testing

```bash
nx test extension-driver-snowflake
```

To run test, the following environment variables are required:

- SNOWFLAKE_ACCOUNT
- SNOWFLAKE_USER
- SNOWFLAKE_PASSWORD
- SNOWFLAKE_WAREHOUSE
