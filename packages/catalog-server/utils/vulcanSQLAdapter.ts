import { errorCode } from './errorCode';
import axios from 'axios';

const VULCAN_SQL_HOST = 'http://localhost:3000';

export const axiosInstance = axios.create({
  baseURL: VULCAN_SQL_HOST,
});

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
  public getAuthType = async () => {
    const { data } = await axiosInstance.get(`/auth/available-types`);
    const authType =
      data.find((type) => ['basic', 'password-file'].includes(type)) || '';
    return authType;
  };

  public getInitToken = async (params: {
    type: string;
    username: string;
    password: string;
  }): Promise<string> => {
    const { data } = await axiosInstance.post(`/auth/token`, params);
    axios.defaults.headers['Authorization'] = `${params.type} ${data.token}`;

    return data.token;
  };

  public getUserProfile = async () => {
    try {
      const { data } = await axiosInstance.get(`/auth/user-profile`);
      return data;
    } catch (err) {
      throw errorCode.LOGIN_FAILED;
    }
  };

  public getSchemas = async () => {
    const { data } = await axiosInstance.get(`/catalog/schemas`);
    return data;
  };

  public getSchema = async (slug) => {
    const { data } = await axiosInstance.get(`/catalog/schemas/${slug}`);
    return data;
  };

  public getPreviewData = async (args: {
    slug: string;
    filter: Record<string, string>;
  }) => {
    try {
      const { slug, filter } = args;
      const schema = await this.getSchema(slug);
      const url = Object.keys(filter).reduce((result, key) => {
        return result.replace(`:${key}`, filter[key]);
      }, `/api${schema.urlPath}`);

      const { data } = await axiosInstance.get(url);
      return {
        schema: { ...schema, apiUrl: `${VULCAN_SQL_HOST}${url}` },
        data,
      };
    } catch (err) {
      // API result not found
    }
  };
}

export default new VulcanSQLAdapter();
