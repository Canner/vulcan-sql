# extension-driver-redshift

[@aws-sdk/client-redshift-data](https://www.npmjs.com/package/@aws-sdk/client-redshift-data) driver for VulcanSQL.

reference: https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-redshift-data

## Install

1. Install package

  ```bash
  npm i @vulcan-sql/extension-driver-redshift
  ```

2. Update `vulcan.yaml`, enable the extension.

  ```yaml
  extensions:
    redshift: '@vulcan-sql/extension-driver-redshift'
  ```

3. Create a new profile in `profiles.yaml` or in your profiles' paths.

```yaml
- name: redshift # profile name
  type: redshift
  allow: "*"
  connection:
    # please see the type definition of RedshiftDataClientConfig
    # https://github.com/aws/aws-sdk-js-v3/blob/29056f4ca545f7e5cf951b915bb52178305fc305/clients/client-redshift-data/src/RedshiftDataClient.ts#L253C18-L253C42
    credentials:
      accessKeyId: <REDSHIFT_ACCESS_KEY_ID>
      secretAccessKey: <REDSHIFT_SECRET_ACCESS_KEY>
    # please see the type definition of ExecuteStatementCommandInput(omit Sql and Parameters)
    # https://github.com/aws/aws-sdk-js-v3/blob/29056f4ca545f7e5cf951b915bb52178305fc305/clients/client-redshift-data/src/models/models_0.ts#L805C18-L805C39
    Database: <REDSHIFT_DATABASE>
    WorkgroupName: <REDSHIFT_WORKGROUP_NAME>
```

## Testing

```bash
nx test extension-driver-redshift
```

This library was generated with [Nx](https://nx.dev).

To run test, the following environment variables are required:

- REDSHIFT_ACCESS_KEY_ID
- REDSHIFT_SECRET_ACCESS_KEY
- REDSHIFT_DATABASE
- REDSHIFT_WORKGROUP_NAME
