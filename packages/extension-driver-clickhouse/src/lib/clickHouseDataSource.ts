import {
  BindParameters,
  DataColumn,
  DataResult,
  DataSource,
  ExecuteOptions,
  ExportOptions,
  InternalError,
  RequestParameter,
  VulcanExtensionId,
} from '@vulcan-sql/core';
import { Stream } from 'stream';
import * as fs from 'fs';
import {
  createClient,
  ClickHouseClientConfigOptions,
  ClickHouseClient,
  ResultSet,
  Row,
} from '@clickhouse/client';
import { buildSQL, removeEndingSemiColon } from './sqlBuilder';
import { mapFromClickHouseType, mapToClickHouseType } from './typeMapper';
import { omit } from 'lodash';

export type ClickHouseOptions = ClickHouseClientConfigOptions;
export type ClickHouseTLSOptions = {
  ca_cert?: string;
  cert?: string;
  key?: string;
};

@VulcanExtensionId('clickhouse')
export class ClickHouseDataSource extends DataSource<any, ClickHouseOptions> {
  private logger = this.getLogger();
  private clientMapping = new Map<
    string,
    { client: ClickHouseClient; options?: ClickHouseOptions }
  >();
  public override async onActivate() {
    const profiles = this.getProfiles().values();
    for (const profile of profiles) {
      this.logger.debug(
        `Initializing profile: ${profile.name} using clickhouse driver`
      );

      // Omit and get the tls from connection, because clickhouse client support tls for bytes data,
      const tls = omit(profile.connection, ['tls']) as ClickHouseTLSOptions;
      const options: ClickHouseOptions = {
        ...{ application: 'VulcanSQL' },
        ...profile.connection!,
      };
      // Set TLS options is existed
      if (tls.ca_cert && tls.cert && tls.key) {
        options.tls = {
          ca_cert: fs.readFileSync(tls.ca_cert),
          cert: fs.readFileSync(tls.cert),
          key: fs.readFileSync(tls.key),
        };
      } else if (tls.ca_cert) {
        options.tls = { ca_cert: fs.readFileSync(tls.ca_cert) };
      }

      const client = createClient(options);
      this.clientMapping.set(profile.name, {
        client,
        options,
      });

      await client.query({ query: 'SELECT 1' });
      this.logger.debug(`Profile ${profile.name} initialized`);
    }
  }

  public async execute({
    statement: sql,
    bindParams,
    profileName,
    operations,
  }: ExecuteOptions): Promise<DataResult> {
    this.checkProfileExist(profileName);
    const { client } = this.clientMapping.get(profileName)!;

    // convert to clickhouse support type of query params.
    const params = this.convertToQueryParams(bindParams);
    try {
      // Use JSONEachFormat to get data result with column name , refer: https://clickhouse.com/docs/en/integrations/language-clients/nodejs#supported-data-formats
      const builtSQL = buildSQL(sql, operations);
      const data = await client.query({
        query: builtSQL,
        format: 'JSONEachRow',
        query_params: params,
      });
      // Get the query metadata e.g: column name, type by DESCRIBE TABLE method.
      // DESCRIBE TABLE will return the type after evaluating the query, without execution, and will return only one entry per column, see: https://www.tinybird.co/blog-posts/tips-11-how-to-get-the-types-returned-by-a-query
      const metadata = await client.query({
        // remove semicolon at the end, because could not exist semicolon in sub-query when using DESCRIBE TABLE
        query: `DESCRIBE TABLE (${removeEndingSemiColon(builtSQL)})`,
        format: 'JSONEachRow',
        query_params: params,
      });
      return await this.getResultFromRestfulSet(metadata, data);
    } catch (e: any) {
      this.logger.debug(
        `Errors occurred, release connection from ${profileName}`
      );
      throw e;
    }
  }

  public async prepare({ parameterIndex, value }: RequestParameter) {
    // ClickHouse use {name:type} be a placeholder, so if we only use number string as name e.g: {1:Unit8}
    // it will face issue when converting to the query params => {1: value1}, because the key is value not string type, so here add prefix "p" to avoid this issue.
    return `{p${parameterIndex}:${mapToClickHouseType(value)}}`;
  }

  public async destroy() {
    for (const { client } of this.clientMapping.values()) {
      await client.close();
    }
  }

  private async getResultFromRestfulSet(metadata: ResultSet, data: ResultSet) {
    const dataRowStream = new Stream.Readable({
      objectMode: true,
      read: () => null,
      // automatically destroy() the stream when it emits 'finish' or errors. Node > 10.16
      autoDestroy: true,
    });
    // Get the metadata and only need column name and type
    const columns = (await metadata.json()) as Array<DataColumn>;
    const rawStream = data.stream();
    // ClickHouse stream only called once and return all data row in one chuck, so we need to push each row to the stream by loop.
    // Please see https://clickhouse.com/docs/en/integrations/language-clients/nodejs#resultset-and-row-abstractions
    rawStream.on('data', (rows: Row[]) => {
      rows.forEach((row) => dataRowStream.push(JSON.parse(row.text)));
    });
    await new Promise((resolve) => {
      rawStream.on('end', () => {
        dataRowStream.push(null);
        resolve(null);
      });
    });
    return {
      getColumns: () => {
        return columns.map((column) => ({
          name: column.name || '',
          // Convert ClickHouse type to FieldDataType supported by VulcanSQL for generating the response schema in the specification, see: https://github.com/Canner/vulcan-sql/pull/78#issuecomment-1621532674
          type: mapFromClickHouseType(column.type || ''),
        }));
      },
      getData: () => dataRowStream,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public override async export(options: ExportOptions): Promise<void> {
    throw new InternalError(
      'ClickHouse not yet support exporting data to parquet file for caching datasets feature'
    );
  }

  private checkProfileExist(profileName: string) {
    if (!this.clientMapping.has(profileName)) {
      throw new InternalError(`Profile instance ${profileName} not found`);
    }
  }

  private convertToQueryParams(bind: BindParameters) {
    // find the param name from named placeholder from prepare method
    const pattern = /{(\w+):\w+}/;
    const params: Record<string, any> = {};
    bind.forEach((value, key) => {
      // get the param name from key. e.g: "{p1:Unit8}" => "p1"
      const paramName = key.match(pattern)![1];
      params[paramName] = value;
    });
    return params;
  }
}
