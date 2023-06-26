# extension-authenticator-canner

This extension make Data API(VulcanSQL API) can integrate with [Canner Enterprise](https://cannerdata.com/product) and use Canner as a authenticate server

This extension let Data API request can be authenticated with [Canner PAT](https://docs.cannerdata.com/product/api_sdk/api_personal_access_token)

## Install

1. Install package

   ```sql
   npm i @vulcan-sql/extension-authenticator-canner
   ```

2. Update `vulcan.yaml`, enable the extension and enable the `auth` configuration.

   ```yaml
   auth:
     enabled: true
     # The extension-authenticator-canner and [build-in authenticator](https://vulcansql.com/docs/data-privacy/authn) can work at the same time

   extensions:
     canner-authenticator: '@vulcan-sql/extension-authenticator-canner'
   ```

3. Update `vulcan.yaml`, define your `canner-authenticator`
   ```yaml
   canner-authenticator:
     # To having the same config structure to the authenticator middleware, we need to put options under "options".
     options:
       canner-pat:
         # your canner enterprise host
         host: 'my-canner-host-dns'
         # your canner enterprise port
         port: 443
         # indicate using http or https default is false
         ssl: true
   ```
