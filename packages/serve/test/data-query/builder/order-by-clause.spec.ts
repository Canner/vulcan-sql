import * as sinon from 'ts-sinon';
import faker from '@faker-js/faker';
import {
  DataQueryBuilder,
  Direction,
  OrderByClauseOperation,
} from '@vulcan/serve/data-query';
import { IDataSource } from '@vulcan/serve/data-source';

describe('Test data query builder > order by clause', () => {
  let stubDataSource: sinon.StubbedInstance<IDataSource>;

  beforeEach(() => {
    stubDataSource = sinon.stubInterface<IDataSource>();
  });
  it.each([
    {
      column: faker.database.column(),
      direction: Direction.ASC,
    },
    {
      column: faker.database.column(),
      direction: Direction.DESC,
    },
  ])(
    'Should record successfully when call order by with $column, $direction',
    async ({ column, direction }) => {
      // Arrange
      const expected: Array<OrderByClauseOperation> = [
        {
          column,
          direction,
        },
      ];

      // Act
      const builder = new DataQueryBuilder({
        statement: 'select * from orders',
        dataSource: stubDataSource,
      });
      builder.orderBy(column, direction);

      // Assert
      expect(JSON.stringify(builder.operations.orderBy)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    [
      {
        column: faker.database.column(),
        direction: Direction.DESC,
      },
      {
        column: faker.database.column(),
        direction: Direction.ASC,
      },
    ],
    [
      {
        column: faker.database.column(),
        direction: Direction.ASC,
      },
      {
        column: faker.database.column(),
        direction: Direction.DESC,
      },
    ],
  ])(
    'Should record successfully when call orderBy(%p).orderBy(%p)',
    async (first, second) => {
      // Arrange
      const expected: Array<OrderByClauseOperation> = [first, second];

      // Act
      const builder = new DataQueryBuilder({
        statement: 'select * from orders',
        dataSource: stubDataSource,
      });
      builder
        .orderBy(first.column, first.direction)
        .orderBy(second.column, second.direction);

      // Assert
      expect(JSON.stringify(builder.operations.orderBy)).toEqual(
        JSON.stringify(expected)
      );
    }
  );
});
