export * from './simpleTokenAuthenticator';
export * from './passwordFileAuthenticator';
export * from './httpBasicAuthenticator';

import { SimpleTokenAuthenticator } from './simpleTokenAuthenticator';
import { PasswordFileAuthenticator } from './passwordFileAuthenticator';
import { BasicAuthenticator } from './httpBasicAuthenticator';

export const BuiltInAuthenticators = [
  BasicAuthenticator,
  SimpleTokenAuthenticator,
  PasswordFileAuthenticator,
];
