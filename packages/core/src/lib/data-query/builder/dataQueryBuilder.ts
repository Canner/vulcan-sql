import { IDataSource } from '@vulcan-sql/core/data-source';
import { Pagination } from '@vulcan-sql/core/models';

import { find, isEmpty } from 'lodash';
import {
  ComparisonPredicate,
  ComparisonOperator,
  LogicalOperator,
  BetweenPredicateInput,
  InPredicateInput,
  NullPredicateInput,
  isOfComparisonOperator,
} from './commonTypes';
import {
  IJoinOnClause,
  JoinOnClause,
  JoinOnClauseOperation,
} from './joinOnClause';

export enum SelectCommandType {
  SELECT = 'SELECT',
  SELECT_DISTINCT = 'SELECT_DISTINCT',
}

export enum AggregateFuncType {
  COUNT = 'COUNT',
  SUM = 'SUM',
  AVG = 'AVG',
  MIN = 'MIN',
  MAX = 'MAX',
}

export enum JoinCommandType {
  INNER_JOIN = 'INNER_JOIN',
  LEFT_JOIN = 'LEFT_JOIN',
  RIGHT_JOIN = 'RIGHT_JOIN',
  FULL_JOIN = 'FULL_JOIN',
}

export enum WherePredicate {
  WRAPPED = 'WRAPPED',
  LIKE = 'LIKE',
}

export interface AliasColumn {
  // original column name
  name: string;
  // alias column name
  as?: string;
}

export interface SelectedColumn extends AliasColumn {
  aggregateType?: AggregateFuncType;
}

export interface SelectClauseOperation {
  command: SelectCommandType;
  columns: Array<SelectedColumn>;
}

export interface AliasDataQueryBuilder {
  // the join builder
  builder: IDataQueryBuilder;
  // alias builder name for join builder
  as: string;
}

export interface JoinClauseOperation {
  command: JoinCommandType;
  // the join on clause operations e.g: on, onBetween...
  onClauses: Array<JoinOnClauseOperation>;
  joinBuilder: AliasDataQueryBuilder;
}

export type JoinClauseCallback = (clause: IJoinOnClause) => void;

// Where clause Operation
export interface WhereOperatorInput {
  column: string;
  operator: ComparisonOperator;
  value: string | number | boolean | IDataQueryBuilder;
}

export type BuilderClauseCallback = (builder: IDataQueryBuilder) => void;

export type WhereInPredicateInput = InPredicateInput & {
  values: string[] | number[] | IDataQueryBuilder;
};

export interface WhereLikePredicateInput {
  column: string;
  searchValue: string;
}

export type WherePredicateInput =
  | WhereOperatorInput
  | BetweenPredicateInput
  | WhereInPredicateInput
  | NullPredicateInput
  | WhereLikePredicateInput
  | IDataQueryBuilder;

export interface WhereClauseOperation {
  // null means using ComparisonOperator
  command: WherePredicate | ComparisonPredicate | LogicalOperator | null;
  /*  If command is LogicalOperator type, data will be undefined or, data multi possible cases, including:
    - command is WHERE => data will be NormalWhereClauseOperation type
    - command is WHERE_WRAPPED => data will be Array<WhereClauseOperation> type
    - command is WHERE_EXIST => data will be AliasDataQueryBuilder type
    */
  data?:
    | WherePredicateInput
    | Array<WhereClauseOperation>
    | AliasDataQueryBuilder;
}

// Group by clause Operation
export type GroupByClauseOperations = Array<string>;

// Having clause Operation
export interface HavingOperatorInput {
  column: SelectedColumn;
  operator: ComparisonOperator;
  value: string | number | boolean | IDataQueryBuilder;
}

export type HavingInPredicateInput = InPredicateInput & {
  column: SelectedColumn;
};

export interface HavingBetweenPredicateInput {
  column: SelectedColumn;
  min: number;
  max: number;
}

export type HavingPredicateInput =
  | HavingOperatorInput
  | HavingBetweenPredicateInput
  | HavingInPredicateInput
  | NullPredicateInput
  | IDataQueryBuilder;

export interface HavingClauseOperation {
  // null means using ComparisonOperator
  command: ComparisonPredicate | LogicalOperator | null;
  // data could be normal value, object or wrapped where operations
  data?: HavingPredicateInput | AliasDataQueryBuilder;
}

// Order by clause operation
export enum Direction {
  ASC = 'ASCENDING',
  DESC = 'DESCENDING',
}
export interface OrderByClauseOperation {
  column: string;
  direction: Direction;
}

