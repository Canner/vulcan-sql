import {
  DataColumn,
  DataResult,
  DataSource,
  ExecuteOptions,
  InternalError,
  RequestParameter,
  VulcanExtensionId,
} from '@vulcan-sql/core';
import { Stream } from 'stream';
import { buildSQL, convertSchemaToColumns } from './sqlBuilder';
import { mapFromKsqlDbType } from './typeMapper';
import {
  RestfulClient,
  RestfulClientOptions,
  QueryResponse,
  Header,
  Row,
  FinalMessage,
} from './restfulClient';

@VulcanExtensionId('ksqldb')
export class KSQLDBDataSource extends DataSource<any, any> {
  private logger = this.getLogger();
  private clientMapping = new Map<
    string,
    { client: RestfulClient; options?: RestfulClientOptions }
  >();
  public override async onActivate() {
    const profiles = this.getProfiles().values();
    for (const profile of profiles) {
      this.logger.debug(
        `Initializing profile: ${profile.name} using ksqldb driver`
      );
      const options = {
        ...profile.connection!,
      };
      const client = new RestfulClient(options);
      this.clientMapping.set(profile.name, { client, options });

      // Testing connection
      const isRunning = await client.checkConnectionRunning();
      if (!isRunning) {
        throw new Error('KsqlDb server is not running');
      }

      this.logger.debug(`Profile ${profile.name} initialized`);
    }
  }

  public async prepare({ parameterIndex }: RequestParameter) {
    return `$${parameterIndex}`;
  }

  public async execute({
    statement: sql,
    bindParams,
    profileName,
    operations,
  }: ExecuteOptions): Promise<DataResult> {
    this.checkProfileExist(profileName);
    const { client } = this.clientMapping.get(profileName)!;

    const params = Object.fromEntries(bindParams);
    try {
      const builtSQL = buildSQL(sql, operations);
      const data = await client.query({
        query: builtSQL,
        query_params: params,
      });
      return await this.getResultFromRestfulResponse(data);
    } catch (e) {
      this.logger.debug(
        `Errors occurred, release connection from ${profileName}`
      );
      throw e;
    }
  }

  private async getResultFromRestfulResponse(data: QueryResponse[]) {
    const dataRowStream = new Stream.Readable({
      objectMode: true,
      read: () => null,
      // automatically destroy() the stream when it emits 'finish' or errors. Node > 10.16
      autoDestroy: true,
    });

    const headerData = (data[0] as Header).header;
    const columns: DataColumn[] = convertSchemaToColumns(headerData.schema);
    // add the data row to the stream
    for (const innerData of data) {
      // format the ksqldb table response to VulcanSQL Data API
      // https://docs.ksqldb.io/en/latest/developer-guide/ksqldb-rest-api/query-endpoint/#example-table-response
      if ((innerData as Row).row) {
        const rowColumns = (innerData as Row).row.columns;
        const outputData = rowColumns.reduce((result, value, index) => {
          return { ...result, [columns[index].name]: value };
        }, {});
        dataRowStream.push(outputData);
      }

      // the end of query result
      if ((innerData as FinalMessage).finalMessage) {
        dataRowStream.push(null);
      }
    }

    return {
      getColumns: () => {
        return columns.map((column) => ({
          name: column.name || '',
          // Convert KsqlDb type to FieldDataType supported by VulcanSQL for generating the response schema in the specification, see: https://github.com/Canner/vulcan-sql/pull/78#issuecomment-1621532674
          type: mapFromKsqlDbType(column.type || ''),
        }));
      },
      getData: () => dataRowStream,
    };
  }

  private checkProfileExist(profileName: string) {
    if (!this.clientMapping.has(profileName)) {
      throw new InternalError(`Profile instance ${profileName} not found`);
    }
  }
}
