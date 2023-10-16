import { isUndefined } from 'lodash';
import { UserError } from './errors';

export const canBeNormalized = (type: string) => {
  return (
    ['number', 'boolean', 'string', 'date'].indexOf(type.toLowerCase()) !== -1
  );
};

export const normalizeStringValue = (
  value: string | undefined,
  dataName: string,
  dataType: string
) => {
  if (isUndefined(value)) {
    return undefined;
  }

  switch (dataType.toLowerCase()) {
    case 'number': {
      if (value === '') {
        throw new UserError(`${dataName} must be number`);
      }
      const valueNumber = +value;
      if (isNaN(valueNumber)) {
        throw new UserError(`${dataName} must be number`);
      }
      return valueNumber;
    }

    case 'boolean': {
      if (value === 'true' || value === '1' || value === '') {
        return true;
      } else if (value === 'false' || value === '0') {
        return false;
      } else {
        throw new UserError(`${dataName} must be boolean`);
      }
    }

    case 'date': {
      const parsedDate = new Date(value);
      if (Number.isNaN(parsedDate.getTime())) {
        throw new UserError(`${dataName} must be date`);
      }
      return parsedDate;
    }

    case 'string':
    default:
      return value;
  }
};
