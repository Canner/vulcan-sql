import { APIProviderType, TYPES, VulcanApplication } from '@vulcan-sql/serve';
import { Container } from '../src/containers/container';
import {
  PersistentStoreType,
  SerializerType,
  TemplateProviderType,
} from '@vulcan-sql/core';
import * as path from 'path';

it('', async () => {
  const container = new Container();
  await container.load({
    types: [APIProviderType.RESTFUL],
    artifact: {
      provider: PersistentStoreType.LocalFile,
      serializer: SerializerType.JSON,
      filePath: path.resolve(__dirname, 'result.json'),
    },
    template: {
      provider: TemplateProviderType.LocalFile,
      folderPath: path.resolve(__dirname, 'source'),
    },
    extensions: {},
  });

  const app = container.get<VulcanApplication>(TYPES.VulcanApplication);
  await app.useMiddleware();
});
