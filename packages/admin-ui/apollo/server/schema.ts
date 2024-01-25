import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
  scalar JSON

  enum DataSourceName {
    BIG_QUERY
  }

  type UsableDataSource {
    type: DataSourceName!
    requiredProperties: [String!]!
  }

  type DataSource {
    type: DataSourceName!
    properties: JSON!
  }

  input DataSourceInput {
    type: DataSourceName!
    properties: JSON!
  }

  type Query {
    hello: String!
    usableDataSource: [UsableDataSource!]!
    listTables: [String!]!
  }

  type Mutation {
    saveDataSource(data: DataSourceInput!): DataSource!
    saveTables(data: [String!]!): [String!]!
  }
`;
