# extension-driver-canner

Connect to [canner enterprise](https://docs.cannerdata.com/product/api_sdk/pg/pg_overview) through PostgreSQL Wire Protocol

## Install

1. Install package

   ```sql
   npm i @vulcan-sql/extension-driver-canner
   ```

2. Update `vulcan.yaml`, enable the extension.

   ```yaml
   extensions:
     canner: '@vulcan-sql/extension-driver-canner'
   ```

3. Create a new profile in `profiles.yaml` or in your profiles' paths.

   ```yaml
   - name: canner # profile name
     type: canner
     connection:
      
      
      # Optional: Server host.
      host: string
      # Optional: The user to connect to canner enterprise. Default canner
      user: string
      # Optional: Password to connect to canner enterprise. should be the user PAT in canner enterprise
      password: string
      # Optional: sql name of the workspace.
      database: string
      # Optional: canner enterprise PostgreSQL wire protocol port
      port: 7432
      # Optional: The max rows we should fetch once.
      chunkSize: 100
      # Optional: Maximum number of clients the pool should contain.
      max: 10
      # Optional: Number of milliseconds before a statement in query will time out, default is no timeout
      statement_timeout: 0
      # Optional: Passed directly to node.TLSSocket, supports all tls.connect options
      ssl: false
      # Optional: Number of milliseconds before a query call will timeout, default is no timeout
      query_timeout: 0
      # Optional: The name of the application that created this Client instance
      application_name: string
      # Optional: Number of milliseconds to wait for connection, default is no timeout
      connectionTimeoutMillis: 0
      # Optional: Number of milliseconds before terminating any session with an open idle transaction, default is no timeout
      idle_in_transaction_session_timeout: 0
      # Optional: Number of milliseconds a client must sit idle in the pool and not be checked out before it is disconnected from the backend and discarded.
      idleTimeoutMillis: 10000
   ```
