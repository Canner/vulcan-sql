import GraphQLJSON from 'graphql-type-json';
import { DataSource, DataSourceName } from './types/dataSource';

export const resolvers = {
  JSON: GraphQLJSON,
  Query: {
    hello: () => 'Hello world!',

    usableDataSource: () =>
      [
        {
          name: DataSourceName.BIG_QUERY,
          requiredProperties: ['displayName', 'projectId', 'credentials'],
        },
      ] as DataSource[],
  },
};
