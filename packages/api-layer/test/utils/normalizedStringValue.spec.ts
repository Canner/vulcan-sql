import { normalizeStringValue } from '@vulcan-sql/api-layer';

it.each([
  ['number', '', 'test must be number'],
  ['number', 'a', 'test must be number'],
  ['number', 'true', 'test must be number'],
  ['boolean', 'a', 'test must be boolean'],
  ['boolean', '12345', 'test must be boolean'],
  ['date', '', 'test must be date'],
  ['date', 'a', 'test must be date'],
  ['date', 'true', 'test must be date'],
])(
  `Normalizer should throw error with type %s and value %p`,
  (type, value, errorMessage) => {
    expect(() => normalizeStringValue(value, 'test', type)).toThrow(
      errorMessage
    );
  }
);

it.each([
  ['number', '1234', 1234],
  ['number', '-1234', -1234],
  ['number', '0', 0],
  ['number', undefined, undefined],
  ['boolean', '', true],
  ['boolean', '1', true],
  ['boolean', 'true', true],
  ['boolean', '0', false],
  ['boolean', 'false', false],
  ['boolean', undefined, undefined],
  ['date', '2022-08-23 14:44:23', new Date('2022-08-23 14:44:23')],
  ['date', undefined, undefined],
  ['string', '1234', '1234'],
  ['string', 'true', 'true'],
  ['string', '', ''],
  ['string', undefined, undefined],
])(
  `Normalizer should return correct value with type %s and value %p`,
  (type, value, expectedValue) => {
    expect(normalizeStringValue(value, 'test', type)).toEqual(expectedValue);
  }
);
