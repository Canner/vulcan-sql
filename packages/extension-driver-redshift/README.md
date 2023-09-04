# extension-driver-redshift

[@aws-sdk/client-redshift-data](https://www.npmjs.com/package/@aws-sdk/client-redshift-data) driver for VulcanSQL.

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
  connection:
  allow: "*"
  connection:
    credentials:
      accessKeyId: <REDSHIFT_ACCESS_KEY_ID>
      secretAccessKey: <REDSHIFT_SECRET_ACCESS_KEY>
    region: <REDSHIFT_REGION>
    database: <REDSHIFT_DATABASE>
    workgroupName: <REDSHIFT_WORKGROUP_NAME>
```

## Testing

```bash
nx test extension-driver-redshift
```

This library was generated with [Nx](https://nx.dev).

To run test, the following environment variables are required:

- REDSHIFT_ACCESS_KEY_ID
- REDSHIFT_SECRET_ACCESS_KEY
- REDSHIFT_REGION
- REDSHIFT_DATABASE
- REDSHIFT_WORKGROUP_NAME
