import GraphQLJSON from 'graphql-type-json';
import {
  UsableDataSource,
  DataSourceName,
  DataSource,
} from './types/dataSource';

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
  },
  Mutation: {
    saveDataSource: (_, args: { data: DataSource }) => {
      return args.data;
    },
    saveTables: (_, args: { data: string[] }) => {
      return args.data;
    },
  },
};
