import * as sinon from 'ts-sinon';
import faker from '@faker-js/faker';
import {
  DataQueryBuilder,
  WhereClauseOperation,
  LogicalOperator,
  ComparisonPredicate,
  AliasDataQueryBuilder,
  SelectedColumn,
  AggregateFuncType,
  HavingClauseOperation,
  HavingPredicateInput,
} from '@vulcan-sql/core/data-query';
import { DataSource, BindParameters } from '@vulcan-sql/core/models';

const normalized = (column: string | SelectedColumn) => {
  if (typeof column === 'string') return { name: column };
  return column as SelectedColumn;
};

const createStub = () => {
  return {
    dataSource: sinon.stubInterface<DataSource>(),
    bindParams: sinon.stubInterface<BindParameters>(),
  };
};

const createStubBuilder = ({ statement }: { statement: string }) =>
  new DataQueryBuilder({
    statement: statement,
    dataSource: createStub().dataSource,
    bindParams: createStub().bindParams,
    profileName: '',
  });

describe('Test data query builder > having clause', () => {
  it.each([
    {
      having: {
        column: faker.database.column(),
        operator: '!=',
        value: faker.datatype.boolean(),
      },
      and: {
        column: faker.database.column(),
        operator: '=',
        value: createStubBuilder({
          statement: 'select * from products',
        }),
      },
    },
    {
      having: {
        column: {
          name: faker.database.column(),
          as: faker.random.word(),
          aggregateType: AggregateFuncType.AVG,
        } as SelectedColumn,
        operator: '=',
        value: createStubBuilder({
          statement: 'select avg(*) from users',
        }),
      },
      and: {
        column: faker.database.column(),
        operator: '>=',
        value: faker.random.word(),
      },
    },
    {
      having: {
        column: faker.database.column(),
        operator: '=',
        value: faker.random.word(),
      },
      and: {
        column: {
          name: faker.database.column(),
          as: faker.random.word(),
        } as SelectedColumn,
        operator: '>=',
        value: faker.datatype.number({ max: 1000 }),
      },
    },
  ])(
    'Should record successfully when call having(...).andHaving(...)',
    async ({ having, and }) => {
      // Arrange

      const expected: Array<HavingClauseOperation> = [
        {
          command: null,
          data: {
            column: normalized(having.column),
            operator: having.operator,
            value: having.value,
          } as HavingPredicateInput,
        },
        { command: LogicalOperator.AND },
        {
          command: null,
          data: {
            column: normalized(and.column),
            operator: and.operator,
            value: and.value,
          } as HavingPredicateInput,
        },
      ];
      // Act
      const builder = createStubBuilder({
        statement: 'select * from orders',
      });
      if (having) builder.having(having.column, having.operator, having.value);
      if (and) builder.andHaving(and.column, and.operator, and.value);

      // Asset
      expect(JSON.stringify(builder.operations.having)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      having: {
        column: faker.database.column(),
        operator: '!=',
        value: faker.datatype.boolean(),
      },
      or: {
        column: faker.database.column(),
        operator: '=',
        value: createStubBuilder({
          statement: 'select * from products',
        }),
      },
    },
    {
      having: {
        column: {
          name: faker.database.column(),
          as: faker.random.word(),
          aggregateType: AggregateFuncType.AVG,
        } as SelectedColumn,
        operator: '=',
        value: createStubBuilder({
          statement: 'select avg(*) from users',
        }),
      },
      or: {
        column: faker.database.column(),
        operator: '>=',
        value: faker.random.word(),
      },
    },
    {
      having: {
        column: faker.database.column(),
        operator: '=',
        value: faker.random.word(),
      },
      or: {
        column: {
          name: faker.database.column(),
          as: faker.random.word(),
        } as SelectedColumn,
        operator: '>=',
        value: faker.datatype.number({ max: 1000 }),
      },
    },
  ])(
    'Should record successfully when call having(...).orHaving(...)',
    async ({ having, or }) => {
      // Arrange

      const expected: Array<HavingClauseOperation> = [
        {
          command: null,
          data: {
            column: normalized(having.column),
            operator: having.operator,
            value: having.value,
          } as HavingPredicateInput,
        },
        { command: LogicalOperator.OR },
        {
          command: null,
          data: {
            column: normalized(or.column),
            operator: or.operator,
            value: or.value,
          } as HavingPredicateInput,
        },
      ];
      // Act
      const builder = createStubBuilder({
        statement: 'select * from orders',
      });
      if (having) builder.having(having.column, having.operator, having.value);
      if (or) builder.orHaving(or.column, or.operator, or.value);

      // Asset
      expect(JSON.stringify(builder.operations.having)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      havingIn: {
        column: {
          name: faker.database.column(),
          as: faker.random.word(),
        } as SelectedColumn,
        values: faker.helpers.arrayElements([
          faker.datatype.number({ max: 100 }),
          faker.datatype.number({ max: 100 }),
          faker.datatype.number({ max: 100 }),
        ]),
      },
      and: {
        column: {
          name: faker.database.column(),
          as: faker.random.word(),
          aggregateType: AggregateFuncType.SUM,
        } as SelectedColumn,
        values: faker.helpers.arrayElements([
          faker.random.word(),
          faker.random.word(),
          faker.random.word(),
        ]),
      },
      andNot: {
        column: faker.database.column(),
        values: faker.helpers.arrayElements([
          faker.datatype.number({ precision: 0.01 }),
          faker.datatype.number({ precision: 0.01 }),
          faker.datatype.number({ precision: 0.01 }),
        ]),
      },
    },
    {
      havingIn: {
        column: faker.database.column(),
        values: faker.helpers.arrayElements([
          faker.random.word(),
          faker.random.word(),
          faker.random.word(),
        ]),
      },
      and: {
        column: {
          name: faker.database.column(),
          as: faker.random.word(),
        } as SelectedColumn,
        values: faker.helpers.arrayElements([
          faker.random.word(),
          faker.random.word(),
          faker.random.word(),
        ]),
      },
      andNot: {
        column: {
          name: faker.database.column(),
          as: faker.random.word(),
          aggregateType: AggregateFuncType.AVG,
        } as SelectedColumn,
        values: faker.helpers.arrayElements([
          faker.datatype.number({ max: 100 }),
          faker.datatype.number({ max: 100 }),
          faker.datatype.number({ max: 100 }),
        ]),
      },
    },
  ])(
    'Should record successfully when call havingIn(...).andHavingIn(...).andHavingNotIn(...)',
    async ({ havingIn, and, andNot }) => {
      // Arrange
      const expected: Array<HavingClauseOperation> = [
        {
          command: ComparisonPredicate.IN,
          data: {
            column: normalized(havingIn.column),
            values: havingIn.values,
          } as HavingPredicateInput,
        },
        { command: LogicalOperator.AND },
        {
          command: ComparisonPredicate.IN,
          data: {
            column: normalized(and.column),
            values: and.values,
          } as HavingPredicateInput,
        },
        { command: LogicalOperator.AND },
        { command: LogicalOperator.NOT },
        {
          command: ComparisonPredicate.IN,
          data: {
            column: normalized(andNot.column),
            values: andNot.values,
          } as HavingPredicateInput,
        },
      ];
      // Act
      const builder = createStubBuilder({
        statement: 'select * from orders',
      });
      if (havingIn) builder.havingIn(havingIn.column, havingIn.values);
      if (and) builder.andHavingIn(and.column, and.values);
      if (andNot) builder.andHavingNotIn(andNot.column, andNot.values);
      // Asset
      expect(JSON.stringify(builder.operations.having)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      notIn: {
        column: {
          name: faker.database.column(),
          as: faker.random.word(),
        } as SelectedColumn,
        values: faker.helpers.arrayElements([
          faker.datatype.number({ max: 100 }),
          faker.datatype.number({ max: 100 }),
          faker.datatype.number({ max: 100 }),
        ]),
      },
      or: {
        column: {
          name: faker.database.column(),
          as: faker.random.word(),
          aggregateType: AggregateFuncType.SUM,
        } as SelectedColumn,
        values: faker.helpers.arrayElements([
          faker.random.word(),
          faker.random.word(),
          faker.random.word(),
        ]),
      },
      orNot: {
        column: faker.database.column(),
        values: faker.helpers.arrayElements([
          faker.datatype.number({ precision: 0.01 }),
          faker.datatype.number({ precision: 0.01 }),
          faker.datatype.number({ precision: 0.01 }),
        ]),
      },
    },
    {
      notIn: {
        column: faker.database.column(),
        values: faker.helpers.arrayElements([
          faker.random.word(),
          faker.random.word(),
          faker.random.word(),
        ]),
      },
      or: {
        column: {
          name: faker.database.column(),
          as: faker.random.word(),
        } as SelectedColumn,
        values: faker.helpers.arrayElements([
          faker.random.word(),
          faker.random.word(),
          faker.random.word(),
        ]),
      },
      orNot: {
        column: {
          name: faker.database.column(),
          as: faker.random.word(),
          aggregateType: AggregateFuncType.AVG,
        } as SelectedColumn,
        values: faker.helpers.arrayElements([
          faker.datatype.number({ max: 100 }),
          faker.datatype.number({ max: 100 }),
          faker.datatype.number({ max: 100 }),
        ]),
      },
    },
  ])(
    'Should record successfully when call havingNotIn(...).orHavingIn(...).orHavingNotIn(...)',
    async ({ notIn, or, orNot }) => {
      // Arrange
      const expected: Array<HavingClauseOperation> = [
        { command: LogicalOperator.NOT },
        {
          command: ComparisonPredicate.IN,
          data: {
            column: normalized(notIn.column),
            values: notIn.values,
          } as HavingPredicateInput,
        },
        { command: LogicalOperator.OR },
        {
          command: ComparisonPredicate.IN,
          data: {
            column: normalized(or.column),
            values: or.values,
          } as HavingPredicateInput,
        },
        { command: LogicalOperator.OR },
        { command: LogicalOperator.NOT },
        {
          command: ComparisonPredicate.IN,
          data: {
            column: normalized(orNot.column),
            values: orNot.values,
          } as HavingPredicateInput,
        },
      ];
      // Act
      const builder = createStubBuilder({
        statement: 'select * from orders',
      });
      if (notIn) builder.havingNotIn(notIn.column, notIn.values);
      if (or) builder.orHavingIn(or.column, or.values);
      if (orNot) builder.orHavingNotIn(orNot.column, orNot.values);
      // Asset
      expect(JSON.stringify(builder.operations.having)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      between: {
        column: {
          name: faker.database.column(),
          as: faker.random.word(),
          aggregateType: AggregateFuncType.MIN,
        } as SelectedColumn,
        min: faker.datatype.number({ min: 0, max: 10 }),
        max: faker.datatype.number({ min: 10, max: 100 }),
      },
      and: {
        column: faker.database.column(),
        min: faker.datatype.number({ min: 0, max: 10 }),
        max: faker.datatype.number({ min: 10, max: 100 }),
      },
      andNot: {
        column: faker.database.column(),
        min: faker.datatype.number({ min: 0, max: 10 }),
        max: faker.datatype.number({ min: 10, max: 100 }),
      },
    },
    {
      between: {
        column: faker.database.column(),
        min: faker.datatype.number({ min: 0, max: 10 }),
        max: faker.datatype.number({ min: 10, max: 100 }),
      },
      and: {
        column: {
          name: faker.database.column(),
          as: faker.random.word(),
          aggregateType: AggregateFuncType.SUM,
        } as SelectedColumn,
        min: faker.datatype.number({ min: 0, max: 10 }),
        max: faker.datatype.number({ min: 10, max: 100 }),
      },
      andNot: {
        column: {
          name: faker.database.column(),
          as: faker.random.word(),
          aggregateType: AggregateFuncType.AVG,
        } as SelectedColumn,
        min: faker.datatype.number({ min: 0, max: 10 }),
        max: faker.datatype.number({ min: 10, max: 100 }),
      },
    },
  ])(
    'Should record successfully when call havingBetween(...).andHavingBetween(...).andHavingNotBetween(...)',
    async ({ between, and, andNot }) => {
      // Arrange
      const expected: Array<HavingClauseOperation> = [
        {
          command: ComparisonPredicate.BETWEEN,
          data: {
            column: normalized(between.column),
            min: between.min,
            max: between.max,
          } as HavingPredicateInput,
        },
        { command: LogicalOperator.AND },
        {
          command: ComparisonPredicate.BETWEEN,
          data: {
            column: normalized(and.column),
            min: and.min,
            max: and.max,
          } as HavingPredicateInput,
        },
        { command: LogicalOperator.AND },
        { command: LogicalOperator.NOT },
        {
          command: ComparisonPredicate.BETWEEN,
          data: {
            column: normalized(andNot.column),
            min: andNot.min,
            max: andNot.max,
          } as HavingPredicateInput,
        },
      ];
      // Act
      const builder = createStubBuilder({
        statement: 'select * from orders',
      });
      if (between)
        builder.havingBetween(between.column, between.min, between.max);
      if (and) builder.andHavingBetween(and.column, and.min, and.max);
      if (andNot)
        builder.andHavingNotBetween(andNot.column, andNot.min, andNot.max);
      // Asset
      expect(JSON.stringify(builder.operations.having)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      notBetween: {
        column: {
          name: faker.database.column(),
          as: faker.random.word(),
          aggregateType: AggregateFuncType.MIN,
        } as SelectedColumn,
        min: faker.datatype.number({ min: 0, max: 10 }),
        max: faker.datatype.number({ min: 10, max: 100 }),
      },
      or: {
        column: faker.database.column(),
        min: faker.datatype.number({ min: 0, max: 10 }),
        max: faker.datatype.number({ min: 10, max: 100 }),
      },
      orNot: {
        column: faker.database.column(),
        min: faker.datatype.number({ min: 0, max: 10 }),
        max: faker.datatype.number({ min: 10, max: 100 }),
      },
    },
    {
      notBetween: {
        column: faker.database.column(),
        min: faker.datatype.number({ min: 0, max: 10 }),
        max: faker.datatype.number({ min: 10, max: 100 }),
      },
      or: {
        column: {
          name: faker.database.column(),
          as: faker.random.word(),
          aggregateType: AggregateFuncType.SUM,
        } as SelectedColumn,
        min: faker.datatype.number({ min: 0, max: 10 }),
        max: faker.datatype.number({ min: 10, max: 100 }),
      },
      orNot: {
        column: {
          name: faker.database.column(),
          as: faker.random.word(),
          aggregateType: AggregateFuncType.AVG,
        } as SelectedColumn,
        min: faker.datatype.number({ min: 0, max: 10 }),
        max: faker.datatype.number({ min: 10, max: 100 }),
      },
    },
  ])(
    'Should record successfully when call havingNotBetween(...).orHavingBetween(...).orHavingNotBetween(...)',
    async ({ notBetween, or, orNot }) => {
      // Arrange
      const expected: Array<HavingClauseOperation> = [
        { command: LogicalOperator.NOT },
        {
          command: ComparisonPredicate.BETWEEN,
          data: {
            column: normalized(notBetween.column),
            min: notBetween.min,
            max: notBetween.max,
          } as HavingPredicateInput,
        },
        { command: LogicalOperator.OR },
        {
          command: ComparisonPredicate.BETWEEN,
          data: {
            column: normalized(or.column),
            min: or.min,
            max: or.max,
          } as HavingPredicateInput,
        },
        { command: LogicalOperator.OR },
        { command: LogicalOperator.NOT },
        {
          command: ComparisonPredicate.BETWEEN,
          data: {
            column: normalized(orNot.column),
            min: orNot.min,
            max: orNot.max,
          } as HavingPredicateInput,
        },
      ];
      // Act
      const builder = createStubBuilder({
        statement: 'select * from orders',
      });
      if (notBetween)
        builder.havingNotBetween(
          notBetween.column,
          notBetween.min,
          notBetween.max
        );
      if (or) builder.orHavingBetween(or.column, or.min, or.max);
      if (orNot) builder.orHavingNotBetween(orNot.column, orNot.min, orNot.max);
      // Asset
      expect(JSON.stringify(builder.operations.having)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      isNull: {
        column: faker.database.column(),
      },
      and: {
        column: faker.database.column(),
      },
      andNot: {
        column: faker.database.column(),
      },
    },
    {
      isNull: {
        column: faker.database.column(),
      },
      and: {
        column: faker.database.column(),
      },
      andNot: {
        column: faker.database.column(),
      },
    },
  ])(
    'Should record successfully when call havingNull(...).andHavingNull(...).andHavingNotNull(...)',
    async ({ isNull, and, andNot }) => {
      // Arrange
      const expected: Array<HavingClauseOperation> = [
        {
          command: ComparisonPredicate.IS_NULL,
          data: {
            column: isNull.column,
          } as HavingPredicateInput,
        },
        { command: LogicalOperator.AND },
        {
          command: ComparisonPredicate.IS_NULL,
          data: {
            column: and.column,
          } as HavingPredicateInput,
        },
        { command: LogicalOperator.AND },
        { command: LogicalOperator.NOT },
        {
          command: ComparisonPredicate.IS_NULL,
          data: {
            column: andNot.column,
          } as HavingPredicateInput,
        },
      ];
      // Act
      const builder = createStubBuilder({
        statement: 'select * from orders',
      });
      if (isNull) builder.havingNull(isNull.column);
      if (and) builder.andHavingNull(and.column);
      if (andNot) builder.andHavingNotNull(andNot.column);
      // Asset
      expect(JSON.stringify(builder.operations.having)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      notNull: {
        column: faker.database.column(),
      },
      or: {
        column: faker.database.column(),
      },
      orNot: {
        column: faker.database.column(),
      },
    },
    {
      notNull: {
        column: faker.database.column(),
      },
      or: {
        column: faker.database.column(),
      },
      orNot: {
        column: faker.database.column(),
      },
    },
  ])(
    'Should record successfully when call havingNotNull(...).orHavingNull(...).orHavingNotNull(...)',
    async ({ notNull, or, orNot }) => {
      // Arrange
      const expected: Array<HavingClauseOperation> = [
        { command: LogicalOperator.NOT },
        {
          command: ComparisonPredicate.IS_NULL,
          data: {
            column: notNull.column,
          } as HavingPredicateInput,
        },
        { command: LogicalOperator.OR },
        {
          command: ComparisonPredicate.IS_NULL,
          data: {
            column: or.column,
          } as HavingPredicateInput,
        },
        { command: LogicalOperator.OR },
        { command: LogicalOperator.NOT },
        {
          command: ComparisonPredicate.IS_NULL,
          data: {
            column: orNot.column,
          } as HavingPredicateInput,
        },
      ];
      // Act
      const builder = createStubBuilder({
        statement: 'select * from orders',
      });
      if (notNull) builder.havingNotNull(notNull.column);
      if (or) builder.orHavingNull(or.column);
      if (orNot) builder.orHavingNotNull(orNot.column);
      // Asset
      expect(JSON.stringify(builder.operations.having)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      exists: {
        builder: createStubBuilder({
          statement: 'select * from products',
        }),
        as: 'products',
      } as AliasDataQueryBuilder,
      and: {
        builder: createStubBuilder({
          statement: 'select * from users',
        }),
        as: 'users',
      } as AliasDataQueryBuilder,
      andNot: {
        builder: createStubBuilder({
          statement: 'select * from orders',
        }),
        as: 'orders',
      } as AliasDataQueryBuilder,
    },
    {
      exists: {
        builder: createStubBuilder({
          statement: 'select * from products',
        }),
        as: 'products',
      } as AliasDataQueryBuilder,
      and: {
        builder: createStubBuilder({
          statement: 'select * from users',
        }),
        as: 'users',
      } as AliasDataQueryBuilder,
      andNot: {
        builder: createStubBuilder({
          statement: 'select * from orders',
        }),
        as: 'orders',
      } as AliasDataQueryBuilder,
    },
  ])(
    'Should record successfully when call havingExists(...).andHavingExists(...).andHavingNotExists(...)',
    async ({ exists, and, andNot }) => {
      // Arrange
      const expected: Array<WhereClauseOperation> = [
        { command: ComparisonPredicate.EXISTS, data: exists },
        { command: LogicalOperator.AND },
        { command: ComparisonPredicate.EXISTS, data: and },
        { command: LogicalOperator.AND },
        { command: LogicalOperator.NOT },
        { command: ComparisonPredicate.EXISTS, data: andNot },
      ];
      // Act
      const builder = createStubBuilder({
        statement: 'select * from orders',
      });
      if (exists) builder.havingExists(exists);
      if (and) builder.andHavingExists(and);
      if (andNot) builder.andHavingNotExists(andNot);
      // Asset
      expect(JSON.stringify(builder.operations.having)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      exists: {
        builder: createStubBuilder({
          statement: 'select * from products',
        }),
        as: 'products',
      } as AliasDataQueryBuilder,
      or: {
        builder: createStubBuilder({
          statement: 'select * from users',
        }),
        as: 'users',
      } as AliasDataQueryBuilder,
      orNot: {
        builder: createStubBuilder({
          statement: 'select * from orders',
        }),
        as: 'orders',
      } as AliasDataQueryBuilder,
    },
    {
      exists: {
        builder: createStubBuilder({
          statement: 'select * from products',
        }),
        as: 'products',
      } as AliasDataQueryBuilder,
      or: {
        builder: createStubBuilder({
          statement: 'select * from users',
        }),
        as: 'users',
      } as AliasDataQueryBuilder,
      orNot: {
        builder: createStubBuilder({
          statement: 'select * from orders',
        }),
        as: 'orders',
      } as AliasDataQueryBuilder,
    },
  ])(
    'Should record successfully when call havingNotExists(...).orHavingExists(...).orHavingExists(...)',
    async ({ exists, or, orNot }) => {
      // Arrange
      const expected: Array<WhereClauseOperation> = [
        { command: LogicalOperator.NOT },
        { command: ComparisonPredicate.EXISTS, data: exists },
        { command: LogicalOperator.OR },
        { command: ComparisonPredicate.EXISTS, data: or },
        { command: LogicalOperator.OR },
        { command: LogicalOperator.NOT },
        { command: ComparisonPredicate.EXISTS, data: orNot },
      ];
      // Act
      const builder = createStubBuilder({
        statement: 'select * from orders',
      });
      if (exists) builder.havingNotExists(exists);
      if (or) builder.orHavingExists(or);
      if (orNot) builder.orHavingNotExists(orNot);
      // Asset
      expect(JSON.stringify(builder.operations.having)).toEqual(
        JSON.stringify(expected)
      );
    }
  );
});
