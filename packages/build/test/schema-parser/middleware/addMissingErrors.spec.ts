import { RawAPISchema } from '../../../src';
import { addMissingErrors } from '../../../src/lib/schema-parser/middleware/addMissingErrors';
import { AllTemplateMetadata } from '@vulcan/core';

it('Should add missing error codes', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    templateSource: 'some-name',
    request: [],
    errors: [],
  };
  const metadata: AllTemplateMetadata = {
    'some-name': {
      parameters: [],
      errors: [
        {
          code: 'ERROR 1',
          locations: [
            {
              lineNo: 0,
              columnNo: 0,
            },
          ],
        },
      ],
    },
  };
  // Act
  await addMissingErrors(metadata)(schema, async () => Promise.resolve());
  // Assert
  expect(schema.errors?.length).toBe(1);
});
