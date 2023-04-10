import * as fs from 'fs';
import * as readline from 'readline';
import * as bcrypt from 'bcryptjs';
import {
  BaseAuthenticator,
  KoaContext,
  AuthStatus,
  AuthResult,
  AuthType,
} from '@vulcan-sql/serve/models';
import {
  ConfigurationError,
  UserError,
  VulcanExtensionId,
  VulcanInternalExtension,
} from '@vulcan-sql/core';
import { isEmpty } from 'lodash';
import 'koa-bodyparser';
export interface PasswordFileUserOptions {
  /* user name */
  name: string;
  /* the user attribute which could used after auth successful */
  attr: { [field: string]: string | boolean | number };
}
interface PasswordFileOptions {
  /** password file path */
  ['path']?: string;
  /** each user information */
  ['users']?: Array<PasswordFileUserOptions>;
}

type UserCredentialsMap = {
  [name: string]: {
    /* hashed password by bcrypt */
    bcryptPassword: string;
    /* the user attribute which could used after auth successful */
    attr: { [field: string]: string | boolean | number };
  };
};

/** The password-file authenticator.
 *
 * Setting the password file with {username}:{bcrypt-password} format, we use the bcrypt round 10.
 * Then authenticate by passing encode base64 {username}:{password} to authorization.
 */
@VulcanInternalExtension('auth')
@VulcanExtensionId(AuthType.PasswordFile)
export class PasswordFileAuthenticator extends BaseAuthenticator<PasswordFileOptions> {
  private usersCredentials: UserCredentialsMap = {};
  private options: PasswordFileOptions = {};

  /** read password file and users info to initialize user credentials */
  public override async onActivate() {
    this.options = (this.getOptions() as PasswordFileOptions) || this.options;
    const { path, users } = this.options;
    if (!path || !fs.existsSync(path) || !fs.statSync(path).isFile()) return;
    const reader = readline.createInterface({
      input: fs.createReadStream(path),
    });
    // <username>:<bcrypt-password>
    for await (const line of reader) {
      const name = line.split(':')[0] || '';
      const bcryptPassword = line.split(':')[1] || '';
      if (!isEmpty(bcryptPassword) && !bcryptPassword.startsWith('$2y$'))
        throw new ConfigurationError(
          `"${this.getExtensionId()}" type must bcrypt in file.`
        );

      // if users exist the same name, add attr to here, or as empty
      this.usersCredentials[name] = {
        bcryptPassword,
        attr: users?.find((user) => user.name === name)?.attr || {},
      };
    }
  }

  public async getTokenInfo(ctx: KoaContext) {
    const username = ctx.request.body!['username'] as string;
    const password = ctx.request.body!['password'] as string;
    if (!username || !password)
      throw new UserError('please provide "username" and "password".');

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
      // if not found matched user credential, return failed
      return {
        status: AuthStatus.FAIL,
        type: this.getExtensionId()!,
        message: (err as Error).message,
      };
    }
  }

  private async validate(baredToken: string) {
    const username = baredToken.split(':')[0] || '';
    // bare password in token
    const password = baredToken.split(':')[1] || '';
    // if authenticated, return user data
    if (
      !(username in this.usersCredentials) ||
      !bcrypt.compareSync(
        password,
        this.usersCredentials[username].bcryptPassword
      )
    )
      throw new UserError(
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
