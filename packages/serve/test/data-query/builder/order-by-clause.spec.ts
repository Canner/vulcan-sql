import {
  DataQueryBuilder,
  Direction,
  OrderByClauseOperation,
} from '@vulcan/serve/data-query';
import faker from '@faker-js/faker';

describe('Test data query builder > order by clause', () => {
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
      });
      builder.orderBy(column, direction);

      // Assert
      expect(builder.operations.orderBy).toEqual(expected);
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
      });
      builder
        .orderBy(first.column, first.direction)
        .orderBy(second.column, second.direction);

      // Assert
      expect(builder.operations.orderBy).toEqual(expected);
    }
  );
});
