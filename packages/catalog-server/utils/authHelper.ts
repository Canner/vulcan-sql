import { TokenStorage, FileTokenStorage } from './tokenStorage';
import { errorCode } from './errorCode';
import getConfig from 'next/config';
import { v1 as uuidv1 } from 'uuid';
import * as jwt from 'jsonwebtoken';
import { IncomingHttpHeaders } from 'http';
import adapter from './vulcanSQLAdapter';

export interface UserProfile {
  name: string;
  attr?: Record<string, string>;
}

export interface TokenPayload {
  session: string;
  profile: UserProfile;
}

export class AuthHelper {
  private tokenStorage: TokenStorage;
  private tokenSecret: string;
  private refreshTokenSecret: string;
  private authType: string | null;

  constructor(tokenStorage: TokenStorage) {
    this.tokenStorage = tokenStorage;
    const { serverRuntimeConfig } = getConfig();
    this.tokenSecret = serverRuntimeConfig.tokenSecret;
    this.refreshTokenSecret = serverRuntimeConfig.refreshTokenSecret;
  }

  async checkAuth() {
    // check auth type
    this.authType = await adapter.getAuthType();
    return this.authType;
  }

  async login(combination: { username: string; password: string }): Promise<{
    accessToken: string;
    refreshToken: string;
    profile: UserProfile;
  }> {
    const { username, password } = combination;

    // get api token & profile from vulcan api server
    const authType = await this.checkAuth();
    const token = await adapter.getInitToken({
      type: authType,
      username,
      password,
    });
    const apiToken = `${authType} ${token}`;
    const profile: UserProfile = await adapter.getUserProfile({ apiToken });

    // create a session in storage
    const session = uuidv1();
    const accessToken = jwt.sign({ session, profile }, this.tokenSecret);
    const refreshToken = jwt.sign(
      { session, profile },
      this.refreshTokenSecret
    );
    await this.tokenStorage.setToken(session, apiToken);
    return { accessToken, refreshToken, profile };
  }

  async auth(accessToken: string): Promise<{
    apiToken: string;
    session: string;
    profile: UserProfile;
  }> {
    if (this.authType === undefined) await this.checkAuth();

    // if user not setup auth, return a guest user
    if (this.authType === null) {
      return {
        profile: null,
        session: null,
        apiToken: null,
      };
    }

    try {
      if (!accessToken) {
        throw errorCode.UNAUTHORIZED_REQUEST;
      }

      const { session, profile } = jwt.verify(
        accessToken,
        this.tokenSecret
      ) as TokenPayload;
      const apiToken = await this.tokenStorage.getToken(session);

      if (!apiToken) {
        throw errorCode.UNAUTHORIZED_REQUEST;
      }

      return {
        apiToken,
        session,
        profile,
      };
    } catch (error) {
      console.log(error);
      throw errorCode.UNAUTHORIZED_REQUEST;
    }
  }

  public async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    profile: UserProfile;
  }> {
    const { session, profile } = jwt.verify(
      refreshToken,
      this.refreshTokenSecret
    ) as TokenPayload;
    const newAccessToken = jwt.sign({ session, profile }, this.tokenSecret);
    const newRefreshToken = jwt.sign(
      { session, profile },
      this.refreshTokenSecret
    );
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      profile,
    };
  }

  public async logout(accessToken: string): Promise<void> {
    try {
      const { session } = jwt.verify(
        accessToken,
        this.tokenSecret
      ) as TokenPayload;
      await this.tokenStorage.delToken(session);
    } catch (error) {
      console.log(error);
      throw errorCode.UNAUTHORIZED_REQUEST;
    }
  }
}

export const getBearerToken = (headers: IncomingHttpHeaders) => {
  return headers['authorization'].replace('Bearer ', '');
};

export const authHelper = new AuthHelper(new FileTokenStorage());
