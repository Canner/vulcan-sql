import { isArray, isObject } from 'class-validator';
import { isEmpty } from 'lodash';

export const convertToHuggingFaceTable = (data: Array<Record<string, any>>) => {
  const table = data.reduce((result, current) => {
    // Convert each row data
    Object.keys(current).map((column: string) => {
      const value =
        isArray(current[column]) || isObject(current[column])
          ? JSON.stringify(current[column])
          : String(current[column]);
      if (isEmpty(result[column])) result[column] = [value];
      else result[column].push(value);
    });
    return result;
  }, {} as Record<string, string[]>);
  return table;
};
