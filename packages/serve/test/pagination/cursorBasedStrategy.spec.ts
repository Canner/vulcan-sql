import faker from '@faker-js/faker';
import { PaginationMode } from '@vulcan-sql/api-layer/models';
import { KoaContext } from '@vulcan-sql/serve';
import { CursorBasedStrategy } from '@vulcan-sql/serve/pagination';
import { Request } from 'koa';
import { ParsedUrlQuery } from 'querystring';
import * as sinon from 'ts-sinon';

describe('Test cursor based pagination strategy', () => {
  afterEach(() => {
    sinon.default.restore();
  });

  it('Should throw error when "cursor" field not in query string for request context', async () => {
    // Arrange
    const expected = new Error(
      `The ${PaginationMode.CURSOR} must provide limit and cursor in query string.`
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
    const strategy = new CursorBasedStrategy();
    const transformAction = strategy.transform(ctx);

    // Assert
    expect(transformAction).rejects.toThrowError(expected);
  });

  it('Should throw error when "limit" field not in query string for request context', async () => {
    // Arrange
    const expected = new Error(
      `The ${PaginationMode.CURSOR} must provide limit and cursor in query string.`
    );
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        query: {
          ...sinon.stubInterface<ParsedUrlQuery>(),
          cursor: '50',
        },
      },
    } as KoaContext;

    // Act
    const strategy = new CursorBasedStrategy();
    const transformAction = strategy.transform(ctx);

    // Assert
    expect(transformAction).rejects.toThrowError(expected);
  });

  it('Should transform successful when "limit" and "cursor" existed in query string for request context format correct', async () => {
    // Arrange
    const expected = {
      cursor: faker.date.recent().toISOString(),
      limit: faker.datatype.number({ min: 1, max: 100 }),
    };

    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        query: {
          ...sinon.stubInterface<ParsedUrlQuery>(),
          cursor: expected.cursor,
          limit: expected.limit.toString(),
        },
      },
    } as KoaContext;

    // Act
    const strategy = new CursorBasedStrategy();
    const result = await strategy.transform(ctx);

    // Assert
    expect(result).toEqual(expected);
  });
});
