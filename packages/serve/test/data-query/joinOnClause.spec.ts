import faker from '@faker-js/faker';
import {
  JoinOnClause,
  JoinOnClauseOperation,
  JoinOnOperatorInput,
  LogicalOperator,
  BetweenPredicateInput,
  ComparisonPredicate,
  InPredicateInput,
} from '@vulcan/serve/data-query';

describe('Test join on clause > on operations', () => {
  it.each([
    [
      `table1.${faker.database.column()}`,
      '=',
      `table2.${faker.database.column()}`,
    ],
    [
      `table1.${faker.database.column()}`,
      '>=',
      `table2.${faker.database.column()}`,
    ],
    [
      `table1.${faker.database.column()}`,
      '>',
      `table2.${faker.database.column()}`,
    ],
    [
      `table1.${faker.database.column()}`,
      '<=',
      `table2.${faker.database.column()}`,
    ],
    [
      `table1.${faker.database.column()}`,
      '<',
      `table2.${faker.database.column()}`,
    ],
    [
      `table1.${faker.database.column()}`,
      '!=',
      `table2.${faker.database.column()}`,
    ],
  ])(
    'Should record successfully when join on %p %p %p',
    async (leftColumn: string, operator: string, rightColumn: string) => {
      // Arrange
      const expected: Array<JoinOnClauseOperation> = [
        {
          command: null,
          data: {
            leftColumn,
            operator,
            rightColumn,
          } as JoinOnOperatorInput,
        },
      ];
      // Act
      const clause = new JoinOnClause();
      clause.on(leftColumn, operator, rightColumn);
      // Asset
      expect(clause.operations).toEqual(expect.arrayContaining(expected));
    }
  );

  it.each([
    [
      `table1.${faker.database.column()}`,
      '<>',
      `table2.${faker.database.column()}`,
    ],
    [
      `table1.${faker.database.column()}`,
      '!',
      `table2.${faker.database.column()}`,
    ],
  ])(
    'Should throw error when join on %p %p %p',
    async (leftColumn: string, operator: string, rightColumn: string) => {
      // Act
      const clause = new JoinOnClause();
      const callJoinOn = () => clause.on(leftColumn, operator, rightColumn);
      // Asset
      expect(callJoinOn).toThrow(Error);
    }
  );
  it('Should record successfully when call join on(...).andOn(...).OrOn(...)', async () => {
    // Arrange
    const fakeInputParams = [
      {
        leftColumn: `table1.${faker.database.column()}`,
        operator: '=',
        rightColumn: `table2.${faker.database.column()}`,
      },
      {
        leftColumn: `table3.${faker.database.column()}`,
        operator: '>',
        rightColumn: `table4.${faker.database.column()}`,
      },
      {
        leftColumn: `table1.${faker.database.column()}`,
        operator: '!=',
        rightColumn: `table2.${faker.database.column()}`,
      },
    ];
    const expected: Array<JoinOnClauseOperation> = fakeInputParams.map(
      (params) => {
        return {
          command: null,
          data: params as JoinOnOperatorInput,
        };
      }
    );
    // Act
    const clause = new JoinOnClause();
    clause
      .on(
        fakeInputParams[0].leftColumn,
        fakeInputParams[0].operator,
        fakeInputParams[0].rightColumn
      )
      .andOn(
        fakeInputParams[1].leftColumn,
        fakeInputParams[1].operator,
        fakeInputParams[1].rightColumn
      )
      .orOn(
        fakeInputParams[2].leftColumn,
        fakeInputParams[2].operator,
        fakeInputParams[2].rightColumn
      );
    // Asset
    expect(clause.operations).toEqual(expect.arrayContaining(expected));
  });
});

describe('Test join on clause > between operations', () => {
  const fakeInputParams = [
    {
      column: `${faker.database.column()}`,
      min: 14,
      max: 30,
    },
    {
      column: `${faker.database.column()}`,
      min: -15,
      max: 20,
    },
    {
      column: `${faker.database.column()}`,
      min: 1,
      max: 100,
    },
  ];
  it('Should throw error when call join onBetween with max value smaller than min value', async () => {
    // Arrange
    const fakeInputParam = {
      column: `${faker.database.column()}`,
      min: 30,
      max: 1,
    };
    // Act
    const clause = new JoinOnClause();
    const joinOnBetween = () =>
      clause.onBetween(
        fakeInputParam.column,
        fakeInputParam.min,
        fakeInputParam.max
      );

    // Asset
    expect(joinOnBetween).toThrow(Error);
  });
  it('Should record successfully when call join onBetween(...).andBetween(...).OrBetween(...)', async () => {
    // Arrange
    const expected: Array<JoinOnClauseOperation> = fakeInputParams.map(
      (params) => {
        return {
          command: ComparisonPredicate.BETWEEN,
          data: params as BetweenPredicateInput,
        };
      }
    );
    // Act
    const clause = new JoinOnClause();
    clause
      .onBetween(
        fakeInputParams[0].column,
        fakeInputParams[0].min,
        fakeInputParams[0].max
      )
      .andOnBetween(
        fakeInputParams[1].column,
        fakeInputParams[1].min,
        fakeInputParams[1].max
      )
      .orOnBetween(
        fakeInputParams[2].column,
        fakeInputParams[2].min,
        fakeInputParams[2].max
      );
    // Asset
    expect(clause.operations).toEqual(expect.arrayContaining(expected));
  });

  it('Should record successfully when call join onNotBetween(...).andNotBetween(...).OrNotBetween(...)', async () => {
    // Arrange
    const expected: Array<JoinOnClauseOperation> = fakeInputParams.reduce(
      (operations, currentParams) => {
        operations.push({ command: LogicalOperator.NOT });
        operations.push({
          command: ComparisonPredicate.BETWEEN,
          data: currentParams,
        });
        return operations;
      },
      [] as Array<JoinOnClauseOperation>
    );
    // Act
    const clause = new JoinOnClause();
    clause
      .onNotBetween(
        fakeInputParams[0].column,
        fakeInputParams[0].min,
        fakeInputParams[0].max
      )
      .andOnNotBetween(
        fakeInputParams[1].column,
        fakeInputParams[1].min,
        fakeInputParams[1].max
      )
      .orOnNotBetween(
        fakeInputParams[2].column,
        fakeInputParams[2].min,
        fakeInputParams[2].max
      );
    // Asset
    expect(clause.operations).toEqual(expect.arrayContaining(expected));
  });
});

