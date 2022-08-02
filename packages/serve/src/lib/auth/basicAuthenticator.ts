import * as fs from 'fs';
import * as readline from 'readline';
import { isEmpty } from 'lodash';
import {
  BaseAuthenticator,
  KoaContext,
  AuthResult,
  UserAuthOptions,
} from '@vulcan-sql/serve/models';
import { VulcanExtensionId, VulcanInternalExtension } from '@vulcan-sql/core';

@VulcanInternalExtension()
@VulcanExtensionId('basic')
export class BasicAuthenticator extends BaseAuthenticator {
  public async authenticate(
    usersOptions: Array<UserAuthOptions>,
    context: KoaContext
  ) {
    // if not exist basic method config, return failed.
    if (isEmpty(usersOptions)) return { authenticated: false };

    const auth = context.request.headers['authorization'];
    if (!(auth && auth.toLowerCase().startsWith(this.getExtensionId()!)))
      return { authenticated: false };

    // validate auth token
    const token = auth.trim().split(' ')[1];

    for (const userOptions of usersOptions) {
      if (userOptions.auth['token']) {
        const result = await this.verifyToken(token, userOptions);
        if (result.authenticated) return result;
      }
      if (userOptions.auth['file']) {
        const result = await this.verifyTokenInFile(token, userOptions);
        if (result.authenticated) return result;
      }
    }
    // if not found matched token, return failed
    return { authenticated: false };
  }

  private async verifyToken(srcToken: string, userOptions: UserAuthOptions) {
    let ansToken = '';
    const pattern = /^{{([\w]+|[ \w ]+)}}$/;
    const matched = pattern.exec(userOptions.auth['token'] as string);
    // if find env variable format, read env variable by matched[1], or read value of token directly.
    ansToken = matched
      ? (process.env[matched[1]] as string)
      : (userOptions.auth['token'] as string);

    if (!matched) ansToken = ansToken || (userOptions.auth['token'] as string);
    // matched[1] is env variable
    if (matched) ansToken = ansToken || (process.env[matched[1]] as string);
    if (srcToken !== ansToken) return { authenticated: false };

    return {
      authenticated: true,
      user: {
        name: userOptions.name,
        method: this.getExtensionId()!, // method name
        attr: userOptions.attr,
      },
    } as AuthResult;
  }

  private async verifyTokenInFile(
    srcToken: string,
    userOptions: UserAuthOptions
  ) {
    let ansToken = '';
    const filePath = userOptions.auth['file'] as string;

    if (!fs.existsSync(filePath)) return { authenticated: false };
    if (!fs.statSync(filePath).isFile()) return { authenticated: false };

    const reader = readline.createInterface({
      input: fs.createReadStream(filePath),
    });
    for await (const line of reader) {
      if (line.startsWith(`${userOptions.name}:`)) {
        ansToken = line.split(':')[1].trim();
        break;
      }
    }

    if (srcToken !== ansToken) return { authenticated: false };
    // if matched return user data
    return {
      authenticated: true,
      user: {
        name: userOptions.name,
        method: this.getExtensionId()!, // method name
        attr: userOptions.attr,
      },
    } as AuthResult;
  }
}
