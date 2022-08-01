import { VulcanExtension, ExtensionBase } from '@vulcan-sql/core';
import { KoaContext, UserAuthOptions } from '@vulcan-sql/serve/models';
import { TYPES } from '../../containers/types';

export interface AuthUserInfo {
  name: string;
  method: string;
  attr: {
    [field: string]: string | boolean | number;
  };
}

export interface AuthResult {
  authenticated: boolean;
  user?: AuthUserInfo;
}

export interface IAuthenticator {
  authenticate(
    usersOptions: Array<UserAuthOptions>,
    context: KoaContext
  ): Promise<AuthResult>;
}

@VulcanExtension(TYPES.Extension_Authenticator)
export abstract class BaseAuthenticator
  extends ExtensionBase
  implements IAuthenticator
{
  public abstract authenticate(
    usersOptions: Array<UserAuthOptions>,
    context: KoaContext
  ): Promise<AuthResult>;
}
