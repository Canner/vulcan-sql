import * as sinon from 'ts-sinon';
import faker from '@faker-js/faker';
import {
  DataQueryBuilder,
  WhereClauseOperation,
  LogicalOperator,
  ComparisonPredicate,
  WherePredicate,
  AliasDataQueryBuilder,
  IDataQueryBuilder,
} from '@vulcan-sql/core/data-query';
import { DataSource } from '@vulcan-sql/core/models';

describe('Test data query builder > where clause', () => {
  let stubDataSource: sinon.StubbedInstance<DataSource>;

  beforeEach(() => {
    stubDataSource = sinon.stubInterface<DataSource>();
  });

  it.each([
    {
      where: {
        column: faker.database.column(),
        operator: '!=',
        value: faker.random.word(),
      },
      and: {
        column: faker.database.column(),
        operator: '=',
        value: new DataQueryBuilder({
          statement: 'select * from products',
          dataSource: sinon.stubInterface<DataSource>(),
        }),
      },
      andNot: {
        column: faker.database.column(),
        operator: '>',
        value: faker.datatype.number({ max: 100 }),
      },
    },
    {
      where: {
        column: faker.database.column(),
        operator: '=',
        value: new DataQueryBuilder({
          statement: 'select avg(*) from users',
          dataSource: sinon.stubInterface<DataSource>(),
        }),
      },
      and: {
        column: faker.database.column(),
        operator: '>=',
        value: faker.datatype.number({ precision: 0.01 }),
      },
      andNot: {
        column: faker.database.column(),
        operator: '<=',
        value: faker.datatype.number({ max: 100 }),
      },
    },
  ])(
    'Should record successfully when call where(...).andWhere(...).andNotWhere(...)',
    async ({ where, and, andNot }) => {
      // Arrange
      const expected: Array<WhereClauseOperation> = [
        { command: null, data: where },
        { command: LogicalOperator.AND },
        { command: null, data: and },
        { command: LogicalOperator.AND },
        { command: LogicalOperator.NOT },
        { command: null, data: andNot },
      ];
      // Act
      const builder = new DataQueryBuilder({
        statement: 'select * from orders',
        dataSource: stubDataSource,
      });
      if (where) builder.where(where.column, where.operator, where.value);
      if (and) builder.andWhere(and.column, and.operator, and.value);
      if (andNot)
        builder.andWhereNot(andNot.column, andNot.operator, andNot.value);
      // Asset
      expect(JSON.stringify(builder.operations.where)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      whereNot: {
        column: faker.database.column(),
        operator: '!=',
        value: faker.random.word(),
      },
      or: {
        column: faker.database.column(),
        operator: '=',
        value: new DataQueryBuilder({
          statement: 'select * from products',
          dataSource: sinon.stubInterface<DataSource>(),
        }),
      },
      orNot: {
        column: faker.database.column(),
        operator: '>',
        value: faker.datatype.number({ max: 100 }),
      },
    },
    {
      whereNot: {
        column: faker.database.column(),
        operator: '=',
        value: new DataQueryBuilder({
          statement: 'select avg(*) from users',
          dataSource: sinon.stubInterface<DataSource>(),
        }),
      },
      or: {
        column: faker.database.column(),
        operator: '>=',
        value: faker.datatype.number({ precision: 0.01 }),
      },
      orNot: {
        column: faker.database.column(),
        operator: '<=',
        value: faker.datatype.number({ max: 100 }),
      },
    },
  ])(
    'Should record successfully when call whereNot(...).orWhere(...).orWhereNot(...)',
    async ({ whereNot, or, orNot }) => {
      // Arrange
      const expected: Array<WhereClauseOperation> = [
        { command: LogicalOperator.NOT },
        { command: null, data: whereNot },
        { command: LogicalOperator.OR },
        { command: null, data: or },
        { command: LogicalOperator.OR },
        { command: LogicalOperator.NOT },
        { command: null, data: orNot },
      ];
      // Act
      const builder = new DataQueryBuilder({
        statement: 'select * from orders',
        dataSource: stubDataSource,
      });
      if (whereNot)
        builder.whereNot(whereNot.column, whereNot.operator, whereNot.value);
      if (or) builder.orWhere(or.column, or.operator, or.value);
      if (orNot) builder.orWhereNot(orNot.column, orNot.operator, orNot.value);
      // Asset
      expect(JSON.stringify(builder.operations.where)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      whereIn: {
        column: faker.database.column(),
        values: faker.helpers.arrayElements([
          faker.datatype.number({ max: 100 }),
          faker.datatype.number({ max: 100 }),
          faker.datatype.number({ max: 100 }),
        ]),
      },
      and: {
        column: faker.database.column(),
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
      whereIn: {
        column: faker.database.column(),
        values: new DataQueryBuilder({
          statement: 'select type from products',
          dataSource: sinon.stubInterface<DataSource>(),
        }),
      },
      and: {
        column: faker.database.column(),
        values: faker.helpers.arrayElements([
          faker.random.word(),
          faker.random.word(),
          faker.random.word(),
        ]),
      },
      andNot: {
        column: faker.database.column(),
        values: new DataQueryBuilder({
          statement: 'select age from users',
          dataSource: sinon.stubInterface<DataSource>(),
        }),
      },
    },
  ])(
    'Should record successfully when call whereIn(...).andWhereIn(...).andWhereNotIn(...)',
    async ({ whereIn, and, andNot }) => {
      // Arrange
      const expected: Array<WhereClauseOperation> = [
        { command: ComparisonPredicate.IN, data: whereIn },
        { command: LogicalOperator.AND },
        { command: ComparisonPredicate.IN, data: and },
        { command: LogicalOperator.AND },
        { command: LogicalOperator.NOT },
        { command: ComparisonPredicate.IN, data: andNot },
      ];
      // Act
      const builder = new DataQueryBuilder({
        statement: 'select * from orders',
        dataSource: stubDataSource,
      });
      if (whereIn) builder.whereIn(whereIn.column, whereIn.values);
      if (and) builder.andWhereIn(and.column, and.values);
      if (andNot) builder.andWhereNotIn(andNot.column, andNot.values);
      // Asset
      expect(JSON.stringify(builder.operations.where)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      notIn: {
        column: faker.database.column(),
        values: faker.helpers.arrayElements([
          faker.datatype.number({ max: 100 }),
          faker.datatype.number({ max: 100 }),
          faker.datatype.number({ max: 100 }),
        ]),
      },
      or: {
        column: faker.database.column(),
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
        values: new DataQueryBuilder({
          statement: 'select type from products',
          dataSource: sinon.stubInterface<DataSource>(),
        }),
      },
      or: {
        column: faker.database.column(),
        values: faker.helpers.arrayElements([
          faker.random.word(),
          faker.random.word(),
          faker.random.word(),
        ]),
      },
      orNot: {
        column: faker.database.column(),
        values: new DataQueryBuilder({
          statement: 'select age from users',
          dataSource: sinon.stubInterface<DataSource>(),
        }),
      },
    },
  ])(
    'Should record successfully when call whereNotIn(...).orWhereIn(...).orWhereNotIn(...)',
    async ({ notIn, or, orNot }) => {
      // Arrange
      const expected: Array<WhereClauseOperation> = [
        { command: LogicalOperator.NOT },
        { command: ComparisonPredicate.IN, data: notIn },
        { command: LogicalOperator.OR },
        { command: ComparisonPredicate.IN, data: or },
        { command: LogicalOperator.OR },
        { command: LogicalOperator.NOT },
        { command: ComparisonPredicate.IN, data: orNot },
      ];
      // Act
      const builder = new DataQueryBuilder({
        statement: 'select * from orders',
        dataSource: stubDataSource,
      });
      if (notIn) builder.whereNotIn(notIn.column, notIn.values);
      if (or) builder.orWhereIn(or.column, or.values);
      if (orNot) builder.orWhereNotIn(orNot.column, orNot.values);
      // Asset
      expect(JSON.stringify(builder.operations.where)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      between: {
        column: faker.database.column(),
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
  ])(
    'Should record successfully when call whereBetween(...).andWhereBetween(...).andWhereNotBetween(...)',
    async ({ between, and, andNot }) => {
      // Arrange
      const expected: Array<WhereClauseOperation> = [
        { command: ComparisonPredicate.BETWEEN, data: between },
        { command: LogicalOperator.AND },
        { command: ComparisonPredicate.BETWEEN, data: and },
        { command: LogicalOperator.AND },
        { command: LogicalOperator.NOT },
        { command: ComparisonPredicate.BETWEEN, data: andNot },
      ];
      // Act
      const builder = new DataQueryBuilder({
        statement: 'select * from orders',
        dataSource: stubDataSource,
      });
      if (between)
        builder.whereBetween(between.column, between.min, between.max);
      if (and) builder.andWhereBetween(and.column, and.min, and.max);
      if (andNot)
        builder.andWhereNotBetween(andNot.column, andNot.min, andNot.max);
      // Asset
      expect(JSON.stringify(builder.operations.where)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      notBetween: {
        column: faker.database.column(),
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
  ])(
    'Should record successfully when call whereNotBetween(...).orWhereBetween(...).orWhereNotBetween(...)',
    async ({ notBetween, or, orNot }) => {
      // Arrange
      const expected: Array<WhereClauseOperation> = [
        { command: LogicalOperator.NOT },
        { command: ComparisonPredicate.BETWEEN, data: notBetween },
        { command: LogicalOperator.OR },
        { command: ComparisonPredicate.BETWEEN, data: or },
        { command: LogicalOperator.OR },
        { command: LogicalOperator.NOT },
        { command: ComparisonPredicate.BETWEEN, data: orNot },
      ];
      // Act
      const builder = new DataQueryBuilder({
        statement: 'select * from orders',
        dataSource: stubDataSource,
      });
      if (notBetween)
        builder.whereNotBetween(
          notBetween.column,
          notBetween.min,
          notBetween.max
        );
      if (or) builder.orWhereBetween(or.column, or.min, or.max);
      if (orNot) builder.orWhereNotBetween(orNot.column, orNot.min, orNot.max);
      // Asset
      expect(JSON.stringify(builder.operations.where)).toEqual(
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
    'Should record successfully when call whereNull(...).andWhereNull(...).andWhereNotNull(...)',
    async ({ isNull, and, andNot }) => {
      // Arrange
      const expected: Array<WhereClauseOperation> = [
        { command: ComparisonPredicate.IS_NULL, data: isNull },
        { command: LogicalOperator.AND },
        { command: ComparisonPredicate.IS_NULL, data: and },
        { command: LogicalOperator.AND },
        { command: LogicalOperator.NOT },
        { command: ComparisonPredicate.IS_NULL, data: andNot },
      ];
      // Act
      const builder = new DataQueryBuilder({
        statement: 'select * from orders',
        dataSource: stubDataSource,
      });
      if (isNull) builder.whereNull(isNull.column);
      if (and) builder.andWhereNull(and.column);
      if (andNot) builder.andWhereNotNull(andNot.column);
      // Asset
      expect(JSON.stringify(builder.operations.where)).toEqual(
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
    'Should record successfully when call whereNotNull(...).orWhereNull(...).orWhereNotNull(...)',
    async ({ notNull, or, orNot }) => {
      // Arrange
      const expected: Array<WhereClauseOperation> = [
        { command: LogicalOperator.NOT },
        { command: ComparisonPredicate.IS_NULL, data: notNull },
        { command: LogicalOperator.OR },
        { command: ComparisonPredicate.IS_NULL, data: or },
        { command: LogicalOperator.OR },
        { command: LogicalOperator.NOT },
        { command: ComparisonPredicate.IS_NULL, data: orNot },
      ];
      // Act
      const builder = new DataQueryBuilder({
        statement: 'select * from orders',
        dataSource: stubDataSource,
      });
      if (notNull) builder.whereNotNull(notNull.column);
      if (or) builder.orWhereNull(or.column);
      if (orNot) builder.orWhereNotNull(orNot.column);
      // Asset
      expect(JSON.stringify(builder.operations.where)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      like: {
        column: faker.database.column(),
        searchValue: faker.random.word() + '%',
      },
      and: {
        column: faker.database.column(),
        searchValue: '%' + faker.random.word() + '%',
      },
    },
    {
      like: {
        column: faker.database.column(),
        searchValue: '%' + faker.random.word() + '%',
      },
      and: {
        column: faker.database.column(),
        searchValue: '%' + faker.random.word(),
      },
    },
  ])(
    'Should record successfully when call whereLike(...).andWhereLike(...)',
    async ({ like, and }) => {
      // Arrange
      const expected: Array<WhereClauseOperation> = [
        { command: WherePredicate.LIKE, data: like },
        { command: LogicalOperator.AND },
        { command: WherePredicate.LIKE, data: and },
      ];
      // Act
      const builder = new DataQueryBuilder({
        statement: 'select * from orders',
        dataSource: stubDataSource,
      });
      if (like) builder.whereLike(like.column, like.searchValue);
      if (and) builder.andWhereLike(and.column, and.searchValue);

      // Asset
      expect(JSON.stringify(builder.operations.where)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      like: {
        column: faker.database.column(),
        searchValue: faker.random.word() + '%',
      },
      or: {
        column: faker.database.column(),
        searchValue: '%' + faker.random.word() + '%',
      },
    },
    {
      like: {
        column: faker.database.column(),
        searchValue: '%' + faker.random.word() + '%',
      },
      or: {
        column: faker.database.column(),
        searchValue: '%' + faker.random.word(),
      },
    },
  ])(
    'Should record successfully when call whereLike(...).orWhereLike(...)',
    async ({ like, or }) => {
      // Arrange
      const expected: Array<WhereClauseOperation> = [
        { command: WherePredicate.LIKE, data: like },
        { command: LogicalOperator.OR },
        { command: WherePredicate.LIKE, data: or },
      ];
      // Act
      const builder = new DataQueryBuilder({
        statement: 'select * from orders',
        dataSource: stubDataSource,
      });
      if (like) builder.whereLike(like.column, like.searchValue);
      if (or) builder.orWhereLike(or.column, or.searchValue);

      // Asset
      expect(JSON.stringify(builder.operations.where)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      exists: {
        builder: new DataQueryBuilder({
          statement: 'select * from products',
          dataSource: sinon.stubInterface<DataSource>(),
        }),
        as: 'products',
      } as AliasDataQueryBuilder,
      and: {
        builder: new DataQueryBuilder({
          statement: 'select * from users',
          dataSource: sinon.stubInterface<DataSource>(),
        }),
        as: 'users',
      } as AliasDataQueryBuilder,
      andNot: {
        builder: new DataQueryBuilder({
          statement: 'select * from orders',
          dataSource: sinon.stubInterface<DataSource>(),
        }),
        as: 'orders',
      } as AliasDataQueryBuilder,
    },
    {
      exists: {
        builder: new DataQueryBuilder({
          statement: 'select * from products',
          dataSource: sinon.stubInterface<DataSource>(),
        }),
        as: 'products',
      } as AliasDataQueryBuilder,

      and: {
        builder: new DataQueryBuilder({
          statement: 'select * from users',
          dataSource: sinon.stubInterface<DataSource>(),
        }),
        as: 'users',
      } as AliasDataQueryBuilder,

      andNot: {
        builder: new DataQueryBuilder({
          statement: 'select * from orders',
          dataSource: sinon.stubInterface<DataSource>(),
        }),
        as: 'orders',
      } as AliasDataQueryBuilder,
    },
  ])(
    'Should record successfully when call whereExists(...).andWhereExists(...).andWhereNotExists(...)',
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
      const builder = new DataQueryBuilder({
        statement: 'select * from orders',
        dataSource: stubDataSource,
      });
      if (exists) builder.whereExists(exists);
      if (and) builder.andWhereExists(and);
      if (andNot) builder.andWhereNotExists(andNot);
      // Asset
      expect(JSON.stringify(builder.operations.where)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      notExists: {
        builder: new DataQueryBuilder({
          statement: 'select * from products',
          dataSource: sinon.stubInterface<DataSource>(),
        }),
        as: 'products',
      } as AliasDataQueryBuilder,
      or: {
        builder: new DataQueryBuilder({
          statement: 'select * from users',
          dataSource: sinon.stubInterface<DataSource>(),
        }),
        as: 'users',
      } as AliasDataQueryBuilder,
      orNot: {
        builder: new DataQueryBuilder({
          statement: 'select * from orders',
          dataSource: sinon.stubInterface<DataSource>(),
        }),
        as: 'orders',
      } as AliasDataQueryBuilder,
    },
    {
      notExists: {
        builder: new DataQueryBuilder({
          statement: 'select * from products',
          dataSource: sinon.stubInterface<DataSource>(),
        }),
        as: 'products',
      } as AliasDataQueryBuilder,
      or: {
        builder: new DataQueryBuilder({
          statement: 'select * from users',
          dataSource: sinon.stubInterface<DataSource>(),
        }),
        as: 'users',
      } as AliasDataQueryBuilder,
      orNot: {
        builder: new DataQueryBuilder({
          statement: 'select * from orders',
          dataSource: sinon.stubInterface<DataSource>(),
        }),
        as: 'orders',
      } as AliasDataQueryBuilder,
    },
  ])(
    'Should record successfully when call whereNotExists(...).orWhereExists(...).orWhereNotExists(...)',
    async ({ notExists, or, orNot }) => {
      // Arrange
      const expected: Array<WhereClauseOperation> = [
        { command: LogicalOperator.NOT },
        { command: ComparisonPredicate.EXISTS, data: notExists },
        { command: LogicalOperator.OR },
        { command: ComparisonPredicate.EXISTS, data: or },
        { command: LogicalOperator.OR },
        { command: LogicalOperator.NOT },
        { command: ComparisonPredicate.EXISTS, data: orNot },
      ];
      // Act
      const builder = new DataQueryBuilder({
        statement: 'select * from orders',
        dataSource: stubDataSource,
      });
      if (notExists) builder.whereNotExists(notExists);
      if (or) builder.orWhereExists(or);
      if (orNot) builder.orWhereNotExists(orNot);
      // Asset
      expect(JSON.stringify(builder.operations.where)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      wrapped: (builder: IDataQueryBuilder) => {
        builder.where('items', '>', 5).andWhereNull('expired');
      },
      and: (builder: IDataQueryBuilder) => {
        builder
          .whereIn('type', ['3C', 'cloth', 'book'])
          .andWhereNotNull('expired');
      },
      andNot: (builder: IDataQueryBuilder) => {
        builder
          .whereBetween('price', 1000, 3000)
          .andWhereLike('comments', '%refund%');
      },
    },
    {
      wrapped: (builder: IDataQueryBuilder) => {
        builder
          .whereNot(
            'tags',
            '>',
            new DataQueryBuilder({
              statement: 'select count(*) from tags',
              dataSource: sinon.stubInterface<DataSource>(),
            })
          )
          .orWhereNotBetween('price', 1, 1000);
      },
      and: (builder: IDataQueryBuilder) => {
        builder
          .whereIn('tags', ['disney', 'marvel', 'jump'])
          .andWhereNotBetween('price', 1, 1000);
      },
      andNot: (builder: IDataQueryBuilder) => {
        builder
          .whereNotIn('type', ['3C', 'cloth', 'book'])
          .orWhereLike('comments', '%face to face%');
      },
    },
  ])(
    'Should record successfully when call whereWrapped(...).andWhereWrapped(...).andWhereNotWrapped(...)',
    async ({ wrapped, and, andNot }) => {
      // Arrange
      const wrappedBuilder = new DataQueryBuilder({
        statement: '',
        dataSource: stubDataSource,
      });
      wrapped(wrappedBuilder);
      const andBuilder = new DataQueryBuilder({
        statement: '',
        dataSource: stubDataSource,
      });
      and(andBuilder);
      const andNotBuilder = new DataQueryBuilder({
        statement: '',
        dataSource: stubDataSource,
      });
      andNot(andNotBuilder);

      const expected: Array<WhereClauseOperation> = [
        {
          command: WherePredicate.WRAPPED,
          data: wrappedBuilder.operations.where,
        },
        { command: LogicalOperator.AND },
        { command: WherePredicate.WRAPPED, data: andBuilder.operations.where },
        { command: LogicalOperator.AND },
        { command: LogicalOperator.NOT },
        {
          command: WherePredicate.WRAPPED,
          data: andNotBuilder.operations.where,
        },
      ];
      // Act
      const builder = new DataQueryBuilder({
        statement: 'select * from orders',
        dataSource: stubDataSource,
      });
      if (wrapped) builder.whereWrapped(wrapped);
      if (and) builder.andWhereWrapped(and);
      if (andNot) builder.andWhereNotWrapped(andNot);
      // Asset
      expect(JSON.stringify(builder.operations.where)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      notWrapped: (builder: IDataQueryBuilder) => {
        builder.where('items', '>', 5).andWhereNull('expired');
      },
      or: (builder: IDataQueryBuilder) => {
        builder
          .whereIn('type', ['3C', 'cloth', 'book'])
          .andWhereNotNull('expired');
      },
      orNot: (builder: IDataQueryBuilder) => {
        builder
          .whereBetween('price', 1000, 3000)
          .andWhereLike('comments', '%refund%');
      },
    },
    {
      notWrapped: (builder: IDataQueryBuilder) => {
        builder
          .whereNot(
            'tags',
            '>',
            new DataQueryBuilder({
              statement: 'select count(*) from tags',
              dataSource: sinon.stubInterface<DataSource>(),
            })
          )
          .orWhereNotBetween('price', 1, 1000);
      },
      or: (builder: IDataQueryBuilder) => {
        builder
          .whereIn('tags', ['disney', 'marvel', 'jump'])
          .andWhereNotBetween('price', 1, 1000);
      },
      orNot: (builder: IDataQueryBuilder) => {
        builder
          .whereNotIn('type', ['3C', 'cloth', 'book'])
          .orWhereLike('comments', '%face to face%');
      },
    },
  ])(
    'Should record successfully when call whereNotWrapped(...).orWhereWrapped(...).orWhereNotWrapped(...)',
    async ({ notWrapped, or, orNot }) => {
      // Arrange
      const notWrappedBuilder = new DataQueryBuilder({
        statement: '',
        dataSource: stubDataSource,
      });
      notWrapped(notWrappedBuilder);
      const orBuilder = new DataQueryBuilder({
        statement: '',
        dataSource: stubDataSource,
      });
      or(orBuilder);
      const orNotBuilder = new DataQueryBuilder({
        statement: '',
        dataSource: stubDataSource,
      });
      orNot(orNotBuilder);

      const expected: Array<WhereClauseOperation> = [
        { command: LogicalOperator.NOT },
        {
          command: WherePredicate.WRAPPED,
          data: notWrappedBuilder.operations.where,
        },
        { command: LogicalOperator.OR },
        { command: WherePredicate.WRAPPED, data: orBuilder.operations.where },
        { command: LogicalOperator.OR },
        { command: LogicalOperator.NOT },
        {
          command: WherePredicate.WRAPPED,
          data: orNotBuilder.operations.where,
        },
      ];
      // Act
      const builder = new DataQueryBuilder({
        statement: 'select * from orders',
        dataSource: stubDataSource,
      });
      if (notWrapped) builder.whereNotWrapped(notWrapped);
      if (or) builder.orWhereWrapped(or);
      if (orNot) builder.orWhereNotWrapped(orNot);
      // Asset
      expect(JSON.stringify(builder.operations.where)).toEqual(
        JSON.stringify(expected)
      );
    }
  );
});
