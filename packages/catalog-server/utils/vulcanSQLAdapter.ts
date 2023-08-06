import { errorCode } from './errorCode';
import axios from 'axios';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();
const VULCAN_SQL_HOST = serverRuntimeConfig.vulcanSQLHost;

export const axiosInstance = axios.create({
  baseURL: VULCAN_SQL_HOST,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
  },
});

const getAuthorization = (ctx) => {
  return {
    headers: {
      Authorization: ctx.apiToken,
    },
  };
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorInformation = {
      code: error.code,
      requestUrl: `${error.config.baseURL}${error.config.url}`,
      method: error.config.method,
      status: error.response.status,
      data: error.response.data || '',
    };
    console.error(
      '\x1b[31m%s\x1b[0m',
      `ERROR: ${JSON.stringify(errorInformation)}`
    );

    return Promise.reject(error);
  }
);

class VulcanSQLAdapter {
  public async getAuthType() {
    try {
      const { data } = await axiosInstance.get(`/auth/available-types`);
      const authType =
        data.find((type) => ['basic', 'password-file'].includes(type)) || '';
      return authType;
    } catch (err) {
      return null;
    }
  }

  public async getInitToken(params: {
    type: string;
    username: string;
    password: string;
  }): Promise<string> {
    const { data } = await axiosInstance.post(`/auth/token`, params);
    return data.token;
  }

  public async getUserProfile(ctx) {
    try {
      const { data } = await axiosInstance.get(
        `/auth/user-profile`,
        getAuthorization(ctx)
      );
      return data;
    } catch (err) {
      throw errorCode.LOGIN_FAILED;
    }
  }

  public async getSchemas(ctx) {
    const { data } = await axiosInstance.get(
      `/catalog/schemas`,
      getAuthorization(ctx)
    );
    return data;
  }

  public getSchema = async (ctx, slug) => {
    const { data } = await axiosInstance.get(
      `/catalog/schemas/${slug}`,
      getAuthorization(ctx)
    );
    return data;
  };

  public async getPreviewData(
    ctx: any,
    args: {
      slug: string;
      filter: Record<string, string>;
    }
  ) {
    const { slug, filter } = args;
    const schema = await this.getSchema(ctx, slug);
    const actualPath = Object.keys(filter).reduce((result, key) => {
      if (!filter[key]) return result;

      const param = `:${key}`;
      const isParam = result.includes(param);
      const querySymbol = result.includes('?') ? '&' : '?';

      return isParam
        ? result.replace(param, filter[key])
        : `${result}${querySymbol}${key}=${filter[key]}`;
    }, schema.urlPath);

    const actualUrl = `${VULCAN_SQL_HOST}${actualPath}`;
    console.log('actualUrl: ', actualUrl);
    const { data } = await axiosInstance.get(actualPath, getAuthorization(ctx));
    return {
      schema: { ...schema, actualPath, actualUrl },
      data,
    };
  }
}

export default new VulcanSQLAdapter();