export interface SQLClauseOperation {
  // record select clause operations, null means select *
  select: SelectClauseOperation | null;
  // record where clause operations
  where: Array<WhereClauseOperation>;
  // record join clause operations => ok
  join: Array<JoinClauseOperation>;
  // record groupBy clause operations, array is column name
  groupBy: GroupByClauseOperations;
  // recode having clause operations
  having: Array<HavingClauseOperation>;
  // record orderBy operations
  orderBy: Array<OrderByClauseOperation>;
  // null means not set the value
  limit: number | null;
  // null means not set the value
  offset: number | null;
}

export interface IDataQueryBuilder {
  readonly statement: string;
  readonly operations: SQLClauseOperation;
  readonly dataSource: IDataSource;

  // Select clause methods
  select(...columns: Array<SelectedColumn | string>): IDataQueryBuilder;
  distinct(...columns: Array<SelectedColumn | string>): IDataQueryBuilder;
  column(...columns: Array<SelectedColumn | string>): IDataQueryBuilder;
  first(...columns: Array<SelectedColumn | string>): IDataQueryBuilder;
  count(column: AliasColumn | string): IDataQueryBuilder;
  min(column: AliasColumn | string): IDataQueryBuilder;
  max(column: AliasColumn | string): IDataQueryBuilder;
  sum(column: AliasColumn | string): IDataQueryBuilder;
  avg(column: AliasColumn | string): IDataQueryBuilder;
  // Join clause methods
  innerJoin(
    builder: AliasDataQueryBuilder,
    joinCallback: JoinClauseCallback
  ): IDataQueryBuilder;
  leftJoin(
    builder: AliasDataQueryBuilder,
    joinCallback: JoinClauseCallback
  ): IDataQueryBuilder;
  rightJoin(
    builder: AliasDataQueryBuilder,
    joinCallback: JoinClauseCallback
  ): IDataQueryBuilder;
  fullJoin(
    builder: AliasDataQueryBuilder,
    joinCallback: JoinClauseCallback
  ): IDataQueryBuilder;
  // Where clause methods
  where(
    column: string,
    operator: string,
    value: string | number | boolean | IDataQueryBuilder
  ): IDataQueryBuilder;
  whereNot(
    column: string,
    operator: string,
    value: string | number | boolean | IDataQueryBuilder
  ): IDataQueryBuilder;
  whereWrapped(builderCallback: BuilderClauseCallback): IDataQueryBuilder;
  whereNotWrapped(builderCallback: BuilderClauseCallback): IDataQueryBuilder;
  whereBetween(column: string, min: number, max: number): IDataQueryBuilder;
  whereNotBetween(column: string, min: number, max: number): IDataQueryBuilder;
  whereIn(
    column: string,
    values: string[] | number[] | IDataQueryBuilder
  ): IDataQueryBuilder;
  whereNotIn(
    column: string,
    values: string[] | number[] | IDataQueryBuilder
  ): IDataQueryBuilder;
  whereNull(column: string): IDataQueryBuilder;
  whereNotNull(column: string): IDataQueryBuilder;
  whereLike(column: string, searchValue: string): IDataQueryBuilder;
  whereExists(subQueryBuilder: AliasDataQueryBuilder): IDataQueryBuilder;
  whereNotExists(subQueryBuilder: AliasDataQueryBuilder): IDataQueryBuilder;
  // And Where clause methods
  andWhere(
    column: string,
    operator: string,
    value: string | number | boolean | IDataQueryBuilder
  ): IDataQueryBuilder;
  andWhereNot(
    column: string,
    operator: string,
    value: string | number | boolean | IDataQueryBuilder
  ): IDataQueryBuilder;
  andWhereWrapped(builderCallback: BuilderClauseCallback): IDataQueryBuilder;
  andWhereNotWrapped(builderCallback: BuilderClauseCallback): IDataQueryBuilder;
  andWhereBetween(column: string, min: number, max: number): IDataQueryBuilder;
  andWhereNotBetween(
    column: string,
    min: number,
    max: number
  ): IDataQueryBuilder;
  andWhereIn(
    column: string,
    values: string[] | number[] | IDataQueryBuilder
  ): IDataQueryBuilder;
  andWhereNotIn(
    column: string,
    values: string[] | number[] | IDataQueryBuilder
  ): IDataQueryBuilder;
  andWhereNull(column: string): IDataQueryBuilder;
  andWhereNotNull(column: string): IDataQueryBuilder;
  andWhereLike(column: string, searchValue: string): IDataQueryBuilder;
  andWhereExists(subQueryBuilder: AliasDataQueryBuilder): IDataQueryBuilder;
  andWhereNotExists(subQueryBuilder: AliasDataQueryBuilder): IDataQueryBuilder;
  // Or Where clause methods
  orWhere(
    column: string,
    operator: string,
    value: string | number | boolean | IDataQueryBuilder
  ): IDataQueryBuilder;
  orWhereNot(
    column: string,
    operator: string,
    value: string | number | boolean | IDataQueryBuilder
  ): IDataQueryBuilder;
  orWhereWrapped(builderCallback: BuilderClauseCallback): IDataQueryBuilder;
  orWhereNotWrapped(builderCallback: BuilderClauseCallback): IDataQueryBuilder;
  orWhereBetween(column: string, min: number, max: number): IDataQueryBuilder;
  orWhereNotBetween(
    column: string,
    min: number,
    max: number
  ): IDataQueryBuilder;
  orWhereIn(
    column: string,
    values: string[] | number[] | IDataQueryBuilder
  ): IDataQueryBuilder;
  orWhereNotIn(
    column: string,
    values: string[] | number[] | IDataQueryBuilder
  ): IDataQueryBuilder;
  orWhereNull(column: string): IDataQueryBuilder;
  orWhereNotNull(column: string): IDataQueryBuilder;
  orWhereLike(column: string, searchValue: string): IDataQueryBuilder;
  orWhereExists(subQueryBuilder: AliasDataQueryBuilder): IDataQueryBuilder;
  orWhereNotExists(subQueryBuilder: AliasDataQueryBuilder): IDataQueryBuilder;

