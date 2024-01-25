import GraphQLJSON from 'graphql-type-json';
import {
  UsableDataSource,
  DataSourceName,
  DataSource,
  CompactColumn,
  Relation,
} from './types';

export const resolvers = {
  JSON: GraphQLJSON,
  Query: {
    hello: () => 'Hello world!',

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
  },
};
