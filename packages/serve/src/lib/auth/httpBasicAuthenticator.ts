import * as fs from 'fs';
import * as readline from 'readline';
import * as md5 from 'md5';
import {
  BaseAuthenticator,
  KoaContext,
  AuthStatus,
  AuthResult,
} from '@vulcan-sql/serve/models';
import { VulcanExtensionId, VulcanInternalExtension } from '@vulcan-sql/core';
import { isEmpty } from 'lodash';

interface AuthUserOptions {
  /* user name */
  name: string;
  /* the user attribute which could used after auth successful */
  attr: { [field: string]: string | boolean | number };
}

interface HTPasswdFileOptions {
  /** password file path */
  ['path']: string;
  /** each user information */
  ['users']?: Array<AuthUserOptions>;
}

export interface AuthUserListOptions {
  /* user name */
  name: string;
  /* hashed password by md5 */
  md5Password: string;
  /* the user attribute which could used after auth successful */
  attr: { [field: string]: string | boolean | number };
}

export interface BasicOptions {
  ['htpasswd-file']?: HTPasswdFileOptions;
  ['users-list']?: Array<AuthUserListOptions>;
}

type UserCredentialsMap = {
  [name: string]: {
    /* hashed password by md5 */
    md5Password: string;
    /* the user attribute which could used after auth successful */
    attr: { [field: string]: string | boolean | number };
  };
};

/** The http basic authenticator.
 *
 *  Able to set user credentials by file path through "htpasswd-file" or list directly in config by "users-list".
 *  The password must hash by md5 when setting into "htpasswd-file" or "users-list".
 *
 *  It authenticate by passing encode base64 {username}:{password} to authorization
 */
@VulcanInternalExtension('auth')
@VulcanExtensionId('basic')
export class BasicAuthenticator extends BaseAuthenticator<BasicOptions> {
  private usersCredentials: UserCredentialsMap = {};
  private options: BasicOptions = {};
  /** read basic options to initialize and load user credentials */
  public override async onActivate() {
    this.options = (this.getOptions() as BasicOptions) || this.options;
    // load "users-list" in options
    for (const option of this.options['users-list'] || []) {
      const { name, md5Password, attr } = option;
      this.usersCredentials[name] = { md5Password, attr };
    }
    // load "htpasswd-file" in options
    if (!this.options['htpasswd-file']) return;
    const { path, users } = this.options['htpasswd-file'];

    if (!fs.existsSync(path) || !fs.statSync(path).isFile()) return;
    const reader = readline.createInterface({
      input: fs.createReadStream(path),
    });
    // username:md5Password
    for await (const line of reader) {
      const name = line.split(':')[0] || '';
      const md5Password = line.split(':')[1] || '';
      // if users exist the same name, add attr to here, or as empty
      this.usersCredentials[name] = {
        md5Password,
        attr: users?.find((user) => user.name === name)?.attr || {},
      };
    }
  }

  public async getTokenInfo(ctx: KoaContext) {
    const username = ctx.request.query['username'] as string;
    const password = ctx.request.query['password'] as string;
    if (!username || !password)
      throw new Error('please provide "username" and "password".');

    const token = Buffer.from(`${username}:${password}`).toString('base64');

    return {
      token: token,
    };
  }

  public async authCredential(context: KoaContext) {
    const incorrect = {
      status: AuthStatus.INDETERMINATE,
      type: this.getExtensionId()!,
    };
    if (isEmpty(this.options)) return incorrect;

    const authorize = context.request.headers['authorization'];
    if (
      !authorize ||
      !authorize.toLowerCase().startsWith(this.getExtensionId()!)
    )
      return incorrect;

    // validate request auth token
    const token = authorize.trim().split(' ')[1];
    const bareToken = Buffer.from(token, 'base64').toString();

    try {
      return await this.validate(bareToken);
    } catch (err) {
      // if not found matched user credential, add WWW-Authenticate and return failed
      context.set('WWW-Authenticate', this.getExtensionId()!);
      return {
        status: AuthStatus.FAIL,
        type: this.getExtensionId()!,
        message: (err as Error).message,
      };
    }
  }

  private async validate(baredToken: string) {
    const username = baredToken.split(':')[0] || '';
    // bare password from Basic specification
    const password = baredToken.split(':')[1] || '';
    // if authenticated, return user data
    if (
      !(username in this.usersCredentials) ||
      !(md5(password) === this.usersCredentials[username].md5Password)
    )
      throw new Error(
        `authenticate user by "${this.getExtensionId()}" type failed.`
      );

    return {
      status: AuthStatus.SUCCESS,
      type: this.getExtensionId()!, // method name
      user: {
        name: username,
        attr: this.usersCredentials[username].attr,
      },
    } as AuthResult;
  }
}
