import { GroupByClauseOperations, DataQueryBuilder } from '@data-query/.';
import faker from '@faker-js/faker';

describe('Test data query builder > group by clause', () => {
  it.each([
    {
      columns: [faker.database.column()],
    },
    {
      columns: [faker.database.column(), faker.database.column()],
    },
  ])(
    'Should record successfully when call group by with $columns',
    async ({ columns }) => {
      // Arrange
      const expected: GroupByClauseOperations = columns;

      // Act
      let builder = new DataQueryBuilder({
        statement: 'select * from orders',
      });
      columns.map((column) => {
        builder = builder.groupBy(column);
      });

      // Assert
      expect(builder.operations.groupBy).toEqual(expected);
    }
  );

  it.each([
    [faker.database.column(), faker.database.column(), faker.database.column()],
    [faker.database.column(), faker.database.column(), faker.database.column()],
  ])(
    'Should record successfully when call group by with %p, %p, %p',
    async (first: string, second: string, third: string) => {
      // Arrange
      const expected: GroupByClauseOperations = [first, second, third];

      // Act
      const builder = new DataQueryBuilder({
        statement: 'select * from orders',
      });
      builder.groupBy(first, second, third);

      // Assert
      expect(builder.operations.groupBy).toEqual(expected);
    }
  );
});