  // Group by clause method
  groupBy(...columns: string[]): IDataQueryBuilder;

  // Having clause methods
  having(
    column: SelectedColumn | string,
    operator: string,
    value: string | number | boolean | IDataQueryBuilder
  ): IDataQueryBuilder;
  havingIn(
    column: SelectedColumn | string,
    values: number[] | string[]
  ): IDataQueryBuilder;
  havingNotIn(
    column: SelectedColumn | string,
    values: number[] | string[]
  ): IDataQueryBuilder;
  havingBetween(
    column: SelectedColumn | string,
    min: number,
    max: number
  ): IDataQueryBuilder;
  havingNotBetween(
    column: SelectedColumn | string,
    min: number,
    max: number
  ): IDataQueryBuilder;
  havingNull(column: string): IDataQueryBuilder;
  havingNotNull(column: string): IDataQueryBuilder;
  havingExists(subQueryBuilder: AliasDataQueryBuilder): IDataQueryBuilder;
  havingNotExists(subQueryBuilder: AliasDataQueryBuilder): IDataQueryBuilder;
  // And Having clause methods
  andHaving(
    column: SelectedColumn | string,
    operator: string,
    value: string | number | boolean | IDataQueryBuilder
  ): IDataQueryBuilder;
  andHavingIn(
    column: SelectedColumn | string,
    values: number[] | string[]
  ): IDataQueryBuilder;
  andHavingNotIn(
    column: SelectedColumn | string,
    values: number[] | string[]
  ): IDataQueryBuilder;
  andHavingBetween(
    column: SelectedColumn | string,
    min: number,
    max: number
  ): IDataQueryBuilder;
  andHavingNotBetween(
    column: SelectedColumn | string,
    min: number,
    max: number
  ): IDataQueryBuilder;
  andHavingNull(column: string): IDataQueryBuilder;
  andHavingNotNull(column: string): IDataQueryBuilder;
  andHavingExists(subQueryBuilder: AliasDataQueryBuilder): IDataQueryBuilder;
  andHavingNotExists(subQueryBuilder: AliasDataQueryBuilder): IDataQueryBuilder;
  // Or Having clause methods
  orHaving(
    column: SelectedColumn | string,
    operator: string,
    value: string | number | boolean | IDataQueryBuilder
  ): IDataQueryBuilder;
  orHavingIn(
    column: SelectedColumn | string,
    values: number[] | string[]
  ): IDataQueryBuilder;
  orHavingNotIn(
    column: SelectedColumn | string,
    values: number[] | string[]
  ): IDataQueryBuilder;
  orHavingBetween(
    column: SelectedColumn | string,
    min: number,
    max: number
  ): IDataQueryBuilder;
  orHavingNotBetween(
    column: SelectedColumn | string,
    min: number,
    max: number
  ): IDataQueryBuilder;
  orHavingNull(column: string): IDataQueryBuilder;
  orHavingNotNull(column: string): IDataQueryBuilder;
  orHavingExists(subQueryBuilder: AliasDataQueryBuilder): IDataQueryBuilder;
  orHavingNotExists(subQueryBuilder: AliasDataQueryBuilder): IDataQueryBuilder;
  // Order by clause method
  orderBy(column: string, direction: Direction): IDataQueryBuilder;
  // Limit and Offset clause method
  limit(size: number): IDataQueryBuilder;
  offset(move: number): IDataQueryBuilder;
  take(size: number, move: number): IDataQueryBuilder;
  // paginate
  paginate(pagination: Pagination): void;
  value(): Promise<object>;
  clone(): IDataQueryBuilder;
}

