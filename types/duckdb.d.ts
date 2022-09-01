// temporary definition for duckdb, ww only defined the function we used.

declare module 'duckdb' {
  export class Database {
    /**
     * @param path  a file name for a persistent DB or :memory: for in-memory database
     */
    constructor(path: string): Database;
    /** Closes database instance */
    close(callback: (err: Error | null) => void): void;
    /** Triggers callback when all scheduled database tasks have completed. */
    wait(callback: (err: Error | null) => void): void;
    /**
     * Prepare a SQL query for execution
     * @param sql
     */
    prepare(sql: string): Statement;
    /**
     * Convenience method for Connection#run using a built-in default connection
     * @param sql
     * @param params
     */
    run(sql: string, ...params: any): void; // This last parameter should be callback function.
    /**
     * Convenience method for Connection#all using a built-in default connection
     * @param sql
     * @param params
     */
    all(sql: string, ...params: any): void; // This last parameter should be callback function.
    /**
     * Convenience method for Connection#each using a built-in default connection
     * @param sql
     * @param params
     */
    each(sql: string, ...params: any): void; // This last parameter should be callback function.
  }

  export class Statement {
    run(sql: string, ...params: any): void; // This last parameter should be callback function.
    /**
     * Convenience method for Connection#apply using a built-in default connection
     * @param sql
     * @param params
     */
    all(sql: string, ...params: any): void; // This last parameter should be callback function.
    /**
     * Convenience method for Connection#each using a built-in default connection
     * @param sql
     * @param params
     */
    each(sql: string, ...params: any): void; // This last parameter should be callback function.
    /**
     *
     * @param callback
     */
    finalize(callback: (err: Error | null) => void): void;
    /**
     * @param sql
     * @param params
     */
    stream(...params: any): Promise<QueryResult>; // This last parameter should be callback function.
  }

  export class QueryResult extends AsyncIterator {
    [Symbol.asyncIterator](): Iterator<any>;
    nextChunk(): Promise<any[][]>;
  }
}
