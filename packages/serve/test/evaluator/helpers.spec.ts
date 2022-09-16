import { getRegexpFromWildcardPattern } from '@vulcan-sql/serve/evaluator/constraints';

describe('Test for wildcard pattern', () => {
  it.each([
    ['admin', ['admin'], ['1admin', 'admin1', 'ad*min']],
    ['admin*', ['admin', 'admin1'], ['1admin', 'ad*min']],
    ['*admin', ['admin', '1admin'], ['admin1', 'ad*min']],
    ['ad*min', ['admin', 'ad1min'], ['1admin', 'admin1']],
    ['admin*[.+', ['admin[.+', 'admin123[.+'], ['admin', 'admin1']],
  ])(`test for pattern %p`, (pattern, accept, deny) => {
    accept.forEach((c) =>
      expect(getRegexpFromWildcardPattern(pattern).test(c)).toBe(true)
    );
    deny.forEach((c) =>
      expect(getRegexpFromWildcardPattern(pattern).test(c)).toBe(false)
    );
  });
});
