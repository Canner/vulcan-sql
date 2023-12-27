import * as sinon from 'ts-sinon';
import faker from '@faker-js/faker';
import {
  GroupByClauseOperations,
  DataQueryBuilder,
  Parameterizer,
} from '@vulcan-sql/api-layer/data-query';
import { DataSource } from '@vulcan-sql/api-layer/models';

describe('Test data query builder > group by clause', () => {
  let stubDataSource: sinon.StubbedInstance<DataSource>;
  let stubParameterizer: sinon.StubbedInstance<Parameterizer>;

  beforeEach(() => {
    stubDataSource = sinon.stubInterface<DataSource>();
    stubParameterizer = sinon.stubInterface<Parameterizer>();
  });

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
        dataSource: stubDataSource,
        parameterizer: stubParameterizer,
        profileName: '',
        headers: {},
      });
      columns.map((column) => {
        builder = builder.groupBy(column);
      });

      // Assert
      expect(JSON.stringify(builder.operations.groupBy)).toEqual(
        JSON.stringify(expected)
      );
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
        dataSource: stubDataSource,
        parameterizer: stubParameterizer,
        profileName: '',
        headers: {},
      });
      builder.groupBy(first, second, third);

      // Assert
      expect(JSON.stringify(builder.operations.groupBy)).toEqual(
        JSON.stringify(expected)
      );
    }
  );
});
