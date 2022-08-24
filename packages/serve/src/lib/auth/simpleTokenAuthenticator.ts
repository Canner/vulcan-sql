import {
  BaseAuthenticator,
  KoaContext,
  AuthResult,
  AuthStatus,
} from '@vulcan-sql/serve/models';
import { VulcanExtensionId, VulcanInternalExtension } from '@vulcan-sql/core';
import isBase64 = require('is-base64');

export type SimpleTokenOptions = Array<{
  /* user name */
  name: string;
  /* token value */
  token: string;
  /* the user attribute which could used after auth successful */
  attr: { [field: string]: string | boolean | number };
}>;

type UserCredentialsMap = {
  /* token value */
  [token: string]: {
    name: string;
    /* the user attribute which could used after auth successful */
    attr: { [field: string]: string | boolean | number };
  };
};

/** The simple-token authenticator  */
@VulcanInternalExtension()
@VulcanExtensionId('simple-token')
export class SimpleTokenAuthenticator extends BaseAuthenticator<SimpleTokenOptions> {
  private options: SimpleTokenOptions = [];
  private usersCredentials: UserCredentialsMap = {};
  /** read simple-token and users info to initialize user credentials */
  public override async onActivate() {
    this.options = (this.getOptions() as SimpleTokenOptions) || this.options;
    for (const option of this.options) {
      const { name, token, attr } = option;
      if (!isBase64(token))
        throw new Error(`"${this.getExtensionId()!}" type must encode base64.`);
      this.usersCredentials[token] = { name, attr };
    }
  }

  public async authenticate(context: KoaContext) {
    const authRequest = context.request.headers['authorization'];
    if (
      !authRequest ||
      !authRequest.toLowerCase().startsWith(this.getExtensionId()!)
    )
      return {
        status: AuthStatus.INCORRECT,
        type: this.getExtensionId()!,
      };
    // validate request auth token
    const token = authRequest.trim().split(' ')[1];
    try {
      return await this.verify(token);
    } catch (err) {
      // if not found matched user credential, return failed
      return {
        status: AuthStatus.FAIL,
        type: this.getExtensionId()!,
        message: (err as Error).message,
      };
    }
  }
  private async verify(base64Token: string) {
    // if authenticated
    if (!(base64Token in this.usersCredentials))
      throw new Error(
        `authenticate user by ${this.getExtensionId()} type authentication failed.`
      );

    return {
      status: AuthStatus.SUCCESS,
      type: this.getExtensionId()!, // method name
      user: {
        name: this.usersCredentials[base64Token].name,
        attr: this.usersCredentials[base64Token].attr,
      },
    } as AuthResult;
  }
}
