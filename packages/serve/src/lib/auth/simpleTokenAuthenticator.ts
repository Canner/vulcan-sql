import {
  BaseAuthenticator,
  KoaContext,
  AuthResult,
  AuthStatus,
  AuthType,
} from '@vulcan-sql/serve/models';
import {
  UserError,
  VulcanExtensionId,
  VulcanInternalExtension,
} from '@vulcan-sql/core';
import { isEmpty } from 'lodash';
import 'koa-bodyparser';

export type SimpleTokenOptions = Array<{
  /* user name */
  name: string;
  /* token value, could be any format */
  token: string;
  /* the user attribute which could used after auth successful */
  attr: { [field: string]: string | boolean | number };
}>;

type UserCredentialsMap = {
  /* token value, could be any format */
  [token: string]: {
    name: string;
    /* the user attribute which could used after auth successful */
    attr: { [field: string]: string | boolean | number };
  };
};

/** The simple-token authenticator. setting the token and auth token directly to authorization.
 *
 * Token could be any format e.g: md5, base64 encode, sha..., but must set it in the token field of "simple-token" list too.
 *  */
@VulcanInternalExtension('auth')
@VulcanExtensionId(AuthType.SimpleToken)
export class SimpleTokenAuthenticator extends BaseAuthenticator<SimpleTokenOptions> {
  private options: SimpleTokenOptions = [];
  private usersCredentials: UserCredentialsMap = {};
  /** read simple-token and users info to initialize user credentials */
  public override async onActivate() {
    this.options = (this.getOptions() as SimpleTokenOptions) || this.options;
    for (const option of this.options) {
      const { name, token, attr } = option;
      this.usersCredentials[token] = { name, attr };
    }
  }

  public async getTokenInfo(ctx: KoaContext) {
    const token = ctx.request.body!['token'] as string;
    if (!token) throw new UserError('please provide "token".');

    return {
      token: token,
    };
  }

  public async authCredential(context: KoaContext) {
    const incorrect = {
      status: AuthStatus.INDETERMINATE,
      type: this.getExtensionId()!,
    };
    if (isEmpty(this.options) || !this.getOptions()) return incorrect;

    // validate request auth token
    const authorize = <string>context.request.headers['authorization'];
    const token = authorize.trim().split(' ')[1];
    try {
      return await this.validate(token);
    } catch (err) {
      // if not found matched user credential, return failed
      return {
        status: AuthStatus.FAIL,
        type: this.getExtensionId()!,
        message: (err as Error).message,
      };
    }
  }
  private async validate(token: string) {
    // if authenticated
    if (!(token in this.usersCredentials))
      throw new UserError(
        `authenticate user by "${this.getExtensionId()}" type failed.`
      );

    return {
      status: AuthStatus.SUCCESS,
      type: this.getExtensionId()!, // method name
      user: {
        name: this.usersCredentials[token].name,
        attr: this.usersCredentials[token].attr,
      },
    } as AuthResult;
  }
}
