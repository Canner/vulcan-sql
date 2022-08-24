import { VulcanExtension, ExtensionBase } from '@vulcan-sql/core';
import { KoaContext } from '@vulcan-sql/serve/models';
import { TYPES } from '../../containers/types';

export interface AuthUserInfo {
  name: string;
  attr: {
    [field: string]: string | boolean | number;
  };
}

export enum AuthStatus {
  /**
   * SUCCESS: Request format correct and match the one of user credentials
   * INCORRECT: Request format is incorrect for authenticator needed, skip and check next authenticator
   * FAIL: Request format correct, but not match the user credentials
   */
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  INCORRECT = 'INCORRECT',
}
export interface AuthResult {
  status: AuthStatus;
  /* auth type */
  type: string;
  /* auth result message */
  message?: string;
  user?: AuthUserInfo;
  [key: string]: any;
}

export interface IAuthenticator {
  authenticate(context: KoaContext): Promise<AuthResult>;
}

@VulcanExtension(TYPES.Extension_Authenticator, { enforcedId: true })
export abstract class BaseAuthenticator<AuthTypeOption>
  extends ExtensionBase
  implements IAuthenticator
{
  public abstract authenticate(context: KoaContext): Promise<AuthResult>;

  protected getOptions(): AuthTypeOption | undefined {
    if (this.getConfig())
      return this.getConfig()?.['options'][
        this.getExtensionId()!
      ] as AuthTypeOption;
    return undefined;
  }
}
