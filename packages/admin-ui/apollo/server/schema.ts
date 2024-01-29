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

  enum ModelType {
    TABLE
    CUSTOM
  }

  input CustomFieldInput {
    name: String!
    expression: String!
  }

  input CaculatedFieldInput {
    name: String!
    expression: String!
  }

  input CreateModelInput {
    type: ModelType!
    tableName: String!
    displayName: String!
    description: String
    fields: [String!]!
    customFields: [CustomFieldInput!]
    caculatedFields: [CaculatedFieldInput!]
  }

  input ModelWhereInput {
    name: String!
  }

  input UpdateModelInput {
    type: ModelType!
    displayName: String!
    description: String
    fields: [String!]!
    customFields: [CustomFieldInput!]
    caculatedFields: [CaculatedFieldInput!]
  }

  type CompactModel {
    name: String!
    refSql: String!
    primaryKey: String
    cached: Boolean!
    refreshTime: String!
    description: String
  }

  type DetailedColumn {
    name: String!
    type: String!
    isCalculated: Boolean!
    notNull: Boolean!
    properties: JSON!
  }

  type DetailedModel {
    name: String!
    refSql: String!
    primaryKey: String
    cached: Boolean!
    refreshTime: String!
    description: String
    columns: [DetailedColumn!]!
    properties: JSON!
  }

  type Query {
    # On Boarding Steps
    usableDataSource: [UsableDataSource!]!
    listTables: [String!]!
    autoGenerateRelation: [Relation!]!
    listColumns: [CompactColumn!]!
    manifest: JSON!

    # Modeling Page
    listModels: [CompactModel!]!
    getModel(where: ModelWhereInput!): DetailedModel!
  }

  type Mutation {
    # On Boarding Steps
    saveDataSource(data: DataSourceInput!): DataSource!
    saveTables(data: [String!]!): [String!]!
    saveRelations(data: [RelationInput!]!): [Relation!]!

    # Modeling Page
    createModel(data: CreateModelInput!): JSON!
    updateModel(where: ModelWhereInput!, data: UpdateModelInput!): JSON!
    deleteModel(where: ModelWhereInput!): Boolean!
  }
`;
