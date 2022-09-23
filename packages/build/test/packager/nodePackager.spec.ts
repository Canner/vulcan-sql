import { ArtifactBuilderProviderType } from '@vulcan-sql/core';
import { NodePackager } from '../../src/lib/packager';
import * as fs from 'fs';

it('NodePackager should create package.json, config.json, index.js, and result.json', async () => {
  // Arrange
  process.chdir(__dirname);
  const nodePackager = new NodePackager(
    {
      folderPath: 'dist-node',
    },
    ''
  );
  const options: any = {
    artifact: {
      provider: ArtifactBuilderProviderType.LocalFile,
      filePath: 'result.json',
    },
  };
  // Act
  await nodePackager.package(options);
  const result = fs.readdirSync('dist-node');
  // Assert
  expect(result.length).toBe(4);
});
