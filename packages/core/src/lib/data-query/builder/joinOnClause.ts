import { TemplateError } from '../../utils/errors';
import {
  ComparisonPredicate,
  ComparisonOperator,
  LogicalOperator,
  BetweenPredicateInput,
  InPredicateInput,
  NullPredicateInput,
  isOfComparisonOperator,
} from './commonTypes';

export interface JoinOnOperatorInput {
  leftColumn: string;
  operator: ComparisonOperator;
  rightColumn: string;
}

export interface JoinOnClauseOperation {
  // null means using ComparisonOperator
  command: ComparisonPredicate | LogicalOperator | null;
  data?:
    | JoinOnOperatorInput
    | BetweenPredicateInput
    | InPredicateInput
    | NullPredicateInput;
}

export interface IJoinOnClause {
  operations: Array<JoinOnClauseOperation>;
  on(leftColumn: string, operator: string, rightColumn: string): JoinOnClause;
  onBetween(column: string, min: number, max: number): JoinOnClause;
  onNotBetween(column: string, min: number, max: number): JoinOnClause;
  onIn(column: string, values: string[] | number[]): JoinOnClause;
  onNotIn(column: string, values: string[] | number[]): JoinOnClause;
  onNull(column: string): JoinOnClause;
  onNotNull(column: string): JoinOnClause;
  // and
  andOn(
    leftColumn: string,
    operator: string,
    rightColumn: string
  ): JoinOnClause;
  andOnBetween(column: string, min: number, max: number): JoinOnClause;
  andOnNotBetween(column: string, min: number, max: number): JoinOnClause;
  andOnIn(column: string, values: string[] | number[]): JoinOnClause;
  andOnNotIn(column: string, values: string[] | number[]): JoinOnClause;
  andOnNull(column: string): JoinOnClause;
  andOnNotNull(column: string): JoinOnClause;
  // or
  orOn(leftColumn: string, operator: string, rightColumn: string): JoinOnClause;
  orOnBetween(column: string, min: number, max: number): JoinOnClause;
  orOnNotBetween(column: string, min: number, max: number): JoinOnClause;
  orOnIn(column: string, values: string[] | number[]): JoinOnClause;
  orOnNotIn(column: string, values: string[] | number[]): JoinOnClause;
  orOnNull(column: string): JoinOnClause;
  orOnNotNull(column: string): JoinOnClause;
}

export class JoinOnClause implements IJoinOnClause {
  private _operations: Array<JoinOnClauseOperation>;

  constructor() {
    this._operations = [];
  }

  get operations() {
    return this._operations;
  }

  public on(leftColumn: string, operator: string, rightColumn: string) {
    if (!isOfComparisonOperator(operator))
      throw new TemplateError(`'There is no ${operator} operator.`);

    this.recordOn({
      command: null,
      data: { leftColumn, operator, rightColumn },
    });
    return this;
  }

  public onBetween(column: string, min: number, max: number) {
    if (min > max)
      throw new TemplateError(
        `min value ${min} not smaller than max value ${max}.`
      );

    this.recordOn({
      command: ComparisonPredicate.BETWEEN,
      data: { column, min, max },
    });
    return this;
  }
  public onNotBetween(column: string, min: number, max: number) {
    this.recordOn({ command: LogicalOperator.NOT });
    return this.onBetween(column, min, max);
  }

  public onIn(column: string, values: number[] | string[]) {
    this.recordOn({
      command: ComparisonPredicate.IN,
      data: { column, values },
    });
    return this;
  }
  public onNotIn(column: string, values: number[] | string[]) {
    this.recordOn({ command: LogicalOperator.NOT });
    return this.onIn(column, values);
  }

  public onNull(column: string) {
    this.recordOn({
      command: ComparisonPredicate.IS_NULL,
      data: { column },
    });
    return this;
  }
  public onNotNull(column: string) {
    this.recordOn({ command: LogicalOperator.NOT });
    return this.onNull(column);
  }

  // and
  public andOn(leftColumn: string, operator: string, rightColumn: string) {
    this.recordOn({ command: LogicalOperator.AND });
    return this.on(leftColumn, operator, rightColumn);
  }
  public andOnBetween(column: string, min: number, max: number) {
    this.recordOn({ command: LogicalOperator.AND });
    return this.onBetween(column, min, max);
  }
  public andOnNotBetween(column: string, min: number, max: number) {
    this.recordOn({ command: LogicalOperator.AND });
    return this.onNotBetween(column, min, max);
  }
  public andOnIn(column: string, values: number[] | string[]) {
    this.recordOn({ command: LogicalOperator.AND });
    return this.onIn(column, values);
  }
  public andOnNotIn(column: string, values: number[] | string[]) {
    this.recordOn({ command: LogicalOperator.AND });
    return this.onNotIn(column, values);
  }
  public andOnNull(column: string) {
    this.recordOn({ command: LogicalOperator.AND });
    return this.onNull(column);
  }
  public andOnNotNull(column: string) {
    this.recordOn({ command: LogicalOperator.AND });
    return this.onNotNull(column);
  }

  // or
  public orOn(leftColumn: string, operator: string, rightColumn: string) {
    this.recordOn({ command: LogicalOperator.OR });
    return this.on(leftColumn, operator, rightColumn);
  }
  public orOnBetween(column: string, min: number, max: number) {
    this.recordOn({ command: LogicalOperator.OR });
    return this.onBetween(column, min, max);
  }
  public orOnNotBetween(column: string, min: number, max: number) {
    this.recordOn({ command: LogicalOperator.OR });
    return this.onNotBetween(column, min, max);
  }
  public orOnIn(column: string, values: number[] | string[]) {
    this.recordOn({ command: LogicalOperator.OR });
    return this.onIn(column, values);
  }
  public orOnNotIn(column: string, values: number[] | string[]) {
    this.recordOn({ command: LogicalOperator.OR });
    return this.onNotIn(column, values);
  }
  public orOnNull(column: string) {
    this.recordOn({ command: LogicalOperator.OR });
    return this.onNull(column);
  }
  public orOnNotNull(column: string) {
    this.recordOn({ command: LogicalOperator.OR });
    return this.onNotNull(column);
  }

  // record Join-On related operations
  private recordOn(operation: JoinOnClauseOperation) {
    const { command, data } = operation;
    this._operations.push({
      command,
      data,
    });
  }
}
