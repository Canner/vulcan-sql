import { RawAPISchema } from '@vulcan-sql/build/schema-parser';
import { addRequiredValidatorForPath } from '@vulcan-sql/build/schema-parser/middleware';
import { APISchema, FieldInType } from '@vulcan-sql/core';

it('Should add required validator for parameter in path', async () => {
  // Arrange
  const schema: RawAPISchema = {
    templateSource: 'existed/path',
    sourceName: 'some-name',
    urlPath: '/:id/:oid',
    request: [
      {
        fieldName: 'id',
        fieldIn: FieldInType.PATH,
      },
      {
        fieldName: 'oid',
        fieldIn: FieldInType.PATH,
        validators: [{ name: 'some-validator' }],
      },
    ],
  };
  // Act
  await addRequiredValidatorForPath()(schema, async () => Promise.resolve());
  // Assert
  expect((schema as APISchema).request?.[0].validators?.[0].name).toEqual(
    'required'
  );
  expect((schema as APISchema).request?.[1].validators?.[1].name).toEqual(
    'required'
  );
});

it('Should not change the validator if it had already defined', async () => {
  // Arrange
  const schema: RawAPISchema = {
    templateSource: 'existed/path',
    sourceName: 'some-name',
    urlPath: '/:id',
    request: [
      {
        fieldName: 'id',
        fieldIn: FieldInType.PATH,
        validators: [
          {
            name: 'required',
            args: {
              foo: 'bar',
            },
          },
        ],
      },
    ],
  };
  // Act
  await addRequiredValidatorForPath()(schema, async () => Promise.resolve());
  // Assert
  expect((schema as APISchema).request?.[0].validators?.[0].args.foo).toEqual(
    'bar'
  );
});
