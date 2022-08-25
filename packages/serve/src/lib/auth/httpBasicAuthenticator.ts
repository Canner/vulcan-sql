import * as fs from 'fs';
import * as readline from 'readline';
import md5 from 'apache-md5';
import {
  BaseAuthenticator,
  KoaContext,
  AuthStatus,
  AuthResult,
} from '@vulcan-sql/serve/models';
import { VulcanExtensionId, VulcanInternalExtension } from '@vulcan-sql/core';

interface AuthUserOptions {
  /* user name */
  name: string;
  /* the user attribute which could used after auth successful */
  attr: { [field: string]: string | boolean | number };
}

interface PasswordFileOptions {
  /** password file path */
  ['path']: string;
  /** each user information */
  ['users']: Array<AuthUserOptions>;
}

interface TokenListOptions {
  /* user name */
  name: string;
  /* hashed password by apache md5 */
  hashPassword: string;
  /* the user attribute which could used after auth successful */
  attr: { [field: string]: string | boolean | number };
}

export interface BasicOptions {
  ['password-file']?: PasswordFileOptions;
  ['token-users']?: Array<TokenListOptions>;
}

type UserCredentialsMap = {
  [name: string]: {
    /* hashed password by apache md5 */
    hashPassword: string;
    /* the user attribute which could used after auth successful */
    attr: { [field: string]: string | boolean | number };
  };
};

/** The http basic authenticator  */
@VulcanInternalExtension()
@VulcanExtensionId('basic')
export class BasicAuthenticator extends BaseAuthenticator<BasicOptions> {
  private usersCredentials: UserCredentialsMap = {};
  private options: BasicOptions = {};
  /** read basic options to initialize and load user credentials */
  public override async onActivate() {
    this.options = (this.getOptions() as BasicOptions) || this.options;
    // load "token-users" in options
    for (const option of this.options['token-users'] || []) {
      const { name, hashPassword, attr } = option;
      this.isMD5Hashed(hashPassword);
      this.usersCredentials[name] = { hashPassword, attr };
    }
    // load "password-file" in options
    if (!this.options['password-file']) return;
    const { path, users } = this.options['password-file'];

    if (!fs.existsSync(path) || !fs.statSync(path).isFile()) return;
    const reader = readline.createInterface({
      input: fs.createReadStream(path),
    });
    // username:hashPassword
    for await (const line of reader) {
      const name = line.split(':')[0] || '';
      const hashPassword = line.split(':')[1] || '';
      this.isMD5Hashed(hashPassword);
      // if users exist the same name, add attr to here, or as empty
      this.usersCredentials[name] = {
        hashPassword,
        attr: users.find((user) => user.name === name)?.attr || {},
      };
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
    const bareToken = Buffer.from(token, 'base64').toString();

    try {
      return await this.verify(bareToken);
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

  private async verify(baredToken: string) {
    const username = baredToken.split(':')[0] || '';
    // bare password from Basic specification
    const password = baredToken.split(':')[1] || '';
    // if authenticated, return user data
    if (
      !(username in this.usersCredentials) ||
      !(md5(password) === this.usersCredentials[username].hashPassword)
    )
      throw new Error(
        `authenticate user by ${this.getExtensionId()} type failed.`
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

  private isMD5Hashed(value: string) {
    if (!value.startsWith('$apr1$'))
      throw new Error(`"${this.getExtensionId()}" type must hash apache md5.`);
  }
}
