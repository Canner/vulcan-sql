import * as path from 'path';
import { CacheFileInfo, ConfigurationError } from '@vulcan-sql/core';
import { FileCacheLayerProvider } from '@vulcan-sql/core';

it('File data cache provider should provide correct files and contents', async () => {
  // Arrange
  const provider = new FileCacheLayerProvider(
    {
      provider: '',
      folderPath: path.resolve(__dirname, '../test-data-caches') as any,
      loader: '',
    },
    {},
    ''
  );
  const files: CacheFileInfo[] = [];
  // Act
  for await (const file of provider.getFiles()) {
    files.push(file);
  }
  // Assert
  expect(files.length).toBe(3);
  expect(files).toContainEqual({
    name: 'customer.parquet',
    path: path.resolve(__dirname, '../test-data-caches/customer.parquet'),
  });
  expect(files).toContainEqual({
    name: 'orders.parquet',
    path: path.resolve(__dirname, '../test-data-caches/orders.parquet'),
  });
  expect(files).toContainEqual({
    name: 'sub-folders/supplier.parquet',
    path: path.resolve(
      __dirname,
      '../test-data-caches/sub-folders/supplier.parquet'
    ),
  });
});

it('Should throw an configuration error when provide incorrect content in File data cache provider', async () => {
  // Arrange

  const provider = new FileCacheLayerProvider(
    {
      provider: '',
      folderPath: '',
      loader: '',
    },
    {},
    ''
  );

  // Act
  const iter = provider.getFiles();
  // Assert
  await expect(iter.next()).rejects.toThrow(
    new ConfigurationError('Config dataCache.folderPath is required')
  );
});
