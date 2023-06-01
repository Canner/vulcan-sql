export interface CannerStoreConfig {
  storage: StorageServiceOptions;
  profiles: string[];
}

export interface StorageServiceOptions {
  provider?: string;
  // MINIO Provider options
  minioUrl?: string;
  minioSSL?: boolean;
  minioPort?: number;
  minioBucket?: string;
  minioAccessKey?: string;
  minioSecretKey?: string;
  /**
   * Azure Provider options: we still need to set some env @azure/identity needed.
   * Azure used the DefaultAzureCredential to create credentials beside the below options need declare.
   * You could also refer https://github.com/Canner/canner-storage for some part way from env.
   * Otherwise, you could also see full different way to create credentials from https://www.npmjs.com/package/@azure/identity.
   * */
  azureBucket?: string;
  azureAccountName?: string;
  /**
   * AWS Provider options: we still need to set some env AWS SDK needed.
   * AWS used the CredentialProviderChain to create credentials beside the below options need declare.
   * Please refer to our @canner/canner-storage for details: https://github.com/Canner/canner-storage
   */
  awsBucket?: string;
  /**
   * GCP Provider options: we still need to set some env GCP SDK needed
   * GCP used the GoogleAuth to create auth beside the below options need declare.
   * Please refer https://github.com/googleapis/google-api-nodejs-client#authentication-and-authorization to set credentials files path by "GOOGLE_APPLICATION_CREDENTIALS" env
   * Or you could also use another env "GCP_KEY_FILE_PATH" by referring https://github.com/Canner/canner-storage
   */
  gcpBucket?: string;
}

/**
 * Get canner persistence store used environment variable config
 * @returns CannerStoreConfig
 */
export const getEnvConfig = (): CannerStoreConfig => {
  // Get the config from env, because the a lot of settings for storage service needed from env e.g: AWS, GCP, AZURE of their SDK.
  return {
    profiles: process.env['CANNER_STORE_ARTIFACTS_PROFILES']?.split(',') || [
      'canner',
    ],
    storage: {
      provider: process.env['CANNER_STORAGE_PROVIDER'],
      // MINIO Provider options
      minioSSL: process.env['MINIO_SSL'] === 'true',
      minioUrl: process.env['MINIO_URL'],
      minioPort: Number(process.env['MINIO_PORT']) || 9000,
      minioBucket: process.env['MINIO_BUCKET'],
      minioAccessKey: process.env['MINIO_ACCESS_KEY'],
      minioSecretKey: process.env['MINIO_SECRET_KEY'],
      // Azure Provider options
      azureBucket: process.env['AZURE_BUCKET_NAME'],
      azureAccountName: process.env['AZURE_STORAGE_ACCOUNT_NAME'],
      // AWS Provider options
      awsBucket: process.env['AWS_BUCKET_NAME'],
      // GCP Provider options
      gcpBucket: process.env['GCP_BUCKET_NAME'],
    } as StorageServiceOptions,
  };
};