export class DataQueryBuilder implements IDataQueryBuilder {
  public readonly statement: string;
  // record all operations for different SQL clauses
  public readonly operations: SQLClauseOperation;
  public readonly dataSource: IDataSource;
  public pagination?: Pagination;
  constructor({
    statement,
    operations,
    dataSource,
  }: {
    statement: string;
    operations?: SQLClauseOperation;
    dataSource: IDataSource;
  }) {
    this.statement = statement;
    this.dataSource = dataSource;
    this.operations = operations || {
      select: null,
      where: [],
      join: [],
      groupBy: [],
      having: [],
      orderBy: [],
      limit: null,
      offset: null,
    };
  }

  // Select clause methods
  public select(...columns: Array<SelectedColumn | string>) {
    // if columns is empty, set to select all
    if (isEmpty(columns)) columns = ['*'];
    // skip current select if select only '*' value and has existed select '*' in record.
    const isSelectAllExist = (column: SelectedColumn) => column.name === '*';
    const isAllColumns = (column: string | SelectedColumn) =>
      ['*', ''].includes(column as string) ||
      [{ name: '*' }, { name: '' }].includes(column as SelectedColumn);
    if (
      columns.length === 1 &&
      isAllColumns(columns[0]) &&
      this.operations.select &&
      find(this.operations.select.columns, isSelectAllExist)
    ) {
      return this;
    }

    this.recordSelect({ command: SelectCommandType.SELECT, columns });
    return this;
  }
  public distinct(...columns: Array<SelectedColumn | string>) {
    this.recordSelect({ command: SelectCommandType.SELECT_DISTINCT, columns });
    return this;
  }

  // alias name method for select
  public column(...columns: Array<SelectedColumn | string>) {
    return this.select(...columns);
  }
  // select and limit 1
  public first(...columns: Array<SelectedColumn | string>) {
    this.select(...columns);
    this.limit(1);
    return this;
  }

  public count(column: AliasColumn | string = '*') {
    const normalized: SelectedColumn =
      typeof column === 'string'
        ? {
            name: '*',
            aggregateType: AggregateFuncType.COUNT,
          }
        : {
            ...column,
            aggregateType: AggregateFuncType.COUNT,
          };
    this.select(normalized);
    return this;
  }

  public min(column: AliasColumn | string) {
    const normalized: SelectedColumn =
      typeof column === 'string'
        ? {
            name: column,
            aggregateType: AggregateFuncType.MIN,
          }
        : {
            ...column,
            aggregateType: AggregateFuncType.MIN,
          };
    this.select(normalized);
    return this;
  }

  public max(column: AliasColumn | string) {
    const normalized: SelectedColumn =
      typeof column === 'string'
        ? {
            name: column,
            aggregateType: AggregateFuncType.MAX,
          }
        : {
            ...column,
            aggregateType: AggregateFuncType.MAX,
          };
    this.select(normalized);
    return this;
  }
  public avg(column: AliasColumn | string) {
    const normalized: SelectedColumn =
      typeof column === 'string'
        ? {
            name: column,
            aggregateType: AggregateFuncType.AVG,
          }
        : {
            ...column,
            aggregateType: AggregateFuncType.AVG,
          };
    this.select(normalized);
    return this;
  }
  public sum(column: AliasColumn | string) {
    const normalized: SelectedColumn =
      typeof column === 'string'
        ? {
            name: column,
            aggregateType: AggregateFuncType.SUM,
          }
        : {
            ...column,
            aggregateType: AggregateFuncType.SUM,
          };
    this.select(normalized);
    return this;
  }
  // Join clause methods
  public innerJoin(
    builder: AliasDataQueryBuilder,
    joinCallback: JoinClauseCallback
  ) {
    this.recordJoin({
      command: JoinCommandType.INNER_JOIN,
      builder,
      joinCallback,
    });
    return this;
  }

