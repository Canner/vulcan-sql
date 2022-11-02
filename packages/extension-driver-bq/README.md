# extension-driver-bq

[nodejs-bigquery](https://cloud.google.com/nodejs/docs/reference/bigquery/latest) driver for Vulcan SQL.

## Install

1. Install package

   ```sql
   npm i @vulcan-sql/extension-driver-bq
   ```

2. Update `vulcan.yaml`, enable the extension.

   ```yaml
   extensions:
     bq: '@vulcan-sql/extension-driver-bq'
   ```

3. Create a new profile in `profiles.yaml` or in your profiles' paths.

> ⚠️ Your service account must have the following permissions to successfully execute queries...
>
> - BigQuery Data Viewer
> - BigQuery Job User

```yaml
- name: bq # profile name
  type: bq
  connection:
    # Location must match that of the dataset(s) referenced in the query.
    location: US
    # Optional: The max rows we should fetch once.
    chunkSize: 100
    # The project ID from the Google Developer's Console, e.g. 'grape-spaceship-123'. We will also check the environment variable `GCLOUD_PROJECT` for your project ID. If your app is running in an environment which [supports](https://cloud.google.com/docs/authentication/production#providing_credentials_to_your_application Application Default Credentials), your project ID will be detected.
    projectId: 'your-project-id'
    # Full path to the a .json, .pem, or .p12 key downloaded from the Google Developers Console. If you provide a path to a JSON file, the `projectId` option above is not necessary. NOTE: .pem and .p12 require you to specify the `email` option as well.
    keyFilename: '/path/to/keyfile.json'
```

## Testing

```bash
nx test extension-driver-bq
```

This library was generated with [Nx](https://nx.dev).

To run test, the following environment variables are required:

- BQ_LOCATION
- BQ_PROJECT_ID
- BQ_CLIENT_EMAIL
- BQ_PRIVATE_KEY
