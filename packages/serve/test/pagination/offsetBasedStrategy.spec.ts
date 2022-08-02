import faker from '@faker-js/faker';
import { PaginationMode } from '@vulcan-sql/core/models';
import { KoaContext } from '@vulcan-sql/serve';
import { OffsetBasedStrategy } from '@vulcan-sql/serve/pagination';
import { Request } from 'koa';
import { ParsedUrlQuery } from 'querystring';
import * as sinon from 'ts-sinon';

describe('Test offset based pagination strategy', () => {
  afterEach(() => {
    sinon.default.restore();
  });

  it('Should throw error when "offset" field not in query string for request context', async () => {
    // Arrange
    const expected = new Error(
      `The ${PaginationMode.OFFSET} must provide limit and offset in query string.`
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
    const strategy = new OffsetBasedStrategy();
    const transformAction = strategy.transform(ctx);

    // Assert
    expect(transformAction).rejects.toThrowError(expected);
  });

  it('Should throw error when "limit" field not in query string for request context', async () => {
    // Arrange
    const expected = new Error(
      `The ${PaginationMode.OFFSET} must provide limit and offset in query string.`
    );
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
    const transformAction = strategy.transform(ctx);

    // Assert
    expect(transformAction).rejects.toThrowError(expected);
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