  public leftJoin(
    builder: AliasDataQueryBuilder,
    joinCallback: JoinClauseCallback
  ) {
    this.recordJoin({
      command: JoinCommandType.LEFT_JOIN,
      builder,
      joinCallback,
    });
    return this;
  }

  public rightJoin(
    builder: AliasDataQueryBuilder,
    joinCallback: JoinClauseCallback
  ) {
    this.recordJoin({
      command: JoinCommandType.RIGHT_JOIN,
      builder,
      joinCallback,
    });
    return this;
  }
  public fullJoin(
    builder: AliasDataQueryBuilder,
    joinCallback: JoinClauseCallback
  ) {
    this.recordJoin({
      command: JoinCommandType.FULL_JOIN,
      builder,
      joinCallback,
    });
    return this;
  }

  // Where clause methods
  public where(
    column: string,
    operator: string,
    value: string | number | boolean | IDataQueryBuilder
  ) {
    if (!isOfComparisonOperator(operator))
      throw new Error(`'There is no ${operator}  operator.`);

    this.recordWhere({
      command: null,
      data: {
        column,
        operator,
        value,
      } as WherePredicateInput,
    });
    return this;
  }
  public whereNot(
    column: string,
    operator: string,
    value: string | number | boolean | IDataQueryBuilder
  ) {
    this.recordWhere({ command: LogicalOperator.NOT });
    return this.where(column, operator, value);
  }

  public whereWrapped(builderCallback: BuilderClauseCallback) {
    const wrappedBuilder = new DataQueryBuilder({
      statement: '',
      dataSource: this.dataSource,
    });
    builderCallback(wrappedBuilder);
    this.recordWhere({
      command: WherePredicate.WRAPPED,
      data: wrappedBuilder.operations.where,
    });
    return this;
  }
  public whereNotWrapped(builderCallback: BuilderClauseCallback) {
    this.recordWhere({ command: LogicalOperator.NOT });
    return this.whereWrapped(builderCallback);
  }
  public whereBetween(column: string, min: number, max: number) {
    this.recordWhere({
      command: ComparisonPredicate.BETWEEN,
      data: { column, min, max } as BetweenPredicateInput,
    });
    return this;
  }

  public whereNotBetween(column: string, min: number, max: number) {
    this.recordWhere({ command: LogicalOperator.NOT });
    return this.whereBetween(column, min, max);
  }
  public whereIn(
    column: string,
    values: string[] | number[] | IDataQueryBuilder
  ) {
    this.recordWhere({
      command: ComparisonPredicate.IN,
      data: { column, values: values } as WhereInPredicateInput,
    });
    return this;
  }
  public whereNotIn(
    column: string,
    values: string[] | number[] | IDataQueryBuilder
  ) {
    this.recordWhere({ command: LogicalOperator.NOT });
    return this.whereIn(column, values);
  }

  public whereNull(column: string) {
    this.recordWhere({
      command: ComparisonPredicate.IS_NULL,
      data: { column } as NullPredicateInput,
    });
    return this;
  }
  public whereNotNull(column: string) {
    this.recordWhere({ command: LogicalOperator.NOT });
    return this.whereNull(column);
  }
  public whereLike(column: string, searchValue: string) {
    this.recordWhere({
      command: WherePredicate.LIKE,
      data: { column, searchValue } as WhereLikePredicateInput,
    });
    return this;
  }
  public whereExists(subQueryBuilder: AliasDataQueryBuilder) {
    this.recordWhere({
      command: ComparisonPredicate.EXISTS,
      data: subQueryBuilder,
    });
    return this;
  }
  public whereNotExists(subQueryBuilder: AliasDataQueryBuilder) {
    this.recordWhere({ command: LogicalOperator.NOT });
    return this.whereExists(subQueryBuilder);
  }

