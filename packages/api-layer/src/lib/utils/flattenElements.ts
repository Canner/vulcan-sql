import { isArray, chain, isPlainObject } from 'lodash';

// [e1, e2, e3] , {e1, e2, e3}, [[e1, e2], e3], {e: [e1, e2], e3}
export type ElementEntry<E> = (E[] | E)[] | Record<string, E | E[]>;

/**
 * [e1, e2, e3] , {e1, e2, e3}, [[e1, e2], e3], {e: [e1, e2], e3} => [e1, e2, e3]
 */
export const flattenElements = <E>(moduleEntry: ElementEntry<E> | E): E[] => {
  // [e1, e2, e3] or [[e1, e2], e3]
  if (isArray(moduleEntry))
    return chain(moduleEntry)
      .flatMap((module) => flattenElements(module))
      .value();
  // {e1, e2, e3} or {e: [e1, e2], e3}
  if (isPlainObject(moduleEntry))
    return chain(moduleEntry as Record<string, E | E[]>)
      .values()
      .flatMap((module) => flattenElements(module))
      .value();

  return [moduleEntry as E];
};
