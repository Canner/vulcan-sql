import 'reflect-metadata';

import { Container, TYPES } from '@vulcan/core/containers';
import {
  NunjucksCompiler,
  PersistentStoreType,
  SerializerType,
  TemplateProviderType,
} from '@vulcan/core';

it('test', async () => {
  const c = new Container();

  await c.load({
    artifact: {
      provider: PersistentStoreType.LocalFile,
      filePath: '',
      serializer: SerializerType.JSON,
    },
    template: {
      provider: TemplateProviderType.LocalFile,
      templatePath: '',
    },
  });
  const cc = c.get<NunjucksCompiler>(TYPES.Compiler);
  const re = cc.compile(`QQQQQ`);
  console.log(re);
});
