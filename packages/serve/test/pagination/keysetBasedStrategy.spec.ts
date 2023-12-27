import faker from '@faker-js/faker';
import { PaginationMode } from '@vulcan-sql/api-layer/models';
import { KoaContext } from '@vulcan-sql/serve';
import { KeysetBasedStrategy } from '@vulcan-sql/serve/pagination';
import { Request } from 'koa';
import { ParsedUrlQuery } from 'querystring';
import * as sinon from 'ts-sinon';

describe('Test keyset based pagination strategy', () => {
  afterEach(() => {
    sinon.default.restore();
  });

  it('Should throw error when "keyName" not provide query at initialization', async () => {
    // Arrange
    const expected = new Error(
      'The keyset pagination need to set "keyName" in schema for indicate what key need to do filter.'
    );
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        query: {
          ...sinon.stubInterface<ParsedUrlQuery>(),
        },
      },
    } as KoaContext;

    // Act
    const strategy = new KeysetBasedStrategy();
    const transformAction = strategy.transform(ctx);

    // Assert
    expect(transformAction).rejects.toThrowError(expected);
  });

  it('Should throw error when "keyName" field not in query string for request context', async () => {
    // Arrange
    const expected = new Error(
      `The ${PaginationMode.KEYSET} must provide limit and key name in query string.`
    );
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        query: {
          ...sinon.stubInterface<ParsedUrlQuery>(),
          limit: '50',
        },
      },
    } as KoaContext;

    // Act
    const strategy = new KeysetBasedStrategy(faker.random.word());
    const transformAction = strategy.transform(ctx);

    // Assert
    expect(transformAction).rejects.toThrowError(expected);
  });

  it('Should throw error when "limit" field not in query string for request context', async () => {
    // Arrange
    const keyName = faker.random.word().toLowerCase();
    const expected = new Error(
      `The ${PaginationMode.KEYSET} must provide limit and key name in query string.`
    );
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        query: {
          ...sinon.stubInterface<ParsedUrlQuery>(),
          keyName: faker.random.word(),
        },
      },
    } as KoaContext;

    // Act
    const strategy = new KeysetBasedStrategy(keyName);
    const transformAction = strategy.transform(ctx);

    // Assert
    expect(transformAction).rejects.toThrowError(expected);
  });

  it('Should transform successful when "limit" and "keyName" existed in query string for request context format correct', async () => {
    // Arrange
    const keyName = faker.random.word().toLowerCase();

    const expected = {
      limit: faker.datatype.number({ min: 1, max: 100 }),
      [keyName]: faker.random.word(),
    };

    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        query: {
          ...sinon.stubInterface<ParsedUrlQuery>(),
          limit: expected.limit.toString(),
          [keyName]: expected[keyName],
        },
      },
    } as KoaContext;

    // Act
    const strategy = new KeysetBasedStrategy(keyName);
    const result = await strategy.transform(ctx);

    // Assert
    expect(result).toEqual(expected);
  });
});
