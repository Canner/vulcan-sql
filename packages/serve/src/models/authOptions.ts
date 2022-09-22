export interface AuthOptions {
  // different auth type settings
  [authType: string]: any;
}

export interface AuthSourceOptions {
  // if not provide, default is "auth"
  key?: string;
  // if not provide, default is "QUERY"
  in?: string;
}

export enum AuthSourceTypes {
  QUERY = 'QUERY',
  PAYLOAD = 'PAYLOAD',
}
