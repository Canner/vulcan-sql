import { BuildPipeline } from '../../src';
import * as path from 'path';

it('Default pipeline should build artifacts correctly', async () => {
  // Arrange
  const pipeline = BuildPipeline.default({
    sourceFolderPath: path.resolve(__dirname, 'source'),
    destinationFilePath: path.resolve(__dirname, 'result.json'),
  });
  // Act, Assert
  await expect(pipeline.build()).resolves.not.toThrow();
});