  // and
  public andWhere(
    column: string,
    operator: string,
    value: string | number | boolean | IDataQueryBuilder
  ) {
    this.recordWhere({ command: LogicalOperator.AND });
    return this.where(column, operator, value);
  }
  public andWhereNot(
    column: string,
    operator: string,
    value: string | number | boolean | IDataQueryBuilder
  ) {
    this.recordWhere({ command: LogicalOperator.AND });
    return this.whereNot(column, operator, value);
  }
  public andWhereWrapped(builderCallback: BuilderClauseCallback) {
    this.recordWhere({ command: LogicalOperator.AND });
    return this.whereWrapped(builderCallback);
  }
  public andWhereNotWrapped(builderCallback: BuilderClauseCallback) {
    this.recordWhere({ command: LogicalOperator.AND });
    return this.whereNotWrapped(builderCallback);
  }
  public andWhereBetween(column: string, min: number, max: number) {
    this.recordWhere({ command: LogicalOperator.AND });
    return this.whereBetween(column, min, max);
  }
  public andWhereNotBetween(column: string, min: number, max: number) {
    this.recordWhere({ command: LogicalOperator.AND });
    return this.whereNotBetween(column, min, max);
  }
  public andWhereIn(
    column: string,
    values: string[] | number[] | IDataQueryBuilder
  ) {
    this.recordWhere({ command: LogicalOperator.AND });
    return this.whereIn(column, values);
  }
  public andWhereNotIn(
    column: string,
    values: string[] | number[] | IDataQueryBuilder
  ) {
    this.recordWhere({ command: LogicalOperator.AND });
    return this.whereNotIn(column, values);
  }
  public andWhereNull(column: string) {
    this.recordWhere({ command: LogicalOperator.AND });
    return this.whereNull(column);
  }
  public andWhereNotNull(column: string) {
    this.recordWhere({ command: LogicalOperator.AND });
    return this.whereNotNull(column);
  }
  public andWhereLike(column: string, searchValue: string) {
    this.recordWhere({ command: LogicalOperator.AND });
    return this.whereLike(column, searchValue);
  }
  public andWhereExists(subQueryBuilder: AliasDataQueryBuilder) {
    this.recordWhere({ command: LogicalOperator.AND });
    return this.whereExists(subQueryBuilder);
  }
  public andWhereNotExists(subQueryBuilder: AliasDataQueryBuilder) {
    this.recordWhere({ command: LogicalOperator.AND });
    return this.whereNotExists(subQueryBuilder);
  }

  // or
  public orWhere(
    column: string,
    operator: string,
    value: string | number | boolean | IDataQueryBuilder
  ) {
    this.recordWhere({ command: LogicalOperator.OR });
    return this.where(column, operator, value);
  }
  public orWhereNot(
    column: string,
    operator: string,
    value: string | number | boolean | IDataQueryBuilder
  ) {
    this.recordWhere({ command: LogicalOperator.OR });
    return this.whereNot(column, operator, value);
  }
  public orWhereWrapped(builderCallback: BuilderClauseCallback) {
    this.recordWhere({ command: LogicalOperator.OR });
    return this.whereWrapped(builderCallback);
  }
  public orWhereNotWrapped(builderCallback: BuilderClauseCallback) {
    this.recordWhere({ command: LogicalOperator.OR });
    return this.whereNotWrapped(builderCallback);
  }
  public orWhereBetween(column: string, min: number, max: number) {
    this.recordWhere({ command: LogicalOperator.OR });
    return this.whereBetween(column, min, max);
  }
  public orWhereNotBetween(column: string, min: number, max: number) {
    this.recordWhere({ command: LogicalOperator.OR });
    return this.whereNotBetween(column, min, max);
  }
  public orWhereIn(
    column: string,
    values: string[] | number[] | IDataQueryBuilder
  ) {
    this.recordWhere({ command: LogicalOperator.OR });
    return this.whereIn(column, values);
  }
  public orWhereNotIn(
    column: string,
    values: string[] | number[] | IDataQueryBuilder
  ) {
    this.recordWhere({ command: LogicalOperator.OR });
    return this.whereNotIn(column, values);
  }
  public orWhereNull(column: string) {
    this.recordWhere({ command: LogicalOperator.OR });
    return this.whereNull(column);
  }
  public orWhereNotNull(column: string) {
    this.recordWhere({ command: LogicalOperator.OR });
    return this.whereNotNull(column);
  }
  public orWhereLike(column: string, searchValue: string) {
    this.recordWhere({ command: LogicalOperator.OR });
    return this.whereLike(column, searchValue);
  }
  public orWhereExists(subQueryBuilder: AliasDataQueryBuilder) {
    this.recordWhere({ command: LogicalOperator.OR });
    return this.whereExists(subQueryBuilder);
  }
  public orWhereNotExists(subQueryBuilder: AliasDataQueryBuilder) {
    this.recordWhere({ command: LogicalOperator.OR });
    return this.whereNotExists(subQueryBuilder);
  }

  // Group by clause method
  public groupBy(...columns: string[]) {
    this.operations.groupBy = this.operations.groupBy.concat(columns);
    return this;
  }

