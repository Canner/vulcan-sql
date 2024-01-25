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
  },
  Mutation: {
    SaveDataSource: (_, args: { data: DataSource }) => {
      return args.data;
    },
  },
};
