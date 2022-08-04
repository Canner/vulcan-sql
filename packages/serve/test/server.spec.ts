import { VulcanServer } from '../src/lib/server';
import * as path from 'path';
import { APIProviderType } from '@vulcan-sql/serve';
import faker from '@faker-js/faker';

let server: VulcanServer;

beforeEach(async () => {
  await server?.close();
});

it('Vulcan server should work with built artifacts', async () => {
  // Arrange
  server = new VulcanServer({
    artifact: {
      provider: 'LocalFile',
      serializer: 'JSON',
      filePath: path.resolve(__dirname, 'result.json'),
    },
    extensions: {},
    types: [APIProviderType.RESTFUL],
  });

  // Act, Assert
  await expect(server.start(faker.internet.port())).resolves.not.toThrow();
});
