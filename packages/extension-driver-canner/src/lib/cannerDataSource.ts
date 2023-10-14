import axios from 'axios';
import {
  DataColumn,
  DataResult,
  DataSource,
  ExecuteOptions,
  ExportOptions,
  InternalError,
  RequestParameter,
  VulcanExtensionId,
} from '@vulcan-sql/core';
import { Readable } from 'stream';
import { buildSQL } from './sqlBuilder';
import * as fs from 'fs';
import * as path from 'path';
import { CannerAdapter } from './cannerAdapter';
import { isEmpty } from 'lodash';

interface Options {
  host: string;
  database: string;
  password: string;
  ssl?: boolean;
}

@VulcanExtensionId('canner')
export class CannerDataSource extends DataSource<any, Options> {
  private logger = this.getLogger();
  protected poolMapping = new Map<
    string,
    {
      pool: CannerAdapter;
      options: Options;
      properties?: Record<string, any>;
    }
  >();

  protected UserPool = new Map<string, CannerAdapter>();

  public override async onActivate() {
    const profiles = this.getProfiles().values();
    for (const profile of profiles) {
      // try to connect to the sql engine to check if the connection is valid
      this.logger.debug(
        `Initializing profile: ${profile.name} using sql engine`
      );

      // profile.connection must be defined
      if (profile.connection === undefined) {
        throw new InternalError(
          `Profile ${profile.name} does not have connection options`
        );
      }

      const cannerAdapter = new CannerAdapter(profile.connection);
      await cannerAdapter.syncQuery('select 1');

      this.poolMapping.set(profile.name, {
        pool: cannerAdapter,
        options: profile.connection,
        properties: profile.properties,
      });
      this.logger.debug(`Profile ${profile.name} initialized`);
    }
  }

  public override async export({
    sql,
    directory,
    profileName,
    options: cannerOptions,
  }: ExportOptions): Promise<void> {
    if (!this.poolMapping.has(profileName)) {
      throw new InternalError(`Profile instance ${profileName} not found`);
    }
    // throw if dir is not exist
    if (!fs.existsSync(directory)) {
      throw new InternalError(`Directory ${directory} not found`);
    }
    const { options: connection, properties } =
      this.poolMapping.get(profileName)!;
    const cannerAdapter = new CannerAdapter(connection);
    try {
      this.logger.debug('Send the async query to the Canner Enterprise');
      const header = this.getCannerRequestHeader(properties, cannerOptions);
      const presignedUrls = await cannerAdapter.createAsyncQueryResultUrls(
        sql,
        header
      );
      this.logger.debug(
        'Start fetching the query result parquet files from URLs'
      );
      await this.downloadFiles(presignedUrls, directory);
      this.logger.debug('Parquet files downloaded successfully');
    } catch (error: any) {
      this.logger.debug('Failed to export data from canner', error);
      throw error;
    }
  }

  private getCannerRequestHeader(
    properties?: Record<string, any>,
    cannerOptions?: any
  ) {
    const header: Record<string, string> = {};
    const userId = cannerOptions?.userId;
    const rootUserId = properties?.['rootUserId'];
    if (userId && rootUserId) {
      header[
        'x-trino-session'
      ] = `root_user_id=${rootUserId}, canner_user_id=${userId}`;
      this.logger.debug(`Impersonate used: ${userId}`);
    }
    return header;
  }

  private async downloadFiles(urls: string[], directory: string) {
    await Promise.all(
      urls.map(async (url: string, index: number) => {
        const response = await axios.get(url, {
          responseType: 'stream',
        });
        // The file name will be a substring that is after the last "/" and followed by the "?" and the query string
        // ex: https://cannerHost/data/canner/somePath/file-name?X-Amz-Algorithm=AWS4-HMAC-SHA256
        const fileName = url.split('/').pop()?.split('?')[0] || `part${index}`;
        const writeStream = fs.createWriteStream(
          // rename to parquet extension to make cache layer could read
          path.join(directory, `${fileName}.parquet`)
        );
        response.data.pipe(writeStream);
        return new Promise((resolve, reject) => {
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);
        });
      })
    );
  }
  public async execute({
    statement: sql,
    bindParams,
    profileName,
    operations,
    headers,
  }: ExecuteOptions): Promise<DataResult> {
    this.logger.debug(`Acquired connection from ${profileName}`);
    const auth = headers?.['authorization'];
    const password = auth?.trim().split(' ')[1];
    const pool = this.getPool(profileName, password);
    let client: CannerAdapter;
    try {
      client = pool;
      const builtSQL = buildSQL(sql, operations);
      const statement = this.sqlStatement(builtSQL, bindParams);
      const { nextData } = await client.syncQuery(statement);
      const firstChunk = await nextData();
      let firstRow = firstChunk.data;

      const fetchMore = async () => {
        if (firstRow === null) {
          return firstRow;
        }

        if (isEmpty(firstRow)) {
          const { data } = await nextData();
          return data;
        }

        const rows = [...firstRow];
        firstRow = [];
        return rows;
      };

      const getColumns = (): DataColumn[] => {
        return firstChunk.columns.map((column: any) => {
          return {
            name: column.name,
            type: column.type,
          };
        });
      };

      const stream = new Readable({
        objectMode: true,
        read() {
          fetchMore()
            .then((rows) => {
              // if rows is array, then push to stream
              if (Array.isArray(rows)) {
                rows.forEach((row) => {
                  this.push(row);
                });
              } else {
                this.push(rows);
              }
            })
            .catch((error) => {
              this.destroy(error);
            });
        },
        // automatically destroy() the stream when it emits 'finish' or errors. Node > 10.16
        autoDestroy: true,
      });

      return {
        getColumns,
        getData: () => stream,
      };
    } catch (e: any) {
      this.logger.debug(
        `Errors occurred, release connection from ${profileName}`
      );
      throw e;
    }
  }

  public async prepare({ parameterIndex }: RequestParameter) {
    return `$${parameterIndex}`;
  }

  // use protected to make it testable
  protected getPool(profileName: string, password?: string): CannerAdapter {
    if (!this.poolMapping.has(profileName)) {
      throw new InternalError(`Profile instance ${profileName} not found`);
    }
    const { pool: defaultPool, options: poolOptions } =
      this.poolMapping.get(profileName)!;
    this.logger.debug(`Acquiring connection from ${profileName}`);
    if (!password) {
      return defaultPool;
    }
    const database = poolOptions?.database || '';
    const userPoolKey = this.getUserPoolKey(password, database);
    if (this.UserPool.has(userPoolKey)) {
      const userPool = this.UserPool.get(userPoolKey);
      return userPool!;
    }
    const pool = new CannerAdapter({ ...poolOptions, password });
    this.UserPool.set(userPoolKey, pool);
    return pool;
  }

  // use protected to make it testable
  protected getUserPoolKey(pat: string, database?: string) {
    return `${pat}-${database}`;
  }

  private sqlStatement(statement: string, bindParams: Map<string, string>) {
    let sqlStatement = statement;
    const escapeRegExp = (string: string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    const replaceAll = (str: string, find: string, replace: any) => {
      return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
    };

    bindParams.forEach((value, key) => {
      sqlStatement = replaceAll(
        sqlStatement,
        key as unknown as string,
        typeof value === 'string' ? `'${value}'` : value
      );
    });

    return sqlStatement;
  }
}
