import faker from '@faker-js/faker';
import { UserError } from '@vulcan-sql/core';
import { KoaContext } from '@vulcan-sql/serve';
import { OffsetBasedStrategy } from '@vulcan-sql/serve/pagination';
import { Request } from 'koa';
import { ParsedUrlQuery } from 'querystring';
import * as sinon from 'ts-sinon';

describe('Test offset based pagination strategy', () => {
  afterEach(() => {
    sinon.default.restore();
  });

  it('Should throw error when "offset" field are duplicated', async () => {
    // Arrange
    const expected = new UserError(
      `The query string offset should be defined once.`
    );
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        query: {
          ...sinon.stubInterface<ParsedUrlQuery>(),
          offset: ['50', '100'],
        },
      },
    } as KoaContext;

    // Act
    const strategy = new OffsetBasedStrategy();
    const action = strategy.transform(ctx);

    // Assert
    await expect(action).rejects.toThrow(expected);
  });

  it('Should apply default value when "offset" field not in query string for request context', async () => {
    // Arrange
    const expected = {
      offset: 0,
      limit: 50,
    };
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
    const strategy = new OffsetBasedStrategy();
    const result = await strategy.transform(ctx);

    // Assert
    expect(result).toEqual(expected);
  });

  it('Should apply default value when "limit" field not in query string for request context', async () => {
    // Arrange
    const expected = {
      offset: 50,
      limit: 20,
    };
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        query: {
          ...sinon.stubInterface<ParsedUrlQuery>(),
          offset: '50',
        },
      },
    } as KoaContext;

    // Act
    const strategy = new OffsetBasedStrategy();
    const result = await strategy.transform(ctx);

    // Assert
    expect(result).toEqual(expected);
  });

  it('Should transform successful when "limit" and "offset" existed in query string for request context format correct', async () => {
    // Arrange
    const expected = {
      offset: faker.datatype.number({ min: 1, max: 100 }),
      limit: faker.datatype.number({ min: 1, max: 100 }),
    };

    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        query: {
          ...sinon.stubInterface<ParsedUrlQuery>(),
          offset: expected.offset.toString(),
          limit: expected.limit.toString(),
        },
      },
    } as KoaContext;

    // Act
    const strategy = new OffsetBasedStrategy();
    const result = await strategy.transform(ctx);

    // Assert
    expect(result).toEqual(expected);
  });
});