  public having(
    column: SelectedColumn | string,
    operator: string,
    value: string | number | boolean | IDataQueryBuilder
  ) {
    const normalized = typeof column === 'string' ? { name: column } : column;
    if (!isOfComparisonOperator(operator))
      throw new Error(`'There is no ${operator}  operator.`);

    this.recordHaving({
      command: null,
      data: {
        column: normalized,
        operator,
        value,
      } as HavingOperatorInput,
    });
    return this;
  }

  public havingIn(
    column: SelectedColumn | string,
    values: number[] | string[]
  ) {
    const normalized = typeof column === 'string' ? { name: column } : column;
    this.recordHaving({
      command: ComparisonPredicate.IN,
      data: {
        column: normalized,
        values,
      } as HavingInPredicateInput,
    });
    return this;
  }

  public havingNotIn(
    column: SelectedColumn | string,
    values: number[] | string[]
  ) {
    this.recordHaving({ command: LogicalOperator.NOT });
    return this.havingIn(column, values);
  }

  public havingBetween(
    column: SelectedColumn | string,
    min: number,
    max: number
  ) {
    const normalized = typeof column === 'string' ? { name: column } : column;
    this.recordHaving({
      command: ComparisonPredicate.BETWEEN,
      data: {
        column: normalized,
        min,
        max,
      } as HavingBetweenPredicateInput,
    });
    return this;
  }

  public havingNotBetween(
    column: SelectedColumn | string,
    min: number,
    max: number
  ) {
    this.recordHaving({ command: LogicalOperator.NOT });
    return this.havingBetween(column, min, max);
  }

  public havingNull(column: string) {
    this.recordHaving({
      command: ComparisonPredicate.IS_NULL,
      data: { column } as NullPredicateInput,
    });
    return this;
  }
  public havingNotNull(column: string) {
    this.recordHaving({ command: LogicalOperator.NOT });
    return this.havingNull(column);
  }
  public havingExists(subQueryBuilder: AliasDataQueryBuilder) {
    this.recordHaving({
      command: ComparisonPredicate.EXISTS,
      data: subQueryBuilder,
    });
    return this;
  }
  public havingNotExists(subQueryBuilder: AliasDataQueryBuilder) {
    this.recordHaving({ command: LogicalOperator.NOT });
    return this.havingExists(subQueryBuilder);
  }

  // And Having clause
  public andHaving(
    column: SelectedColumn | string,
    operator: string,
    value: string | number | boolean | IDataQueryBuilder
  ) {
    this.recordHaving({ command: LogicalOperator.AND });
    return this.having(column, operator, value);
  }
  public andHavingIn(
    column: SelectedColumn | string,
    values: number[] | string[]
  ) {
    this.recordHaving({ command: LogicalOperator.AND });
    return this.havingIn(column, values);
  }
  public andHavingNotIn(
    column: SelectedColumn | string,
    values: number[] | string[]
  ) {
    this.recordHaving({ command: LogicalOperator.AND });
    return this.havingNotIn(column, values);
  }
  public andHavingBetween(
    column: SelectedColumn | string,
    min: number,
    max: number
  ) {
    this.recordHaving({ command: LogicalOperator.AND });
    return this.havingBetween(column, min, max);
  }
  public andHavingNotBetween(
    column: SelectedColumn | string,
    min: number,
    max: number
  ) {
    this.recordHaving({ command: LogicalOperator.AND });
    return this.havingNotBetween(column, min, max);
  }
  public andHavingNull(column: string) {
    this.recordHaving({ command: LogicalOperator.AND });
    return this.havingNull(column);
  }
  public andHavingNotNull(column: string) {
    this.recordHaving({ command: LogicalOperator.AND });
    return this.havingNotNull(column);
  }
  public andHavingExists(subQueryBuilder: AliasDataQueryBuilder) {
    this.recordHaving({ command: LogicalOperator.AND });
    return this.havingExists(subQueryBuilder);
  }
  public andHavingNotExists(subQueryBuilder: AliasDataQueryBuilder) {
    this.recordHaving({ command: LogicalOperator.AND });
    return this.havingNotExists(subQueryBuilder);
  }
  // Or Having clause
  public orHaving(
    column: SelectedColumn | string,
    operator: string,
    value: string | number | boolean | IDataQueryBuilder
  ) {
    this.recordHaving({ command: LogicalOperator.OR });
    return this.having(column, operator, value);
  }
  public orHavingIn(
    column: SelectedColumn | string,
    values: number[] | string[]
  ) {
    this.recordHaving({ command: LogicalOperator.OR });
    return this.havingIn(column, values);
  }
  public orHavingNotIn(
    column: SelectedColumn | string,
    values: number[] | string[]
  ) {
    this.recordHaving({ command: LogicalOperator.OR });
    return this.havingNotIn(column, values);
  }
  public orHavingBetween(
    column: SelectedColumn | string,
    min: number,
    max: number
  ) {
    this.recordHaving({ command: LogicalOperator.OR });
    return this.havingBetween(column, min, max);
  }
  public orHavingNotBetween(
    column: SelectedColumn | string,
    min: number,
    max: number
  ) {
    this.recordHaving({ command: LogicalOperator.OR });
    return this.havingNotBetween(column, min, max);
  }
  public orHavingNull(column: string) {
    this.recordHaving({ command: LogicalOperator.OR });
    return this.havingNull(column);
  }
  public orHavingNotNull(column: string) {
    this.recordHaving({ command: LogicalOperator.OR });
    return this.havingNotNull(column);
  }
  public orHavingExists(subQueryBuilder: AliasDataQueryBuilder) {
    this.recordHaving({ command: LogicalOperator.OR });
    return this.havingExists(subQueryBuilder);
  }
  public orHavingNotExists(subQueryBuilder: AliasDataQueryBuilder) {
    this.recordHaving({ command: LogicalOperator.OR });
    return this.havingNotExists(subQueryBuilder);
  }
  // Order by clause method
  public orderBy(column: string, direction: Direction = Direction.ASC) {
    this.operations.orderBy.push({
      column,
      direction,
    });
    return this;
  }

