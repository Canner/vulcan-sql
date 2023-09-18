// name: pg-admin # required. the name of this profile
//   type: pg # required. which driver we should use
//   connection: connection info, which depends on drivers
//     host: example.com
//     username: vulcan
//     password: xxxx
//     allow:
//       - name: admin

export type ProfileAllowConstraints =
  // allow: *
  | string
  // allow:
  //   name: admin
  | Record<string, any>
  // allow:
  //    - admin
  //    - name: admin
  | Array<string | Record<string, any>>;

export interface Profile<C = Record<string, any>> {
  /** This unique name of this profile */
  name: string;
  /** Which driver we should use */
  type: string;
  /** Connection info, which depends on drivers */
  connection?: C;
  /** Cache Layer setting parameters, which depends on drivers */
  cache?: C;
  /** What users have access to this profile */
  allow: ProfileAllowConstraints;
  /** Properties that can be used when involking the dataSource method */
  properties?: Record<string, any>;
}

// profile : by connection/pool/client setting 的變動
// vulcan.yaml: by project 設定
// api.yaml: by api/cache 執行設定

// => use additional information when refreshing cache
// => the userId changed by each api
// => the root_user_id changed by project
