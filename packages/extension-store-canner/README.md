# extension-store-canner

The extension make VulcanSQL integrating with [Canner Enterprise](https://cannerdata.com/product).

The extension contains Canner persistence store to connect the storage of Canner Enterprise, and Canner profile reader to create a connecting Canner driver used profiles.

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

3. Update `vulcan.yaml` to make `artifact` use Canner persistence store be the provider to load data.

   ```yaml
   artifact:
     provider: Canner # Use Canner persistence store to be provider
     serializer: JSON
     filePath: <rootPath> # The root path for the canner storage
   ```

4. Update `vulcan.yaml` to make `profiles` use Canner profile reader to get profiles info.

   ```yaml
   profiles:
     - type: Canner # Use Canner profile reader to get profiles info
       options:
         path: <rootPath> # The root path for the canner storage
   ```

## Set environment variables to connect Canner Enterprise for Integration

For integrating to Canner Enterprise, there are two parts environment variables need to set:

1. Canner Enterprise driver.
2. Connect Canner Enterprise used storage.

### Canner Enterprise driver

Here the Canner Enterprise driver means the `@vulcan-sql/extension-driver-canner`.

The environments variables may used to be the partly connection information for `@vulcan-sql/extension-driver-canner` needed profiles options.

Need to set by environment variables to make Canner Enterprise driver work if the `profiles` options of the Canner Enterprise driver not created by hand in `profiles.yaml`.

```bash
# The user to canner connect canner enterprise driver, default is canner.
export PROFILE_CANNER_DRIVER_USERNAME=<username>
# Password to connect to canner enterprise driver. should be the user PAT
export PROFILE_CANNER_DRIVER_PASSWORD=<password>
# Canner enterprise driver host.
export PROFILE_CANNER_DRIVER_HOST=<host>
# Canner enterprise driver port, the default is 7432
export PROFILE_CANNER_DRIVER_PORT=<port>
```

### Connect Canner Enterprise used storage.

Canner Enterprise use different type storage to keep data when deploying to different environment. (Azure, AWS, GCP cloud or standalone).

#### Connect to MINIO Storage

When Canner Enterprise deployed on standalone, canner used MINIO storage, so please set connecting MINIO storage needed environments

```bash
export STORAGE_PROVIDER=MINIO
# Optional, default is false
export MINIO_SSL=<true-or-false>
export MINIO_URL=<minio-url>
# Optional, default is 9000
export MINIO_PORT=<minio-port>
export MINIO_BUCKET=<minio-bucket-name>
export MINIO_ACCESS_KEY=<minio-access-key>
export MINIO_SECRET_KEY=<minio-secret-key>
```

#### Connect to AWS S3 Storage

When Canner Enterprise deployed on AWS, canner used S3 storage, so please set connecting S3 storage needed environments

```bash
export STORAGE_PROVIDER=AWS
export AWS_BUCKET_NAME=<aws-bucket-name>
export AWS_ACCESS_KEY_ID=<aws-access-key-id>
export AWS_SECRET_ACCESS_KEY=<aws-secret-access-key>
```

#### Connect to Azure Blob Storage

When Canner Enterprise deployed on Azure, canner used Azure Blob storage, so please set connecting Azure Blob storage needed environments

```bash
export STORAGE_PROVIDER=AZURE
export AZURE_TENANT_ID=<azure-tenant-id>
export AZURE_CLIENT_ID=<azure-client-id>
export AZURE_CLIENT_SECRET=<azure-client-secret>
export AZURE_STORAGE_ACCOUNT_NAME=<azure-storage-account-name>
export AZURE_BUCKET_NAME=<bucket-name-in-the-storage-account-name>
```

### Connect to GCP Storage

When Canner Enterprise deployed on GCP, canner used GCP storage, so please set connecting GCP storage needed environments

```bash
export STORAGE_PROVIDER=GCP
export GCP_BUCKET_NAME=<gcp-storage-bucket-name>
# Suggest to use the absolute path, or you could provide the related path in your project
export GOOGLE_APPLICATION_CREDENTIALS=<credentials-file-path-location>
```
