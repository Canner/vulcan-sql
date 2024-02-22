import { BigQueryOptions } from '@google-cloud/bigquery';
import {
  BQColumnResponse,
  BQConnector,
  BQListTableOptions,
} from '../connectors/bqConnector';
import { DataSource, DataSourceName, IContext, RelationData } from '../types';
import crypto from 'crypto';
import * as fs from 'fs';
import path from 'path';
import { getLogger, Encryptor } from '@vulcan-sql/admin-ui/apollo/server/utils';
import { Model, ModelColumn, Project } from '../repositories';
import { CreateModelsInput } from '../models';
import { IConfig } from '../config';

const logger = getLogger('DataSourceResolver');
logger.level = 'debug';

export class DataSourceResolver {
  constructor() {
    this.saveDataSource = this.saveDataSource.bind(this);
    this.listDataSourceTables = this.listDataSourceTables.bind(this);
    this.saveTables = this.saveTables.bind(this);
    this.autoGenerateRelation = this.autoGenerateRelation.bind(this);
    this.saveRelations = this.saveRelations.bind(this);
  }

  public async saveDataSource(
    _root: any,
    args: {
      data: DataSource;
    },
    ctx: IContext
  ) {
    const { type, properties } = args.data;
    if (type === DataSourceName.BIG_QUERY) {
      await this.saveBigQueryDataSource(properties, ctx);
      return args.data;
    }
  }

  public async listDataSourceTables(_root: any, arg, ctx: IContext) {
    const project = await this.getCurrentProject(ctx);
    const filePath = await this.getCredentialFilePath(project, ctx.config);
    const transformToCompactTable = true;
    return await this.fetchDatasetColumnInformationSchema(
      project,
      filePath,
      transformToCompactTable
    );
  }

  public async saveTables(
    _root: any,
    arg: {
      data: { tables: CreateModelsInput[] };
    },
    ctx: IContext
  ) {
    const tables = arg.data.tables;

    // get current project
    const project = await this.getCurrentProject(ctx);
    const filePath = await this.getCredentialFilePath(project, ctx.config);

    // get columns with descriptions
    const transformToCompactTable = false;
    const dataSourceColumns = await this.fetchDatasetColumnInformationSchema(
      project,
      filePath,
      transformToCompactTable
    );
    // create models
    const id = project.id;
    const models = await this.createModels(tables, id, ctx);

    // create columns
    const columns = await this.createModelColumns(
      tables,
      models,
      dataSourceColumns as BQColumnResponse[],
      ctx
    );

    return { models, columns };
  }

  public async autoGenerateRelation(_root: any, arg: any, ctx: IContext) {
    const project = await this.getCurrentProject(ctx);
    const models = await ctx.modelRepository.findAllBy({
      projectId: project.id,
    });

    // TODO: fetch BQ constraint to recommand relations

    return models.map(({ id, tableName }) => ({
      id,
      name: tableName,
      relations: [],
    }));
  }

  public async saveRelations(
    _root: any,
    arg: { data: { relations: RelationData[] } },
    ctx: IContext
  ) {
    const { relations } = arg.data;
    const project = await this.getCurrentProject(ctx);

    // throw error if the relation name is duplicated
    const relationNames = relations.map((relation) => relation.name);
    if (new Set(relationNames).size !== relationNames.length) {
      throw new Error('Duplicated relation name');
    }

    const columnIds = relations
      .map(({ fromColumn, toColumn }) => [fromColumn, toColumn])
      .flat();
    const columns = await ctx.modelColumnRepository.findColumnsByIds(columnIds);
    const relationValues = relations.map((relation) => {
      const fromColumn = columns.find(
        (column) => column.id === relation.fromColumn
      );
      if (!fromColumn) {
        throw new Error(`Column not found, column Id ${relation.fromColumn}`);
      }
      const toColumn = columns.find(
        (column) => column.id === relation.toColumn
      );
      if (!toColumn) {
        throw new Error(`Column not found, column Id  ${relation.toColumn}`);
      }
      return {
        projectId: project.id,
        name: relation.name,
        leftColumnId: relation.fromColumn,
        rightColumnId: relation.toColumn,
        joinType: relation.type,
      };
    });

    const savedRelations = await Promise.all(
      relationValues.map((relation) =>
        ctx.relationRepository.createOne(relation)
      )
    );
    return savedRelations;
  }

  private async fetchDatasetColumnInformationSchema(
    project: Project,
    filePath: string,
    format: boolean
  ) {
    // fetch tables
    const { location, projectId, dataset } = project;
    const connectionOption: BigQueryOptions = {
      location,
      projectId,
      keyFilename: filePath,
    };
    const connector = new BQConnector(connectionOption);
    const listTableOptions: BQListTableOptions = {
      dataset,
      format,
    };
    return await connector.listTables(listTableOptions);
  }

