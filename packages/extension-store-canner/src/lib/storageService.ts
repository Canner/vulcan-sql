import {
  AzureStorageOption,
  GCPStorageOption,
  AWSStorageOption,
  MinioStorageOption,
  CloudProvider,
  getStorageService,
} from '@canner/canner-storage';
import { DefaultAzureCredential } from '@azure/identity';
import { google } from 'googleapis';
import { CredentialProviderChain } from 'aws-sdk';
import { StorageServiceOptions } from './config';

// Create a factory to get storage service by environment variables.
export const createStorageService = async (options: StorageServiceOptions) => {
  const { provider } = options;
  if (!provider) throw new Error('Provider options is required!');

  // check and throw error to exclude all not value of cloud provider
  if (!(provider in CloudProvider))
    throw new Error(
      `Provider should be ${Object.keys(CloudProvider).join(',')}`
    );
  // other options will be checked when creating storage service by "getStorageService" function
  const storageService = await getStorageServiceMapper[provider!](options);
  return storageService;
};

// define a mapper to get storage service by config provider value
const getStorageServiceMapper = {
  [CloudProvider.MINIO.toString()]: async (options: StorageServiceOptions) => {
    return getStorageService({
      cloudProvider: CloudProvider.MINIO,
      endPoint: options.minioUrl!,
      port: options.minioPort!,
      useSSL: options.minioSSL!,
      accessKey: options.minioAccessKey!,
      secretKey: options.minioSecretKey!,
      bucket: options.minioBucket!,
    } as MinioStorageOption);
  },
  [CloudProvider.AWS.toString()]: async (options: StorageServiceOptions) => {
    const credentialProviderChain = new CredentialProviderChain();
    const masterCredentials = await credentialProviderChain.resolvePromise();
    return getStorageService({
      cloudProvider: CloudProvider.AWS,
      credentials: masterCredentials,
      bucket: options.awsBucket!,
    } as AWSStorageOption);
  },
  [CloudProvider.GCP.toString()]: async (options: StorageServiceOptions) => {
    const auth = await new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    return getStorageService({
      cloudProvider: CloudProvider.GCP,
      bucket: options.gcpBucket!,
      // The reason to use any type for auth, reference: https://github.com/googleapis/nodejs-storage/issues/1284#issuecomment-768004492
      auth: auth as any,
    } as GCPStorageOption);
  },
  [CloudProvider.AZURE.toString()]: async (options: StorageServiceOptions) => {
    const defaultAzureCredential = new DefaultAzureCredential();
    return getStorageService({
      cloudProvider: CloudProvider.AZURE,
      credential: defaultAzureCredential,
      accountName: options.azureAccountName!,
      bucket: options.azureBucket!,
    } as AzureStorageOption);
  },
};
