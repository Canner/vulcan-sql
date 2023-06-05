export * from './simpleTokenAuthenticator';
export * from './passwordFileAuthenticator';
export * from './httpBasicAuthenticator';
export * from './cannerPATAuthenticator';

import { SimpleTokenAuthenticator } from './simpleTokenAuthenticator';
import { PasswordFileAuthenticator } from './passwordFileAuthenticator';
import { BasicAuthenticator } from './httpBasicAuthenticator';
import { CannerPATAuthenticator } from './cannerPATAuthenticator';

export const BuiltInAuthenticators = [
  BasicAuthenticator,
  SimpleTokenAuthenticator,
  PasswordFileAuthenticator,
  CannerPATAuthenticator,
];
