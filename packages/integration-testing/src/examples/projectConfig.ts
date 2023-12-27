import { SchemaReaderType } from '@vulcan-sql/build';
import {
  ArtifactBuilderProviderType,
  ArtifactBuilderSerializerType,
  TemplateProviderType,
  DocumentSpec,
} from '@vulcan-sql/api-layer';
import { APIProviderType } from '@vulcan-sql/serve';
import * as path from 'path';
import faker from '@faker-js/faker';

export default {
  name: 'Integration Testing',
  description: 'Vulcan project for integration testing',
  version: '0.0.2',
  template: {
    provider: TemplateProviderType.LocalFile,
    folderPath: path.resolve(__dirname, 'sql-samples'),
  },
  artifact: {
    provider: ArtifactBuilderProviderType.LocalFile,
    serializer: ArtifactBuilderSerializerType.JSON,
    filePath: path.resolve(__dirname, 'result.json'),
  },
  'schema-parser': {
    reader: SchemaReaderType.LocalFile,
    folderPath: path.resolve(__dirname, 'sql-samples'),
  },
  document: {
    specs: [DocumentSpec.oas3],
  },
  types: [APIProviderType.RESTFUL],
  profiles: [path.resolve(__dirname, 'profile.yaml')],
  extensions: {
    mockEx: path.resolve(__dirname, '..', 'mockExtensions'),
  },
  'rate-limit': {
    options: { interval: { min: 1 }, max: 10000 },
  },
  'enforce-https': {
    enabled: false,
  },
  auth: {
    enabled: false,
  },
  port: faker.datatype.number({ min: 20000, max: 30000 }),
};
