export interface AuthInfoOptions {
  /** auth method */
  method: string;
  /** other fields, e.g: access key, credential ... */
  [field: string]: string | boolean | number;
}

export interface UserAuthOptions {
  /* user name */
  name: string;
  /* auth method and credential */
  auth: AuthInfoOptions;
  /* the user attribute which could used after auth successful */
  attr: { [field: string]: string | boolean | number };
}
