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

3. Create a new profile in `profiles.yaml` or in your profiles' paths. For example if you are using Redshift Serverless:

```yaml
- name: redshift # profile name
  type: redshift
  allow: "*"
  connection:
    # please see the type definition of RedshiftDataClientConfig
    # https://github.com/aws/aws-sdk-js-v3/blob/29056f4ca545f7e5cf951b915bb52178305fc305/clients/client-redshift-data/src/RedshiftDataClient.ts#L253C18-L253C42
    credentials:
      accessKeyId: <AWS_ACCESS_KEY_ID>
      secretAccessKey: <AWS_SECRET_ACCESS_KEY>
    # please see the type definition of ExecuteStatementCommandInput(omit Sql and Parameters)
    # https://github.com/aws/aws-sdk-js-v3/blob/29056f4ca545f7e5cf951b915bb52178305fc305/clients/client-redshift-data/src/models/models_0.ts#L805C18-L805C39
    Database: <AWS_REDSHIFT_DATABASE>
    WorkgroupName: <AWS_REDSHIFT_WORKGROUP_NAME>
```

## Testing

```bash
nx test extension-driver-redshift
```

This library was generated with [Nx](https://nx.dev).

To run test, the following environment variables are required:

- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REDSHIFT_DATABASE
- AWS_REDSHIFT_WORKGROUP_NAME

To enable the test for `test/redshiftDataSource.spec.ts`:
- remove `.skip` inside `test/redshiftDataSource.spec.ts` to enable the test.
- remove `/* istanbul ignore file */` in the `test/redshiftDataSource.spec.ts`

Local Testing Success Message:(Since the tests run in CI are disabled, so I paste the local testing result here!)

```bash
 PASS   extension-driver-redshift  packages/extension-driver-redshift/test/redshiftDataSource.spec.ts (41.595 s)

Test Suites: 2 passed, 2 total
Tests:       15 passed, 15 total
Snapshots:   0 total
Time:        42.048 s
Ran all test suites.

 —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 >  NX   Successfully ran target test for project extension-driver-redshift


✨  Done in 44.39s.
```