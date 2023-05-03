import { ArtifactBuilderProviderType } from '@vulcan-sql/core';
import { DockerPackager } from '../../src/lib/packager';
import * as fs from 'fs';

it('DockerPackager should create package.json, config.json, index.js, result.json, and Dockerfile', async () => {
  // Arrange
  process.chdir(__dirname);
  const dockerPackager = new DockerPackager(
    {
      'vulcan-server': {
        folderPath: 'dist-docker',
      },
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
  await dockerPackager.package(options);
  const result = fs.readdirSync('dist-docker');
  // Assert
  expect(result.length).toBe(5);
});
