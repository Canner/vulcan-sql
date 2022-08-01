import * as fs from 'fs';
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
export class HttpBasicAuthenticator extends BaseAuthenticator {
  public async authenticate(
    usersOptions: Array<UserAuthOptions>,
    context: KoaContext
  ) {
    const auth = context.request.headers['authorization']?.toLowerCase();
    // if not exist basic method config, return failed.
    if (isEmpty(usersOptions)) return { authenticated: false };
    if (!(auth && auth.startsWith(this.getExtensionId()!)))
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
    if (!matched) ansToken = ansToken || (userOptions.auth['token'] as string);
    // matched[1] is env variable
    if (matched) ansToken = ansToken || (process.env[matched[1]] as string);
    if (srcToken === ansToken)
      return {
        authenticated: true,
        user: {
          name: userOptions.name,
          method: this.getExtensionId()!, // method name
          attr: userOptions.attr,
        },
      } as AuthResult;
    return {
      authenticated: false,
    };
  }

  private async verifyTokenInFile(
    srcToken: string,
    userOptions: UserAuthOptions
  ) {
    let ansToken = '';
    const filePath = userOptions.auth['filePath'] as string;
    if (!fs.statSync(filePath).isFile()) return { authenticated: false };
    const stream = fs.createReadStream(filePath);
    // read each line
    stream.on('data', (chunk) => {
      const content = chunk.toString();
      if (content.startsWith(`${userOptions.name}:`)) {
        ansToken = content.split(':')[1];
        return;
      }
    });

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