  private async getCredentialFilePath(project: Project, config: IConfig) {
    const { credentials: encryptedCredentials } = project;
    const encryptor = new Encryptor(config);
    const credentials = encryptor.decrypt(encryptedCredentials);
    const filePath = this.writeCredentialsFile(
      JSON.parse(credentials),
      config.persistCredentialDir
    );
    return filePath;
  }

  private async createModelColumns(
    tables: CreateModelsInput[],
    models: Model[],
    dataSourceColumns: BQColumnResponse[],
    ctx: IContext
  ) {
    const columnValues = tables.reduce((acc, table) => {
      const modelId = models.find((m) => m.tableName === table.name)?.id;
      for (const columnName of table.columns) {
        const dataSourceColumn = dataSourceColumns.find(
          (c) => c.table_name === table.name && c.column_name === columnName
        );
        if (!dataSourceColumn) {
          throw new Error(
            `Column ${columnName} not found in the DataSource ${table.name}`
          );
        }
        const columnValue = {
          modelId,
          isCalculated: false,
          name: columnName,
          type: dataSourceColumn?.data_type || 'string',
          notNull:
            dataSourceColumn.is_nullable.toLocaleLowerCase() === 'yes'
              ? false
              : true,
          isPk: false,
          properties: JSON.stringify({
            description: dataSourceColumn.description,
          }),
        } as Partial<ModelColumn>;
        acc.push(columnValue);
      }
      return acc;
    }, []);
    const columns = await Promise.all(
      columnValues.map(
        async (column) => await ctx.modelColumnRepository.createOne(column)
      )
    );
    return columns;
  }

  private async createModels(
    tables: CreateModelsInput[],
    id: number,
    ctx: IContext
  ) {
    const modelValues = tables.map(({ name }) => {
      const model = {
        projectId: id,
        name, //use table name as model name
        tableName: name,
        refSql: `select * from ${name}`,
        cached: false,
        refreshTime: null,
        properties: JSON.stringify({ description: '' }),
      } as Partial<Model>;
      return model;
    });

    const models = await Promise.all(
      modelValues.map(
        async (model) => await ctx.modelRepository.createOne(model)
      )
    );
    return models;
  }

  private async getCurrentProject(ctx: IContext) {
    const projects = await ctx.projectRepository.findAll({
      order: 'id',
      limit: 1,
    });
    if (!projects.length) {
      throw new Error('No project found');
    }
    return projects[0];
  }

  private async saveBigQueryDataSource(properties: any, ctx: IContext) {
    const { displayName, location, projectId, dataset, credentials } =
      properties;
    const { config } = ctx;
    let filePath = '';
    // check DataSource is valid and can connect to it
    filePath = await this.writeCredentialsFile(
      credentials,
      config.persistCredentialDir
    );
    const connectionOption: BigQueryOptions = {
      location,
      projectId,
      keyFilename: filePath,
    };
    const connector = new BQConnector(connectionOption);
    const connected = await connector.connect();
    if (!connected) {
      throw new Error('Cannot connect to DataSource');
    }
    // check can list dataset table
    try {
      await connector.listTables({ dataset });
    } catch (e) {
      throw new Error('Cannot list tables in dataset');
    }
    // save DataSource to database
    const encryptor = new Encryptor(config);
    const encryptedCredentials = encryptor.encrypt(credentials);

    // TODO: add displayName, schema, catalog to the DataSource, depends on the MDL structure
    const project = await ctx.projectRepository.createOne({
      displayName,
      schema: 'tbd',
      catalog: 'tbd',
      type: DataSourceName.BIG_QUERY,
      projectId,
      location,
      dataset,
      credentials: encryptedCredentials,
    });
    return project;
  }

  private writeCredentialsFile(
    credentials: JSON,
    persist_credential_dir: string
  ) {
    // file name will be the hash of the credentials, file path is current working directory
    // convert credentials from base64 to string and replace all the matched "\n" with "\\n",  there are many \n in the "private_key" property
    const credentialString = JSON.stringify(credentials);
    const fileName = crypto
      .createHash('md5')
      .update(credentialString)
      .digest('hex');

    const filePath = path.join(persist_credential_dir, `${fileName}.json`);
    // check if file exists
    if (fs.existsSync(filePath)) {
      logger.debug(`File ${filePath} already exists`);
      return filePath;
    }
    logger.debug(`Writing credentials to file ${filePath}`);
    fs.writeFileSync(filePath, credentialString);
    return filePath;
  }
}
