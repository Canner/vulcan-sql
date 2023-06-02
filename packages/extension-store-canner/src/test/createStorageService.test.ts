import { CloudProvider } from '@canner/canner-storage';
import { createStorageService } from '../lib/storageService';
import { StorageServiceOptions, getEnvConfig } from '../lib/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

// suppress the warning message from aws-sdk: Please migrate your code to use AWS SDK for JavaScript (v3).
// since in aws-sdk, they only check if AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE exists, but not the value
// setting it to a string value of 1 should work
process.env['AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE'] = '1';

// support reading the env from .env file if exited when running test case
dotenv.config({ path: path.resolve(__dirname, '.env') });
const config = getEnvConfig();

it('Should create failed when "provider" options is not provided by env', async () => {
  // Arrange
  const options = {
    provider: undefined,
  } as StorageServiceOptions;
  // Act, Assert
  await expect(createStorageService(options)).rejects.toThrowError(
    'Provider options is required!'
  );
});
it('Should create failed when "provider" options is not supported', async () => {
  // Arrange
  const options = {
    provider: 'not-supported-provider',
  } as StorageServiceOptions;
  // Act, Assert
  await expect(createStorageService(options)).rejects.toThrowError(
    `Provider should be ${Object.keys(CloudProvider).join(',')}`
  );
});

it('Should create storage service for connecting MINIO successfully when provider MINIO needed options', async () => {
  // Arrange, the field of config.storage from environment variables
  const options = {
    provider: CloudProvider.MINIO,
    minioSSL: config.storage.minioSSL!,
    minioUrl: config.storage.minioUrl!,
    minioPort: config.storage.minioPort!,
    minioBucket: config.storage.minioBucket!,
    minioAccessKey: config.storage.minioAccessKey!,
    minioSecretKey: config.storage.minioSecretKey!,
  } as StorageServiceOptions;
  // Act
  const storageService = await createStorageService(options);
  // Assert
  await expect(
    storageService.listObjects({ path: '/' })
  ).resolves.not.toThrow();
});

it('Should create storage service for connecting AZURE successfully when provider AZURE needed options', async () => {
  // Arrange
  const options = {
    provider: CloudProvider.AZURE,
    // You should assign other environment variables not belong to config.storage, please see comment in the getEnvConfig() function.
    azureBucket: config.storage.azureBucket!,
    azureAccountName: config.storage.azureAccountName!,
  } as StorageServiceOptions;
  // Act
  const storageService = await createStorageService(options);
  // Assert
  await expect(
    storageService.listObjects({ path: '/' })
  ).resolves.not.toThrow();
});

it('Should create AWS storage service for connecting AWS successfully when provider AWS needed options', async () => {
  // Arrange
  const options = {
    provider: CloudProvider.AWS,
    // You should assign other environment variables not belong to config.storage, please see comment in the getEnvConfig() function.
    awsBucket: config.storage.awsBucket!,
  } as StorageServiceOptions;
  // Act
  const storageService = await createStorageService(options);
  // Assert
  await expect(
    storageService.listObjects({ path: '/' })
  ).resolves.not.toThrow();
});
it('Should create GCP storage service for connecting GCP successfully when provider GCP needed options', async () => {
  // Arrange
  const options = {
    provider: CloudProvider.GCP,
    // You should assign other environment variables not belong to config.storage, please see comment in the getEnvConfig() function.
    gcpBucket: config.storage.gcpBucket!,
  } as StorageServiceOptions;
  // Act
  const storageService = await createStorageService(options);
  // Assert
  await expect(
    storageService.listObjects({ path: '/' })
  ).resolves.not.toThrow();
});
