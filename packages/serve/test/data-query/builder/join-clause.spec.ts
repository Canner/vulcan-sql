import {
  BetweenPredicateInput,
  ComparisonPredicate,
  DataQueryBuilder,
  IDataQueryBuilder,
  IJoinOnClause,
  InPredicateInput,
  JoinClauseOperation,
  JoinCommandType,
  JoinOnClauseOperation,
  JoinOnOperatorInput,
  LogicalOperator,
  NullPredicateInput,
} from '@vulcan/serve/data-query';

describe('Test data query builder > join clause', () => {
  const joinBuilder = new DataQueryBuilder({
    statement: 'select * from products',
  });
  const alias = 'products';
  const joinOnClauseOperations: Array<JoinOnClauseOperation> = [
    {
      command: null,
      data: {
        leftColumn: 'orders.product_id',
        operator: '=',
        rightColumn: 'products.id',
      } as JoinOnOperatorInput,
    },
    { command: LogicalOperator.AND },
    {
      command: ComparisonPredicate.BETWEEN,
      data: {
        column: 'orders.price',
        min: 1000,
        max: 2000,
      } as BetweenPredicateInput,
    },
    { command: LogicalOperator.AND },
    { command: LogicalOperator.NOT },
    {
      command: ComparisonPredicate.IN,
      data: {
        column: 'orders.payment',
        values: ['cash', 'e-pay'],
      } as InPredicateInput,
    },
    { command: LogicalOperator.AND },
    { command: LogicalOperator.NOT },
    {
      command: ComparisonPredicate.IS_NULL,
      data: {
        column: 'phone',
      } as NullPredicateInput,
    },
  ];

  it.each([
    {
      command: JoinCommandType.INNER_JOIN,
    },
    {
      command: JoinCommandType.LEFT_JOIN,
    },
    {
      command: JoinCommandType.RIGHT_JOIN,
    },
    {
      command: JoinCommandType.FULL_JOIN,
    },
  ])(
    'Should record successfully when call $command',
    async ({ command }: { command: JoinCommandType }) => {
      // Arrange
      const statement = 'select * from orders';

      const expected: JoinClauseOperation = {
        command,
        onClauses: joinOnClauseOperations,
        joinBuilder: {
          builder: joinBuilder,
          as: alias,
        },
      };

      const joinOnInput = joinOnClauseOperations[0].data as JoinOnOperatorInput;
      const joinOnBetweenInput = joinOnClauseOperations[2]
        .data as BetweenPredicateInput;
      const joinOnNotInInput = joinOnClauseOperations[5]
        .data as InPredicateInput;
      const joinOnNotNullInput = joinOnClauseOperations[8]
        .data as NullPredicateInput;
      const joinParameters = {
        joinBuilder: { builder: joinBuilder, as: alias },
        clause: (clause: IJoinOnClause) => {
          clause
            .on(
              joinOnInput.leftColumn,
              joinOnInput.operator,
              joinOnInput.rightColumn
            )
            .andOnBetween(
              joinOnBetweenInput.column,
              joinOnBetweenInput.min,
              joinOnBetweenInput.max
            )
            .andOnNotIn(joinOnNotInInput.column, joinOnNotInInput.values)
            .andOnNotNull(joinOnNotNullInput.column);
        },
      };

      // Act
      const queryBuilder = new DataQueryBuilder({
        statement,
      });
      const joinCallMapper = {
        [JoinCommandType.INNER_JOIN]: (builder: IDataQueryBuilder) =>
          builder.innerJoin(joinParameters.joinBuilder, joinParameters.clause),
        [JoinCommandType.LEFT_JOIN]: (builder: IDataQueryBuilder) =>
          builder.leftJoin(joinParameters.joinBuilder, joinParameters.clause),
        [JoinCommandType.RIGHT_JOIN]: (builder: IDataQueryBuilder) =>
          builder.rightJoin(joinParameters.joinBuilder, joinParameters.clause),
        [JoinCommandType.FULL_JOIN]: (builder: IDataQueryBuilder) =>
          builder.fullJoin(joinParameters.joinBuilder, joinParameters.clause),
      };
      joinCallMapper[command](queryBuilder);
      // Assert
      expect(queryBuilder.operations.join[0]).toEqual(expected);
    }
  );
});
