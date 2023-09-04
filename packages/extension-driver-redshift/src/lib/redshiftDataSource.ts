import {
  DataSource,
  DataResult,
  ExecuteOptions,
  InternalError,
  RequestParameter,
  VulcanExtensionId,
} from '@vulcan-sql/core';
import { Readable } from 'stream';
import { buildSQL } from './sqlBuilder';
import { mapFromRedShiftTypeId } from './typeMapper';
import {
  RedshiftDataClient,
  RedshiftDataClientConfig,
  ExecuteStatementCommand,
  ExecuteStatementCommandInput,
  ExecuteStatementCommandOutput,
  DescribeStatementCommandInput,
  DescribeStatementResponse,
  DescribeStatementCommand,
  GetStatementResultCommandInput,
  GetStatementResultCommand,
  SqlParameter,
} from '@aws-sdk/client-redshift-data';

export type RedshiftOptions = RedshiftDataClientConfig & Omit<ExecuteStatementCommandInput, "Sql" | "Parameters">;

type RedShiftDataRow = {
  [column: string]: any;
}

@VulcanExtensionId('redshift')
export class RedShiftDataSource extends DataSource<any, RedshiftOptions> {
  private logger = this.getLogger();
  private redshiftClientMapping = new Map<
    string,
    {
      redshiftClient: RedshiftDataClient;
      options?: RedshiftOptions;
    }
  >();
  public override async onActivate() {
    const profiles = this.getProfiles().values();
    for (const profile of profiles) {
      this.logger.debug(
        `Initializing profile: ${profile.name} using redshift driver`
      );

      const redshiftClient = new RedshiftDataClient(profile.connection!);
      this.redshiftClientMapping.set(profile.name, {
        redshiftClient: redshiftClient,
        options: profile.connection,
      });

      await this.testConnection(profile.name);
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
    const { redshiftClient, options } = this.redshiftClientMapping.get(profileName)!;

    try {
      const sqlParams: SqlParameter[] = [];
      bindParams.forEach((value, key) => {
        sqlParams.push({ name: key.replace(':', ''), value: String(value) });
      });

      const builtSQL = buildSQL(sql, operations);
      let executeStatementCommandParams: ExecuteStatementCommandInput = {
        Sql: builtSQL,
        Database: options!.Database,
        WorkgroupName: options!.WorkgroupName,
      };
      if (sqlParams.length) {
        executeStatementCommandParams = {...executeStatementCommandParams, Parameters: sqlParams}
      }

      const executeStatementCommand = new ExecuteStatementCommand(executeStatementCommandParams);
      const statementCommandResult = await redshiftClient.send(executeStatementCommand);
      return await this.getResultFromExecuteStatement(statementCommandResult, redshiftClient);
    } catch (e: any) {
      this.logger.debug(
        `Errors occurred, release connection from ${profileName}`
      );
      redshiftClient.destroy();
      throw e;
    }
  }

  public async prepare({ parameterIndex }: RequestParameter) {
    return `:${parameterIndex}`;
  }

  private async testConnection(profileName: string): Promise<DataResult | undefined> {
    const { redshiftClient, options } = this.redshiftClientMapping.get(profileName)!; 
    const executeStatementCommandParams: ExecuteStatementCommandInput = {
      Sql: 'select 1',
      Database: options!.Database,
      WorkgroupName: options!.WorkgroupName,
    };

    const executeStatementCommand = new ExecuteStatementCommand(executeStatementCommandParams);

    try {
      const statementCommandResult = await redshiftClient.send(executeStatementCommand);
      return await this.getResultFromExecuteStatement(statementCommandResult, redshiftClient);
    } catch (e) {
      redshiftClient.destroy();
      throw e;
    }
  }

  private async getResultFromExecuteStatement(
    statementCommandResult: ExecuteStatementCommandOutput,
    redshiftClient: RedshiftDataClient
  ): Promise<DataResult> {
    let describeStatementResponse: DescribeStatementResponse | undefined;
    const describeStatementRequestInput: DescribeStatementCommandInput = {
      Id: statementCommandResult.Id,
    };

    while (!describeStatementResponse || describeStatementResponse.Status !== 'FINISHED') {
      const describeStatementCommand = new DescribeStatementCommand(describeStatementRequestInput);
      describeStatementResponse = await redshiftClient.send(describeStatementCommand);

      if (
        describeStatementResponse.Status === 'ABORTED' || 
        describeStatementResponse.Status === 'FAILED'
      ) {
        throw describeStatementResponse.Error
      }
    }

    const getStatementResultCommandParams: GetStatementResultCommandInput = {
      "Id": describeStatementResponse.Id
    };
    const getStatementResultCommand = new GetStatementResultCommand(getStatementResultCommandParams);
    const getStatementResultResponse = await redshiftClient.send(getStatementResultCommand);

    return {
      getColumns: () => {
        const columns = getStatementResultResponse.ColumnMetadata || [];
        return columns.map((column) => ({
          name: column.name || '',
          type: mapFromRedShiftTypeId(column.typeName?.toLowerCase() || ''),
        }));
      },
      getData: () => new Readable({
        objectMode: true,
        read() {
          const records = getStatementResultResponse.Records! || [];
          const columns = getStatementResultResponse.ColumnMetadata || [];
          for (const record of records) {
            const row: RedShiftDataRow = {};
            for (const [i, recordField] of record.entries()) {
              row[columns[i].name!] = Object.values(recordField)[0];
            }
            this.push(row);
          }
          this.push(null);
        },
        // automatically destroy() the stream when it emits 'finish' or errors. Node > 10.16
        autoDestroy: true,
      }),
    };
  }

  private checkProfileExist(profileName: string): void {
    if (!this.redshiftClientMapping.has(profileName)) {
      throw new InternalError(`Profile instance ${profileName} not found`);
    }
  }
}
