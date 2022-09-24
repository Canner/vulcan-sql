# extension-driver-pg

[node-postgres](https://node-postgres.com/) driver for Vulcan SQL.

## Install

1. Install package

   ```sql
   npm i @vulcan-sql/extension-driver-pg
   ```

2. Update `vulcan.yaml`, enable the extension.

   ```yaml
   extensions:
     pg: '@vulcan-sql/extension-driver-pg'
   ```

3. Create a new profile in `profiles.yaml` or in your profiles' paths.

   ```yaml
   - name: pg # profile name
     type: pg
     connection:
      # Optional: The max rows we should fetch once.
      chunkSize: 100
      # Optional: Maximum number of clients the pool should contain.
      max: 10
      # Optional: Number of milliseconds a client must sit idle in the pool and not be checked out before it is disconnected from the backend and discarded.
      idleTimeoutMillis: 10000
      # Optional: Number of milliseconds to wait before timing out when connecting a new client by default this is 0 which means no timeout
      connectionTimeoutMillis: 0
      # Optional: The user to connect to database. Default process.env.PGUSER || process.env.USER
      user: string
      # Optional: Password to connect to database. default process.env.PGPASSWORD
      password: string
      # Optional: Server host. default process.env.PGHOST
      host: string
      # Optional: Name of database. default process.env.PGDATABASE || user
      database: string
      # Optional: Server port. default process.env.PGPORT
      port: 5432
      # Optional: Connection string.
      connectionString: postgres://user:password@host:5432/database
      # Optional: Passed directly to node.TLSSocket, supports all tls.connect options
      ssl: false
      # Optional: Number of milliseconds before a statement in query will time out, default is no timeout
      statement_timeout: 0
      # Optional: Number of milliseconds before a query call will timeout, default is no timeout
      query_timeout: 0
      # Optional: The name of the application that created this Client instance
      application_name: string
      # Optional: Number of milliseconds to wait for connection, default is no timeout
      connectionTimeoutMillis: 0
      # Optional: Number of milliseconds before terminating any session with an open idle transaction, default is no timeout
      idle_in_transaction_session_timeout: 0
   ```
