// temporary definition for duckdb, ww only defined the function we used.

declare module 'duckdb' {
  export type DuckDbError = HttpError | _DuckDbError;

  type Callback<T> = (err: DuckDbError | null, res: T) => void;

  export type RowData = {
    [columnName: string]: any;
  };

  export type TableData = RowData[];

  /** The connection will be release by itself when not use */
  export class Connection {
    /**
     * Query and trigger callback function when query completed
     * @param sql
     * @param params prepare statement needed params. The last params is last callback function if needed
     */
    run(sql: string, ...params: [...any, Callback<void>] | []): void;
    /**
     * Query to get all rows data in callback function
     * @param sql
     * @param params prepare statement needed params. The last params is last callback function if needed
     */
    all(sql: string, ...params: [...any, Callback<TableData>] | []): void;
    /**
     * Query to get each row data in callback function
     * @param sql
     * @param params prepare statement needed params. The last params is last callback function if needed
     */
    each(sql: string, ...params: [...any, Callback<RowData>] | []): void;
    /**
     * Prepare a SQL query for execution
     * @param sql
     * @param params prepare statement needed params. The last params is last callback function if needed
     */
    prepare(
      sql: string,
      ...params: [...any, Callback<Statement>] | []
    ): Statement;
  }

  export class Database {
    /**
     * @param path  a file name for a persistent DB or :memory: for in-memory database
     */
    constructor(
      path: string,
      accessMode?: number | Record<string, string>,
      callback?: Callback<any>
    );
    constructor(path: string): Database;

    /** Create a new connection to execute query, each connection has own transaction context */
    connect(): Connection;
    /**
     * Close the database instance
     * @param callback trigger callback function when close the database instance
     */
    close(callback?: Callback<void>): void;
    /**
     * Wait all scheduled database tasks have completed.
     * @param callback trigger callback function when all scheduled database tasks have completed.
     */
    wait(callback?: Callback<void>): void;
    /**
     * Query and trigger callback function when query completed
     * @param sql
     * @param params prepare statement needed params. The last params is last callback function if needed
     */
    run(sql: string, ...params: [...any, Callback<void>] | []): void;
    /**
     * Query to get all rows data in callback function
     * @param sql
     * @param params prepare statement needed params. The last params is last callback function if needed
     */
    all(sql: string, ...params: [...any, Callback<TableData>] | []): void;
    /**
     * Query to get each row data in callback function
     * @param sql
     * @param params prepare statement needed params. The last params is last callback function if needed
     */
    each(sql: string, ...params: [...any, Callback<RowData>] | []): void;
    /**
     * Prepare a SQL query for execution
     * @param sql
     * @param params prepare statement needed params. The last params is last callback function if needed
     */
    prepare(
      sql: string,
      ...params: [...any, Callback<Statement>] | []
    ): Statement;
  }

  export class Statement {
    /**
     * Query and trigger callback function when query completed
     * @param params prepare statement needed params. The last params is last callback function if needed
     */
    run(...params: [...any, Callback<void>] | any[]): void;
    /**
     * Query to get all rows data in callback function
     * @param params prepare statement needed params. The last params is last callback function if needed
     */
    all(...params: [...any, Callback<TableData>] | any[]): void;
    /**
     * Query to get each row data in callback function
     * @param params prepare statement needed params. The last params is last callback function if needed
     */
    each(...params: [...any, Callback<RowData>] | any[]): void;
    /**
     * @param callback
     */
    finalize(callback?: Callback<void>): void;
    /**
     * Query to get result as a stream of rows
     * @param params prepare statement needed params.
     */
    stream(...params: any): Promise<QueryResult>; // This last parameter should be callback function.
  }

  export class QueryResult extends AsyncIterator {
    [Symbol.asyncIterator](): Iterator<any>;
    nextChunk(): Promise<any[][]>;
  }

  export const OPEN_READONLY: number;
}
