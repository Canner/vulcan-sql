import * as sinon from 'ts-sinon';
import faker from '@faker-js/faker';
import {
  AggregateFuncType,
  AliasColumn,
  DataQueryBuilder,
  SelectClauseOperation,
  SelectCommandType,
  SelectedColumn,
} from '@vulcan-sql/core/data-query';
import { find, isEmpty } from 'lodash';
import { DataSource, BindParameters } from '@vulcan-sql/core/models';

// Use to generate select record expected results
const generateSelectRecords = (
  command: SelectCommandType,
  columns: Array<string | SelectedColumn | undefined>
) => {
  // prepared used function for generating expected result
  const normalized = (column: string | SelectedColumn) => {
    if (typeof column === 'string') return { name: column };
    return column as SelectedColumn;
  };
  const isSelectAllExist = (column: SelectedColumn) => column.name === '*';
  const result: SelectClauseOperation = {
    command,
    columns: columns.reduce(
      (operations, currColumn: string | SelectedColumn | undefined) => {
        if (!currColumn || currColumn === '') currColumn = '*';
        if (!(currColumn === '*' && find(operations, isSelectAllExist)))
          operations.push(normalized(currColumn));
        return operations;
      },
      [] as Array<SelectedColumn>
    ),
  };
  return result;
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

describe('Test data query builder > select clause', () => {
  it.each([
    ['*', '*', '*'],
    [undefined, '*', '*'],
    [{ name: '*' }, '*'],
    [{ name: '' }, '*'],
    ['*', { name: '' }],
    [{ name: '*' }, ''],
    [`*`, undefined, ''],
    ['', '', ''],
    [undefined, undefined, undefined],
    ['*', `${faker.database.column()}`, '*'],
    ['*', `${faker.database.column()}`, undefined],
    [undefined, `${faker.database.column()}`, '*'],
    [`${faker.database.column()}`, `${faker.database.column()}`, undefined],
    [`${faker.database.column()}`, '*', '*'],
    [
      `${faker.database.column()}`,
      '*',
      { name: faker.database.column(), as: 'alias' } as SelectedColumn,
    ],
    [
      `${faker.database.column()}`,
      '*',
      {
        name: faker.database.column(),
        aggregateType: AggregateFuncType.COUNT,
      } as SelectedColumn,
    ],
  ])(
    'Should record successfully when call select %p, %p, %p',
    async (...columns: Array<string | SelectedColumn | undefined>) => {
      // Arrange
      const statement = 'select * from table1';
      const expected: SelectClauseOperation = generateSelectRecords(
        SelectCommandType.SELECT,
        columns
      );
      // Act
      let builder = createStubBuilder({
        statement,
      });
      columns.map((column) => {
        builder = column ? builder.select(column) : builder.select();
      });
      // Assert
      expect(JSON.stringify(builder.operations.select)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      select: ['*', faker.database.column()],
      column: [faker.database.column()],
    },

    {
      select: [faker.database.column(), faker.database.column()],
      column: ['*'],
    },

    {
      select: [faker.database.column(), faker.database.column()],
      column: [],
    },

    {
      select: [],
      column: [faker.database.column()],
    },

    {
      select: [
        {
          name: faker.database.column(),
          aggregateType: AggregateFuncType.COUNT,
        } as SelectedColumn,
        '*',
      ],
      column: [
        {
          name: faker.database.column(),
        } as SelectedColumn,
        faker.database.column(),
      ],
    },
  ])(
    'Should record successfully when call select($select).column($column)',
    async (fakeInputParam: {
      select: Array<string | SelectedColumn>;
      column: Array<string | SelectedColumn>;
    }) => {
      // Arrange
      const { select, column } = fakeInputParam;
      const statement = 'select * from table1';
      const selectParam = isEmpty(select) ? ['*'] : select;
      const columnParam = isEmpty(column) ? ['*'] : column;
      const expected = generateSelectRecords(
        SelectCommandType.SELECT,
        selectParam.concat(columnParam)
      );

      // Act
      let builder = createStubBuilder({
        statement,
      });

      builder = !isEmpty(selectParam)
        ? builder.select(...selectParam)
        : builder.select();
      builder = !isEmpty(columnParam)
        ? builder.column(...columnParam)
        : builder.column();

      // Assert
      expect(JSON.stringify(builder.operations.select)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      select: ['*', faker.database.column()],
      first: [faker.database.column()],
    },

    {
      select: [faker.database.column(), faker.database.column()],
      first: ['*'],
    },

    {
      select: [faker.database.column(), faker.database.column()],
      first: [],
    },

    {
      select: [],
      first: [faker.database.column()],
    },

    {
      select: [
        {
          name: faker.database.column(),
          aggregateType: AggregateFuncType.COUNT,
        } as SelectedColumn,
        '*',
      ],
      first: [
        {
          name: faker.database.column(),
        } as SelectedColumn,
        faker.database.column(),
      ],
    },
  ])(
    'Should record successfully when call select($select).first($first)',
    async (fakeInputParam: {
      select: Array<string | SelectedColumn>;
      first: Array<string | SelectedColumn>;
    }) => {
      // Arrange
      const { select, first } = fakeInputParam;
      const statement = 'select * from table1';
      const selectParam = isEmpty(select) ? ['*'] : select;
      const firstParam = isEmpty(first) ? ['*'] : first;
      const expected = generateSelectRecords(
        SelectCommandType.SELECT,
        selectParam.concat(firstParam)
      );

      // Act
      let builder = createStubBuilder({
        statement,
      });

      builder = !isEmpty(selectParam)
        ? builder.select(...selectParam)
        : builder.select();
      builder = !isEmpty(firstParam)
        ? builder.first(...firstParam)
        : builder.first();

      // Assert
      expect(JSON.stringify(builder.operations.select)).toEqual(
        JSON.stringify(expected)
      );
      expect(builder.operations.limit).toEqual(1);
    }
  );

  it.each([
    {
      select: ['*', faker.database.column()],
      count: faker.database.column(),
    },

    {
      select: [faker.database.column(), faker.database.column()],
      count: '*',
    },

    {
      select: [faker.database.column(), faker.database.column()],
      count: undefined,
    },

    {
      select: [],
      count: faker.database.column(),
    },

    {
      select: ['*'],
      count: {
        name: faker.database.column(),
        as: 'alias',
      } as AliasColumn,
    },
  ])(
    'Should record successfully when call select($select).count($count)',
    async (fakeInputParam: {
      select: Array<string | SelectedColumn>;
      count?: string | AliasColumn;
    }) => {
      // Arrange
      const { select, count } = fakeInputParam;
      const statement = 'select * from table1';
      const selectParam = isEmpty(select) ? ['*'] : select;
      const countParam: SelectedColumn = count
        ? typeof count === 'string'
          ? {
              name: count,
              aggregateType: AggregateFuncType.COUNT,
            }
          : {
              ...(count as AliasColumn),
              aggregateType: AggregateFuncType.COUNT,
            }
        : { name: '*', aggregateType: AggregateFuncType.COUNT };

      const expected = generateSelectRecords(
        SelectCommandType.SELECT,
        selectParam.concat(countParam)
      );

      // Act
      let builder = createStubBuilder({
        statement,
      });

      builder = !isEmpty(selectParam)
        ? builder.select(...selectParam)
        : builder.select();
      builder = countParam ? builder.count(countParam) : builder.count();

      // Assert
      expect(JSON.stringify(builder.operations.select)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      select: ['*', faker.database.column()],
      max: faker.database.column(),
    },

    {
      select: [faker.database.column(), faker.database.column()],
      max: '*',
    },

    {
      select: [faker.database.column(), faker.database.column()],
      max: '',
    },

    {
      select: [],
      max: faker.database.column(),
    },

    {
      select: ['*'],
      max: {
        name: faker.database.column(),
        as: 'alias',
      } as AliasColumn,
    },
  ])(
    'Should record successfully when call select($select).max($max)',
    async (fakeInputParam: {
      select: Array<string | SelectedColumn>;
      max: string | AliasColumn;
    }) => {
      // Arrange
      const { select, max } = fakeInputParam;
      const statement = 'select * from table1';
      const selectParam = isEmpty(select) ? ['*'] : select;
      const maxParam: SelectedColumn = max
        ? typeof max === 'string'
          ? {
              name: max,
              aggregateType: AggregateFuncType.MAX,
            }
          : {
              ...(max as AliasColumn),
              aggregateType: AggregateFuncType.MAX,
            }
        : { name: '*', aggregateType: AggregateFuncType.MAX };

      const expected = generateSelectRecords(
        SelectCommandType.SELECT,
        selectParam.concat(maxParam)
      );

      // Act
      let builder = createStubBuilder({
        statement,
      });

      builder = !isEmpty(selectParam)
        ? builder.select(...selectParam)
        : builder.select();
      builder.max(maxParam);
      // Assert
      expect(JSON.stringify(builder.operations.select)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      select: ['*', faker.database.column()],
      min: faker.database.column(),
    },

    {
      select: [faker.database.column(), faker.database.column()],
      min: '*',
    },

    {
      select: [faker.database.column(), faker.database.column()],
      min: '',
    },

    {
      select: [],
      min: faker.database.column(),
    },

    {
      select: ['*'],
      min: {
        name: faker.database.column(),
        as: 'alias',
      } as AliasColumn,
    },
  ])(
    'Should record successfully when call select($select).min($min)',
    async (fakeInputParam: {
      select: Array<string | SelectedColumn>;
      min: string | AliasColumn;
    }) => {
      // Arrange
      const { select, min } = fakeInputParam;
      const statement = 'select * from table1';
      const selectParam = isEmpty(select) ? ['*'] : select;
      const minParam: SelectedColumn = min
        ? typeof min === 'string'
          ? {
              name: min,
              aggregateType: AggregateFuncType.MIN,
            }
          : {
              ...(min as AliasColumn),
              aggregateType: AggregateFuncType.MIN,
            }
        : { name: '*', aggregateType: AggregateFuncType.MIN };

      const expected = generateSelectRecords(
        SelectCommandType.SELECT,
        selectParam.concat(minParam)
      );

      // Act
      let builder = createStubBuilder({
        statement,
      });

      builder = !isEmpty(selectParam)
        ? builder.select(...selectParam)
        : builder.select();
      builder.min(minParam);
      // Assert
      expect(JSON.stringify(builder.operations.select)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      select: ['*', faker.database.column()],
      avg: faker.database.column(),
    },

    {
      select: [faker.database.column(), faker.database.column()],
      avg: '*',
    },

    {
      select: [faker.database.column(), faker.database.column()],
      avg: '',
    },

    {
      select: [],
      avg: faker.database.column(),
    },

    {
      select: ['*'],
      avg: {
        name: faker.database.column(),
        as: 'alias',
      } as AliasColumn,
    },
  ])(
    'Should record successfully when call select($select).avg($avg)',
    async (fakeInputParam: {
      select: Array<string | SelectedColumn>;
      avg: string | AliasColumn;
    }) => {
      // Arrange
      const { select, avg } = fakeInputParam;
      const statement = 'select * from table1';
      const selectParam = isEmpty(select) ? ['*'] : select;
      const avgParam: SelectedColumn = avg
        ? typeof avg === 'string'
          ? {
              name: avg,
              aggregateType: AggregateFuncType.AVG,
            }
          : {
              ...(avg as AliasColumn),
              aggregateType: AggregateFuncType.AVG,
            }
        : { name: '*', aggregateType: AggregateFuncType.AVG };

      const expected = generateSelectRecords(
        SelectCommandType.SELECT,
        selectParam.concat(avgParam)
      );

      // Act
      let builder = createStubBuilder({
        statement,
      });

      builder = !isEmpty(selectParam)
        ? builder.select(...selectParam)
        : builder.select();
      builder.avg(avgParam);
      // Assert
      expect(JSON.stringify(builder.operations.select)).toEqual(
        JSON.stringify(expected)
      );
    }
  );

  it.each([
    {
      select: ['*', faker.database.column()],
      sum: faker.database.column(),
    },

    {
      select: [faker.database.column(), faker.database.column()],
      sum: '*',
    },

    {
      select: [faker.database.column(), faker.database.column()],
      sum: '',
    },

    {
      select: [],
      sum: faker.database.column(),
    },

    {
      select: ['*'],
      sum: {
        name: faker.database.column(),
        as: 'alias',
      } as AliasColumn,
    },
  ])(
    'Should record successfully when call select($select).sum($sum)',
    async (fakeInputParam: {
      select: Array<string | SelectedColumn>;
      sum: string | AliasColumn;
    }) => {
      // Arrange
      const { select, sum } = fakeInputParam;
      const statement = 'select * from table1';
      const selectParam = isEmpty(select) ? ['*'] : select;
      const sumParam: SelectedColumn = sum
        ? typeof sum === 'string'
          ? {
              name: sum,
              aggregateType: AggregateFuncType.SUM,
            }
          : {
              ...(sum as AliasColumn),
              aggregateType: AggregateFuncType.SUM,
            }
        : { name: '*', aggregateType: AggregateFuncType.SUM };

      const expected = generateSelectRecords(
        SelectCommandType.SELECT,
        selectParam.concat(sumParam)
      );

      // Act
      let builder = createStubBuilder({
        statement,
      });

      builder = !isEmpty(selectParam)
        ? builder.select(...selectParam)
        : builder.select();
      builder.sum(sumParam);
      // Assert
      expect(JSON.stringify(builder.operations.select)).toEqual(
        JSON.stringify(expected)
      );
    }
  );
});
