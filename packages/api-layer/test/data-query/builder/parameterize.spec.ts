import * as sinon from 'ts-sinon';
import { DataQueryBuilder, Parameterizer } from '@vulcan-sql/api-layer/data-query';
import { DataSource } from '@vulcan-sql/api-layer';

const createStubs = ({ statement }: { statement: string }) => {
  const dataSource = sinon.stubInterface<DataSource>();
  const parameterizer = new Parameterizer(
    async ({ parameterIndex }) => `@var${parameterIndex}`
  );
  return {
    builder: new DataQueryBuilder({
      statement: statement,
      dataSource,
      parameterizer,
      profileName: '',
      headers: {},
    }),
    dataSource,
    parameterizer,
  };
};

describe('Test data query builder > parameterize', () => {
  it('The values of offset and limit should be parameterized', async () => {
    // Arrange
    const { builder, dataSource } = createStubs({
      statement: 'select * from orders',
    });
    const bindParams = new Map();
    bindParams.set('@var1', 4);
    bindParams.set('@var2', 3);

    // Act
    builder.limit(3).offset(4);
    await builder.value();

    // Assert
    expect(dataSource.execute.firstCall.args[0].bindParams).toEqual(bindParams);
    expect(dataSource.execute.firstCall.args[0].operations.limit).toEqual(
      '@var2'
    );
    expect(dataSource.execute.firstCall.args[0].operations.offset).toEqual(
      '@var1'
    );
  });

  it('Parameterizer should be duplicated with builder', async () => {
    // Arrange
    const { builder, dataSource } = createStubs({
      statement: 'select * from orders',
    });
    const bindParams = new Map();
    bindParams.set('@var1', 4);
    bindParams.set('@var2', 3);

    // Act
    builder.limit(3);
    builder.clone().offset(5);
    builder.offset(4);
    await builder.value();

    // Assert
    expect(dataSource.execute.firstCall.args[0].bindParams).toEqual(bindParams);
    expect(dataSource.execute.firstCall.args[0].operations.limit).toEqual(
      '@var2'
    );
    expect(dataSource.execute.firstCall.args[0].operations.offset).toEqual(
      '@var1'
    );
  });

  it('Parameterizer should be reset after calling value() function', async () => {
    // Arrange
    const { builder, dataSource } = createStubs({
      statement: 'select * from orders',
    });
    const bindParams = new Map();
    bindParams.set('@var1', 4);
    bindParams.set('@var2', 3);

    // Act
    builder.limit(3).offset(4);
    await builder.value();
    await builder.value();

    // Assert
    expect(dataSource.execute.firstCall.args[0].bindParams).toEqual(bindParams);
    expect(dataSource.execute.firstCall.args[0].operations.limit).toEqual(
      '@var2'
    );
    expect(dataSource.execute.firstCall.args[0].operations.offset).toEqual(
      '@var1'
    );
    expect(dataSource.execute.secondCall.args[0].bindParams).toEqual(
      bindParams
    );
    expect(dataSource.execute.secondCall.args[0].operations.limit).toEqual(
      '@var2'
    );
    expect(dataSource.execute.secondCall.args[0].operations.offset).toEqual(
      '@var1'
    );
  });
});
