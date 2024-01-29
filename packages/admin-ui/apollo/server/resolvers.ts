import GraphQLJSON from 'graphql-type-json';
import {
  UsableDataSource,
  DataSourceName,
  DataSource,
  CompactColumn,
  Relation,
  CreateModelPayload,
  UpdateModelPayload,
  UpdateModelWhere,
  DeleteModelWhere,
  GetModelWhere,
} from './types';
import * as demoManifest from './manifest.json';
import { pick } from 'lodash';

export const resolvers = {
  JSON: GraphQLJSON,
  Query: {
    usableDataSource: () =>
      [
        {
          type: DataSourceName.BIG_QUERY,
          requiredProperties: ['displayName', 'projectId', 'credentials'],
        },
      ] as UsableDataSource[],
    listTables: () => ['orders', 'customers', 'products'],
    autoGenerateRelation: () => [],
    listColumns: () =>
      [
        {
          name: 'id',
          tableName: 'orders',
        },
        {
          name: 'customerId',
          tableName: 'orders',
        },
        {
          name: 'id',
          tableName: 'customers',
        },
        {
          name: 'name',
          tableName: 'customers',
        },
        {
          name: 'id',
          tableName: 'products',
        },
        {
          name: 'name',
          tableName: 'products',
        },
      ] as CompactColumn[],
    manifest: () => demoManifest,
    listModels: () => {
      const { models } = demoManifest;
      return models.map((model) => ({
        ...pick(model, [
          'name',
          'refSql',
          'primaryKey',
          'cached',
          'refreshTime',
          'description',
        ]),
      }));
    },
    getModel: (_, args: { where: GetModelWhere }) => {
      const { where } = args;
      const { models } = demoManifest;
      const model = models.find((model) => model.name === where.name);
      return {
        ...pick(model, [
          'name',
          'refSql',
          'primaryKey',
          'cached',
          'refreshTime',
          'description',
        ]),
        columns: model.columns.map((column) => ({
          ...pick(column, [
            'name',
            'type',
            'isCalculated',
            'notNull',
            'properties',
          ]),
        })),
        properties: model.properties,
      };
    },
  },
  Mutation: {
    saveDataSource: (_, args: { data: DataSource }) => {
      return args.data;
    },
    saveTables: (_, args: { data: string[] }) => {
      return args.data;
    },
    saveRelations: (_, args: { data: Relation[] }) => {
      return args.data;
    },
    createModel: (_, args: { data: CreateModelPayload }) => {
      const { data } = args;
      const { fields = [], customFields = [], calculatedFields = [] } = data;
      return {
        name: data.tableName,
        refSql: `SELECT * FROM ${data.tableName}`,
        columns: [
          ...fields.map((field) => ({
            name: field,
            type: 'string',
            isCalculated: false,
            notNull: false,
            properties: {},
          })),
          ...customFields.map((field) => ({
            name: field.name,
            type: 'string',
            isCalculated: false,
            notNull: false,
            properties: {},
          })),
          ...calculatedFields.map((field) => ({
            name: field.name,
            type: 'string',
            isCalculated: true,
            notNull: false,
            properties: {},
          })),
        ],
        properties: {
          displayName: data.displayName,
          description: data.description,
        },
      };
    },
    updateModel: (
      _,
      args: { where: UpdateModelWhere; data: UpdateModelPayload }
    ) => {
      const { where, data } = args;
      const { models } = demoManifest;
      const model =
        models.find((model) => model.name === where.name) || models[0];
      return {
        ...pick(model, [
          'name',
          'refSql',
          'primaryKey',
          'cached',
          'refreshTime',
          'description',
        ]),
        columns: model.columns.map((column) => ({
          ...pick(column, [
            'name',
            'type',
            'isCalculated',
            'notNull',
            'properties',
          ]),
        })),
        properties: {
          ...model.properties,
          displayName: data.displayName,
          description: data.description,
        },
      };
    },
    deleteModel: (_, args: { where: DeleteModelWhere }) => {
      return true;
    },
  },
};
