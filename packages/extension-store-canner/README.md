# extension-store-canner

The canner persistence store could allow VulcanSQL integrating with [Canner Enterprise](https://cannerdata.com/product).

## Install

1. Install package

   ```sql
   -- For getting to NPM Token, please contact with Canner Team to request, it needed for using the package
   export NPM_TOKEN=<token>
   npm i @vulcan-sql/extension-store-canner
   ```

2. Update `vulcan.yaml`, enable the extension.

   ```yaml
   extensions:
     canner-store: '@vulcan-sql/extension-store-canner'
   ```

3. Update `vulcan.yaml` to make `artifact` use canner persistence store loading data.

   ```yaml
   artifact:
     provider: Canner # use canner persistence store to be provider
     serializer: JSON
     filePath: 000000-0000-0000-000000 # The canner root path
   ```

## Set environment variables to connect Canner Enterprise for Integration

For integrating to Canner Enterprise, need to connect Canner Enterprise used storage.

Canner Enterprise use different type storage to keep data when deploying to different environment. (Azure, AWS, GCP cloud or standalone).

### Canner Enterprise deployed on Standalone

When Canner Enterprise deployed on standalone, canner used MINIO storage, so please set connecting MINIO storage needed environments

```bash
export CANNER_STORAGE_PROVIDER=MINIO
# Optional, default is false
export MINIO_SSL=<true-or-false>
export MINIO_URL=<minio-url>
# Optional, default is 9000
export MINIO_PORT=<minio-port>
export MINIO_BUCKET=<minio-bucket-name>
export MINIO_ACCESS_KEY=<minio-access-key>
export MINIO_SECRET_KEY=<minio-secret-key>
```

### Connect to AWS S3 Storage

When Canner Enterprise deployed on AWS, canner used S3 storage, so please set connecting S3 storage needed environments

```bash
export CANNER_STORAGE_PROVIDER=AWS
export AWS_BUCKET_NAME=<aws-bucket-name>
export AWS_ACCESS_KEY_ID=<aws-access-key-id>
export AWS_SECRET_ACCESS_KEY=<aws-secret-access-key>
```

### Connect to Azure Blob Storage

When Canner Enterprise deployed on Azure, canner used Azure Blob storage, so please set connecting Azure Blob storage needed environments

```bash
export CANNER_STORAGE_PROVIDER=AZURE
export AZURE_TENANT_ID=<azure-tenant-id>
export AZURE_CLIENT_ID=<azure-client-id>
export AZURE_CLIENT_SECRET=<azure-client-secret>
export AZURE_STORAGE_ACCOUNT_NAME=<azure-storage-account-name>
export AZURE_BUCKET_NAME=<bucket-name-in-the-storage-account-name>
```

### Connect to GCP Storage

When Canner Enterprise deployed on GCP, canner used GCP storage, so please set connecting GCP storage needed environments

```bash
export CANNER_STORAGE_PROVIDER=GCP
export GCP_BUCKET_NAME=<gcp-storage-bucket-name>
# Suggest to use the absolute path, or you could provide the related path in your project
export GOOGLE_APPLICATION_CREDENTIALS=<credentials-file-path-location>
```
