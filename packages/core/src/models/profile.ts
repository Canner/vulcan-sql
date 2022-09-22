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
  /** What users have access to this profile */
  allow: ProfileAllowConstraints;
}
