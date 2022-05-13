import * as sinon from 'ts-sinon';
import faker from '@faker-js/faker';
import { RequestValidator, RequestParameters } from '@route-generator/.';
import {
  APISchema,
  FieldDataType,
  FieldInType,
  RequestSchema,
  ValidatorDefinition,
} from '@vulcan/core';

describe('Test request validator - validate successfully', () => {
  const fakeSchemas: Array<APISchema> = [
    {
      ...sinon.stubInterface<APISchema>(),
      urlPath: `/${faker.word.noun()}/:id/${faker.word.noun()}/:uuid`,
      request: [
        {
          ...sinon.stubInterface<RequestSchema>(),
          fieldName: 'id',
          type: FieldDataType.NUMBER,
          fieldIn: FieldInType.PATH,
          validators: [
            {
              name: 'integer',
            },
          ] as Array<ValidatorDefinition>,
        },
        {
          ...sinon.stubInterface<RequestSchema>(),
          fieldName: 'uuid',
          type: FieldDataType.STRING,
          fieldIn: FieldInType.PATH,
          validators: [
            {
              name: 'uuid',
            },
          ] as Array<ValidatorDefinition>,
        },
      ],
    },
    {
      ...sinon.stubInterface<APISchema>(),
      urlPath: `/${faker.word.noun()}/:uuid`,
      request: [
        {
          ...sinon.stubInterface<RequestSchema>(),
          fieldName: 'uuid',
          type: FieldDataType.STRING,
          fieldIn: FieldInType.PATH,
          validators: [
            {
              name: 'uuid',
            },
          ] as Array<ValidatorDefinition>,
        },
        {
          ...sinon.stubInterface<RequestSchema>(),
          fieldName: 'domain',
          type: FieldDataType.STRING,
          fieldIn: FieldInType.HEADER,
          validators: [
            {
              name: 'string',
            },
          ] as Array<ValidatorDefinition>,
        },
      ],
    },
    {
      ...sinon.stubInterface<APISchema>(),
      urlPath: `/${faker.word.noun()}`,
      request: [
        {
          ...sinon.stubInterface<RequestSchema>(),
          fieldName: 'keywords',
          type: FieldDataType.STRING,
          fieldIn: FieldInType.QUERY,
          validators: [
            {
              name: 'string',
            },
          ] as Array<ValidatorDefinition>,
        },
        {
          ...sinon.stubInterface<RequestSchema>(),
          fieldName: 'domain',
          type: FieldDataType.STRING,
          fieldIn: FieldInType.HEADER,
          validators: [
            {
              name: 'string',
            },
          ] as Array<ValidatorDefinition>,
        },
      ],
    },
    {
      ...sinon.stubInterface<APISchema>(),
      urlPath: `/${faker.word.noun()}`,
      request: [
        {
          ...sinon.stubInterface<RequestSchema>(),
          fieldName: 'sort',
          type: FieldDataType.STRING,
          fieldIn: FieldInType.QUERY,
          validators: [
            {
              name: 'string',
              args: {},
            },
          ] as Array<ValidatorDefinition>,
        },
      ],
    },
  ];
  const fakeKoaContexts: Array<RequestParameters> = [
    {
      id: faker.datatype.number(),
      uuid: faker.datatype.uuid(),
    },
    {
      uuid: faker.datatype.uuid(),
      domain: faker.internet.domainName(),
    },
    {
      domain: faker.internet.domainName(),
      keywords: faker.random.words(),
    },
    {
      sort: faker.helpers.arrayElement(['ASC', 'DESC']),
    },
  ];

  it.each([
    [fakeSchemas[0], fakeKoaContexts[0]],
    [fakeSchemas[1], fakeKoaContexts[1]],
    [fakeSchemas[2], fakeKoaContexts[2]],
    [fakeSchemas[3], fakeKoaContexts[3]],
  ])(
    'Should success when give matched request parameters and api schema',
    async (schema: APISchema, reqParams: RequestParameters) => {
      // Act
      const validator = new RequestValidator();
      const validateAction = validator.validate(reqParams, schema);
      const result = expect(validateAction).resolves;
      await result.not.toThrow();
    }
  );
});

// TODO: Failed case for validator