describe('Test join on clause > in operations', () => {
  const fakeInputParams = [
    {
      column: `${faker.database.column()}`,
      values: faker.helpers.arrayElements(['US', 'TW', 'JP', 'CN'], 3),
    },
    {
      column: `${faker.database.column()}`,
      values: faker.helpers.arrayElements(['US', 'TW', 'JP', 'CN'], 3),
    },
    {
      column: `${faker.database.column()}`,
      values: faker.helpers.arrayElements([1, 50, 30, 100, 120], 3),
    },
  ];
  it('Should record successfully when call join onIn(...).andIn(...).OrIn(...)', async () => {
    // Arrange
    const expected: Array<JoinOnClauseOperation> = fakeInputParams.map(
      (params) => {
        return {
          command: ComparisonPredicate.IN,
          data: params as InPredicateInput,
        };
      }
    );
    // Act
    const clause = new JoinOnClause();
    clause
      .onIn(fakeInputParams[0].column, fakeInputParams[0].values)
      .andOnIn(fakeInputParams[1].column, fakeInputParams[1].values)
      .orOnIn(fakeInputParams[2].column, fakeInputParams[2].values);
    // Asset
    expect(clause.operations).toEqual(expect.arrayContaining(expected));
  });

  it('Should record successfully when call join onNotIn(...).andNotIn(...).OrNotIn(...)', async () => {
    // Arrange

    const expected: Array<JoinOnClauseOperation> = fakeInputParams.reduce(
      (operations, currentParams) => {
        operations.push({ command: LogicalOperator.NOT });
        operations.push({
          command: ComparisonPredicate.IN,
          data: currentParams,
        });
        return operations;
      },
      [] as Array<JoinOnClauseOperation>
    );
    // Act
    const clause = new JoinOnClause();
    clause
      .onNotIn(fakeInputParams[0].column, fakeInputParams[0].values)
      .andOnNotIn(fakeInputParams[1].column, fakeInputParams[1].values)
      .orOnNotIn(fakeInputParams[2].column, fakeInputParams[2].values);
    // Asset
    expect(clause.operations).toEqual(expect.arrayContaining(expected));
  });
});

describe('Test join on clause > null operations', () => {
  const fakeInputParams = [
    {
      column: `${faker.database.column()}`,
    },
    {
      column: `${faker.database.column()}`,
    },
    {
      column: `${faker.database.column()}`,
    },
  ];
  it('Should record successfully when call join onNull(...).andNull(...).OrNull(...)', async () => {
    // Arrange
    const expected: Array<JoinOnClauseOperation> = fakeInputParams.map(
      (params) => {
        return {
          command: ComparisonPredicate.IS_NULL,
          data: params as BetweenPredicateInput,
        };
      }
    );
    // Act
    const clause = new JoinOnClause();
    clause
      .onNull(fakeInputParams[0].column)
      .andOnNull(fakeInputParams[1].column)
      .orOnNull(fakeInputParams[2].column);
    // Asset
    expect(clause.operations).toEqual(expect.arrayContaining(expected));
  });

  it('Should record successfully when call join onNotBetween(...).andNotBetween(...).OrNotBetween(...)', async () => {
    // Arrange
    const expected: Array<JoinOnClauseOperation> = fakeInputParams.reduce(
      (operations, currentParams) => {
        operations.push({ command: LogicalOperator.NOT });
        operations.push({
          command: ComparisonPredicate.IS_NULL,
          data: currentParams,
        });
        return operations;
      },
      [] as Array<JoinOnClauseOperation>
    );
    // Act
    const clause = new JoinOnClause();
    clause
      .onNotNull(fakeInputParams[0].column)
      .andOnNotNull(fakeInputParams[1].column)
      .orOnNotNull(fakeInputParams[2].column);
    // Asset
    expect(clause.operations).toEqual(expect.arrayContaining(expected));
  });
});
