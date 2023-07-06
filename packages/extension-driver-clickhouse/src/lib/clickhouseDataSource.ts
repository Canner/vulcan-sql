import {
  BindParameters,
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
import { buildSQL } from './sqlBuilder';
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
        options: profile.connection,
      });

      await client.query({ query: 'SELECT 1;' });
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
      const builtSQL = buildSQL(sql, operations);
      const result = await client.query({
        query: builtSQL,
        // get result with column name and type, refer: https://clickhouse.com/docs/en/integrations/language-clients/nodejs#supported-data-formats
        format: 'JSONCompactEachRowWithNamesAndTypes',
        query_params: params,
      });
      return await this.getResultFromRestfulSet(result);
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
    return `{p${parameterIndex}:${mapToClickHouseType(value)}`;
  }

  private async getResultFromRestfulSet(result: ResultSet) {
    const dataRowStream = new Stream.Readable({
      objectMode: true,
      read: () => null,
      // automatically destroy() the stream when it emits 'finish' or errors. Node > 10.16
      autoDestroy: true,
    });
    // data is all rows according to https://clickhouse.com/docs/en/integrations/language-clients/nodejs#resultset-and-row-abstractions
    // first row is column names, second row is column types, the rest is data
    let names: string[] = [];
    let types: string[] = [];
    const rawStream = result.stream();
    rawStream.on('data', (rows: Row[]) => {
      const [namesRow, typesRow, ...dataRows] = rows;
      names = JSON.parse(namesRow.text);
      types = JSON.parse(typesRow.text);
      // ClickHouse stream only called once and return all data row in one chuck, so we need to push each row to the stream by loop.
      // Please see https://clickhouse.com/docs/en/integrations/language-clients/nodejs#resultset-and-row-abstractions
      dataRows.forEach((row) => dataRowStream.push(row.text));
    });
    await new Promise((resolve) => {
      rawStream.on('end', () => {
        dataRowStream.push(null);
        resolve(null);
      });
    });
    return {
      getColumns: () => {
        return names.map((name, idx) => ({
          name: name || '',
          // Convert ClickHouse type to FieldDataType supported by VulcanSQL for generating the response schema in the specification
          // please see https://github.com/Canner/vulcan-sql/pull/78#issuecomment-1621532674
          type: mapFromClickHouseType(types[idx] || ''),
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
