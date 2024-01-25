import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
  scalar JSON

  type DataSource {
    name: String!
    requiredProperties: [String!]!
  }

  type Query {
    hello: String!
    usableDataSource: [DataSource!]!
  }
`;
