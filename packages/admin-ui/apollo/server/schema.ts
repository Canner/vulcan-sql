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

  type RelationColumnInformation {
    tableName: String!
    columnName: String!
  }

  enum RelationType {
    ONE_TO_ONE
    ONE_TO_MANY
    MANY_TO_ONE
    MANY_TO_MANY
  }

  type Relation {
    from: RelationColumnInformation!
    to: RelationColumnInformation!
    type: RelationType!
  }

  input RelationColumnInformationInput {
    tableName: String!
    columnName: String!
  }

  input RelationInput {
    from: RelationColumnInformationInput!
    to: RelationColumnInformationInput!
    type: RelationType!
  }

  type CompactColumn {
    name: String!
    tableName: String!
  }

  type Query {
    hello: String!
    usableDataSource: [UsableDataSource!]!
    listTables: [String!]!
    autoGenerateRelation: [Relation!]!
    listColumns: [CompactColumn!]!
    manifest: JSON!
  }

  type Mutation {
    saveDataSource(data: DataSourceInput!): DataSource!
    saveTables(data: [String!]!): [String!]!
    saveRelations(data: [RelationInput!]!): [Relation!]!
  }
`;
