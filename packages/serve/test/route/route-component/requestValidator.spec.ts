import * as sinon from 'ts-sinon';
import faker from '@faker-js/faker';
import {
  RequestValidator,
  RequestParameters,
  IRequestValidator,
} from '@vulcan-sql/serve/route';
import {
  APISchema,
  FieldDataType,
  FieldInType,
  RequestSchema,
  ValidatorDefinition,
  ValidatorLoader,
  extensionModule,
  TYPES as CORE_TYPES,
} from '@vulcan-sql/core';
import { Container } from 'inversify';
import { TYPES } from '@vulcan-sql/serve/containers';

describe('Test request validator - validate successfully', () => {
  let container: Container;

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

  beforeEach(async () => {
    container = new Container();
    await container.loadAsync(extensionModule({} as any));
    container.bind(CORE_TYPES.ValidatorLoader).to(ValidatorLoader);
    container.bind(TYPES.RequestValidator).to(RequestValidator);
  });

  afterEach(async () => {
    await container.unbindAllAsync();
  });
  it.each([
    [fakeSchemas[0], fakeKoaContexts[0]],
    [fakeSchemas[1], fakeKoaContexts[1]],
    [fakeSchemas[2], fakeKoaContexts[2]],
    [fakeSchemas[3], fakeKoaContexts[3]],
  ])(
    'Should success when give matched request parameters and api schema',
    async (schema: APISchema, reqParams: RequestParameters) => {
      // Act
      const validator = container.get<IRequestValidator>(
        TYPES.RequestValidator
      );
      const validateAction = validator.validate(reqParams, schema);
      const result = expect(validateAction).resolves;
      await result.not.toThrow();
    }
  );
});

// TODO: Failed case for validator
