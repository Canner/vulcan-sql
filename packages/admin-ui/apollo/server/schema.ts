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

  type CompactTable {
    name: String!
    columns: [CompactColumn!]!
  }

  input MDLModelSubmitInput {
    name: String!
    columns: [String!]!
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

  input AutoGenerateInput {
    tables: [String!]!
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

  input MDLInput {
    models: [MDLModelSubmitInput!]!
    relations: [RelationInput!]!
  }

  type CompactColumn {
    name: String!
    type: String!
  }

  enum ModelType {
    TABLE
    CUSTOM
  }

  input CustomFieldInput {
    name: String!
    expression: String!
  }

  input CalculatedFieldInput {
    name: String!
    expression: String!
  }

  input CreateModelInput {
    type: ModelType!
    tableName: String!
    displayName: String!
    description: String
    cached: Boolean!
    refreshTime: String
    fields: [String!]!
    customFields: [CustomFieldInput!]
    calculatedFields: [CalculatedFieldInput!]
  }

  input ModelWhereInput {
    name: String!
  }

  input UpdateModelInput {
    type: ModelType!
    displayName: String!
    description: String
    cached: Boolean!
    refreshTime: String
    fields: [String!]!
    customFields: [CustomFieldInput!]
    calculatedFields: [CalculatedFieldInput!]
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

  input SimpleMeasureInput {
    name: String!
    type: String!
    isCalculated: Boolean!
    notNull: Boolean!
    properties: JSON!
  }

  input DimensionInput {
    name: String!
    type: String!
    isCalculated: Boolean!
    notNull: Boolean!
    properties: JSON!
  }

  input TimeGrainInput {
    name: String!
    refColumn: String!
    dateParts: [String!]!
  }

  input CreateSimpleMetricInput {
    name: String!
    displayName: String!
    description: String
    cached: Boolean!
    refreshTime: String
    model: String!
    modelType: ModelType!
    properties: JSON!
    measure: [SimpleMeasureInput!]!
    dimension: [DimensionInput!]!
    timeGrain: [TimeGrainInput!]!
  }

  type Query {
    # On Boarding Steps
    usableDataSource: [UsableDataSource!]!
    listDataSourceTables: [CompactTable!]!
    autoGenerateRelation(where: AutoGenerateInput): [Relation!]!
    manifest: JSON!

    # Modeling Page
    listModels: [CompactModel!]!
    getModel(where: ModelWhereInput!): DetailedModel!
  }

  type Mutation {
    # On Boarding Steps
    saveDataSource(data: DataSourceInput!): DataSource!
    saveMDL(data: MDLInput!): JSON!

    # Modeling Page
    createModel(data: CreateModelInput!): JSON!
    updateModel(where: ModelWhereInput!, data: UpdateModelInput!): JSON!
    deleteModel(where: ModelWhereInput!): Boolean!
  }
`;