  // Limit and Offset clause
  public limit(size: number) {
    this.operations.limit = size;
    return this;
  }

  public offset(move: number) {
    this.operations.offset = move;
    return this;
  }

  public take(size: number, move: number) {
    this.operations.limit = size;
    this.operations.offset = move;
    return this;
  }

  public clone() {
    return new DataQueryBuilder({
      statement: this.statement,
      dataSource: this.dataSource,
      operations: this.operations,
    });
  }

  // setup pagination if would like to do paginate
  public paginate(pagination: Pagination) {
    this.pagination = pagination;
  }

  public async value() {
    // call data source
    const result = await this.dataSource.execute({
      statement: this.statement,
      operations: this.operations,
      pagination: this.pagination,
    });

    // Reset operations
    await this.resetOperations();

    return result;
  }

  // record Select-On related operations
  private recordSelect({
    command,
    columns,
  }: {
    command: SelectCommandType;
    columns: Array<SelectedColumn | string>;
  }) {
    const normalized = columns.map((column) => {
      if (typeof column === 'string') return { name: column };
      return column as SelectedColumn;
    });
    if (this.operations.select === null) {
      this.operations.select = {
        command,
        columns: normalized,
      };
      return;
    }
    // distinct will replace previous select command,
    // even builder call select method in later of the distinct method, it not influence distinct.
    if (command === SelectCommandType.SELECT_DISTINCT)
      this.operations.select.command = command;

    this.operations.select.columns =
      this.operations.select.columns.concat(normalized);
  }

  private recordJoin({
    command,
    builder,
    joinCallback,
  }: {
    command: JoinCommandType;
    builder: AliasDataQueryBuilder;
    joinCallback: JoinClauseCallback;
  }) {
    const joinOnClause = new JoinOnClause();
    joinCallback(joinOnClause);
    this.operations.join.push({
      command,
      onClauses: joinOnClause.operations,
      joinBuilder: builder,
    });
  }

  private recordWhere({
    command,
    data,
  }: {
    command: WherePredicate | ComparisonPredicate | LogicalOperator | null;
    data?:
      | WherePredicateInput
      | Array<WhereClauseOperation>
      | AliasDataQueryBuilder;
  }) {
    this.operations.where.push({
      command,
      data,
    });
  }

  private recordHaving({
    command,
    data,
  }: {
    command: ComparisonPredicate | LogicalOperator | null;
    data?: HavingPredicateInput | AliasDataQueryBuilder;
  }) {
    this.operations.having.push({
      command,
      data,
    });
  }

  private resetOperations() {
    this.operations.select = null;
    this.operations.where = [];
    this.operations.join = [];
    this.operations.groupBy = [];
    this.operations.having = [];
    this.operations.orderBy = [];
    this.operations.limit = null;
    this.operations.offset = null;
  }
}
