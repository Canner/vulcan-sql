import { omitBy, isUndefined } from 'lodash';

export const compactObject = <T>(obj: T) => {
  return omitBy(obj, isUndefined) as T;
};
