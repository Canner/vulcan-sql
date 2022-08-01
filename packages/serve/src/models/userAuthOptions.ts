export interface AuthInfoOptions {
  /** auth method */
  method: string;
  /** other fields, e.g: access key, credential ... */
  [field: string]: string | boolean | number;
}

export interface UserAuthOptions {
  name: string;
  auth: AuthInfoOptions;
  attr: { [field: string]: string | boolean | number };
}
