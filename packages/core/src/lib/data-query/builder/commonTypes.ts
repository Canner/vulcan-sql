export enum ComparisonPredicate {
  BETWEEN = 'BETWEEN',
  IN = 'IN',
  IS_NULL = 'IS_NULL',
  EXISTS = 'EXISTS',
}

export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
}

export type ComparisonOperator = '=' | '!=' | '>' | '<' | '>=' | '<=';

export const isOfComparisonOperator = (
  source: string
): source is ComparisonOperator => {
  return ['=', '!=', '>', '<', '>=', '<='].includes(source);
};

export interface BetweenPredicateInput {
  column: string;
  min: number;
  max: number;
}

export interface InPredicateInput {
  column: string;
  values: string[] | number[];
}

export interface NullPredicateInput {
  column: string;
}
