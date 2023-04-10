import { CheckCache } from '@vulcan-sql/build/schema-parser/middleware/checkCache';
import { RawAPISchema } from '../../../src';


let middleware: CheckCache;
const next = jest.fn();

beforeEach(() => {
    middleware = new CheckCache();
    next.mockClear();
});

it('should not throw error if cache is not defined', async () => {
    const schema: RawAPISchema = { sourceName: 'test' };
    await middleware.handle(schema, next)
    expect(next).toHaveBeenCalledTimes(1);
  });

it('should throw error if cache is defined but not used in SQL file', async () => {
    const schema: RawAPISchema = { sourceName: 'test', cache: [{ cacheTableName: 'test', sql: 'select * from test' }] };
    await expect(middleware.handle(schema,next)).rejects.toThrow('your SQL will use the cache feature, not YAML defined.');
    expect(next).not.toHaveBeenCalled();
});

it('should throw error if both refreshTime and refreshExpression are set', async () => {
    const schema: RawAPISchema = { 
        sourceName: 'test', 
        cache: [
        { cacheTableName: 'test1', sql: 'select * from test1', refreshTime: { every: '5m' }, refreshExpression: { expression: 'test' } },
        { cacheTableName: 'test2', sql: 'select * from test2', refreshTime: { every: '5m' } }
        ],
        metadata: { 'cache.vulcan.com': { isUsedTag: true } }
    };
    await expect(middleware.handle(schema,next)).rejects.toThrow('can not configure refreshTime and refreshExpression at the same time, please pick one');
    expect(next).not.toHaveBeenCalled();
});

it('should call next if cache is defined and used in SQL file', async () => {
    const schema: RawAPISchema = { 
        sourceName: 'test', 
        cache: [{ cacheTableName: 'test', sql: 'select * from test' }],
        metadata: { 'cache.vulcan.com': { isUsedTag: true } }
    };
    await middleware.handle(schema, next);
    expect(next).toHaveBeenCalledTimes(1);
});