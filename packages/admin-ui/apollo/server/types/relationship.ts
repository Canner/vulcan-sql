export interface Relation {
  from: RelationColumnInformation;
  to: RelationColumnInformation;
  type: RelationType;
}

export interface RelationColumnInformation {
  tableName: string;
  columnName: string;
}

export enum RelationType {
  ONE_TO_ONE = 'ONE_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
  MANY_TO_ONE = 'MANY_TO_ONE',
  MANY_TO_MANY = 'MANY_TO_MANY',
}
