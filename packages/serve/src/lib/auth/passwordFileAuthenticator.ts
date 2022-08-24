import * as fs from 'fs';
import * as readline from 'readline';
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
export interface PasswordFileOptions {
  /** password file path */
  ['path']: string;
  /** each user information */
  ['users']: Array<AuthUserOptions>;
}

type UserCredentialsMap = {
  [name: string]: {
    /* hashed password by bcrypt */
    hashPassword: string;
    /* the user attribute which could used after auth successful */
    attr: { [field: string]: string | boolean | number };
  };
};

/** The password-file authenticator  */
@VulcanInternalExtension()
@VulcanExtensionId('password-file')
export class PasswordFileAuthenticator extends BaseAuthenticator<PasswordFileOptions> {
  private usersCredentials: UserCredentialsMap = {};
  private options: PasswordFileOptions = { path: '', users: [] };

  /** read password file and users info to initialize user credentials */
  public override async onActivate() {
    this.options = (this.getOptions() as PasswordFileOptions) || this.options;
    const { path, users } = this.options;
    if (!fs.existsSync(path) || !fs.statSync(path).isFile()) return;
    const reader = readline.createInterface({
      input: fs.createReadStream(path),
    });
    // <username>:<hashed-password>
    for await (const line of reader) {
      const name = line.split(':')[0] || '';
      const hashPassword = line.split(':')[1] || '';
      if (!hashPassword.startsWith('$2y$'))
        throw new Error(`"${this.getExtensionId()}" type must hash bcrypt.`);

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
      // if not found matched user credential, return failed
      return {
        status: AuthStatus.FAIL,
        type: this.getExtensionId()!,
        message: (err as Error).message,
      };
    }
  }

  private async verify(baredToken: string) {
    const username = baredToken.split(':')[0] || '';
    // hashed password in token
    const hashPassword = baredToken.split(':')[1] || '';
    // if authenticated, return user data
    if (
      !(username in this.usersCredentials) ||
      !(this.usersCredentials[username].hashPassword === hashPassword)
    )
      throw new Error(
        `authenticate user by ${this.getExtensionId()} type authentication failed.`
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
