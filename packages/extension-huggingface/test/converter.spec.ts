import { convertToHuggingFaceTable } from '../src/lib/utils';
import faker from '@faker-js/faker';

describe('Test convertToHuggingFaceTable', () => {
  it('Should convert to table when each column data is primitive value', () => {
    // Arrange,
    const data = [
      { id: 1, name: 'ivan', age: 28, enabled: true },
      { id: 2, name: 'star', age: 29, enabled: false },
    ];
    const expected = {
      id: ['1', '2'],
      name: ['ivan', 'star'],
      age: ['28', '29'],
      enabled: ['true', 'false'],
    };
    // Act
    const result = convertToHuggingFaceTable(data);
    // Assert
    expect(result).toEqual(expected);
  });

  it('Should convert to table when each column data has null or undefined value', () => {
    // Arrange,
    const data = [
      { id: 1, name: 'ivan', age: 28, personality: undefined, mathScore: 98 },
      {
        id: 2,
        name: 'star',
        age: 29,
        personality: 'sunshine',
        mathScore: null,
      },
    ];
    const expected = {
      id: ['1', '2'],
      name: ['ivan', 'star'],
      age: ['28', '29'],
      personality: ['undefined', 'sunshine'],
      mathScore: ['98', 'null'],
    };
    // Act
    const result = convertToHuggingFaceTable(data);
    // Assert
    expect(result).toEqual(expected);
  });

  it('Should convert to table when some column data has array value', () => {
    // Arrange,
    const data = [
      {
        id: faker.datatype.uuid(),
        name: faker.commerce.productName(),
        materials: [
          { id: faker.datatype.uuid(), name: faker.commerce.productMaterial() },
        ],
      },
      {
        id: faker.datatype.uuid(),
        name: faker.commerce.productName(),
        materials: [
          { id: faker.datatype.uuid(), name: faker.commerce.productMaterial() },
          { id: faker.datatype.uuid(), name: faker.commerce.productMaterial() },
        ],
      },
    ];
    const expected = {
      id: data.map((item) => item.id),
      name: data.map((item) => item.name),
      materials: data.map((item) => JSON.stringify(item.materials)),
    };
    // Act
    const result = convertToHuggingFaceTable(data);
    // Assert
    expect(result).toEqual(expected);
  });

  it('Should convert to table when some column data has nested value', () => {
    // Arrange,
    const data = [
      {
        id: faker.datatype.uuid(),
        name: faker.commerce.productName(),
        attribute: {
          materials: [faker.commerce.productMaterial()],
          labels: [
            {
              id: faker.datatype.uuid(),
              name: faker.commerce.product(),
            },
          ],
        },
      },
      {
        id: faker.datatype.uuid(),
        name: faker.commerce.productName(),
        attribute: {
          materials: [faker.commerce.productMaterial()],
          labels: [
            {
              id: faker.datatype.uuid(),
              name: faker.commerce.product(),
            },
            {
              id: faker.datatype.uuid(),
              name: faker.commerce.product(),
            },
          ],
        },
      },
    ];
    const expected = {
      id: data.map((item) => item.id),
      name: data.map((item) => item.name),
      attribute: data.map((item) => JSON.stringify(item.attribute)),
    };
    // Act
    const result = convertToHuggingFaceTable(data);
    // Assert
    expect(result).toEqual(expected);
  });
});
