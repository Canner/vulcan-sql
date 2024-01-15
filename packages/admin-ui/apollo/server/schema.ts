import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
  scalar JSON

  type Query {
    hello: String!
  }
`;
