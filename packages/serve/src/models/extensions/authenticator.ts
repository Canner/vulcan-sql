import { VulcanExtension, ExtensionBase } from '@vulcan-sql/core';
import { KoaContext } from '@vulcan-sql/serve/models';
import { TYPES } from '../../containers/types';

export enum AuthType {
  Basic = 'basic',
  PasswordFile = 'password-file',
  SimpleToken = 'simple-token',
  CannerPAT = 'canner-pat',
}

export interface AuthUserInfo {
  name: string;
  attr: {
    [field: string]: string | boolean | number | any[];
  };
}

export enum AuthStatus {
  /**
   * SUCCESS: Request format correct and match the one of user credentials
   * INDETERMINATE: Request format is unclear for authenticator needed, skip and check next authenticator
   * FAIL: Request format correct, but not match the user credentials
   */
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  INDETERMINATE = 'INDETERMINATE',
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
  /** get token related information */
  getTokenInfo(context: KoaContext): Promise<any>;
  /** auth credential (e.g: token) to get user info  */
  authCredential(context: KoaContext): Promise<AuthResult>;
}

@VulcanExtension(TYPES.Extension_Authenticator, { enforcedId: true })
export abstract class BaseAuthenticator<AuthTypeOption>
  extends ExtensionBase
  implements IAuthenticator
{
  public abstract getTokenInfo(
    context: KoaContext
  ): Promise<Record<string, any>>;
  public abstract authCredential(context: KoaContext): Promise<AuthResult>;

  protected getOptions(): AuthTypeOption | undefined {
    if (!this.getConfig()) return undefined;
    if (!this.getConfig()['options']) return undefined;
    const options = this.getConfig()['options'][
      this.getExtensionId()!
    ] as AuthTypeOption;

    return options;
  }
}
