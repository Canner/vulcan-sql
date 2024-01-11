import axios from 'axios';
import { PGOptions } from './cannerDataSource';
import { ConnectionOptions } from 'tls';
import { createEnvConfig } from './config';
import { InternalError, getLogger } from '@vulcan-sql/core';

const envConfig = createEnvConfig();

export class CannerAdapter {
  public readonly host: string;
  public readonly workspaceSqlName: string;
  public readonly PAT: string | (() => string | Promise<string>);
  public readonly ssl: boolean | ConnectionOptions;
  private baseUrl: string | undefined;
  private logger = getLogger({ scopeName: 'CORE' });

  constructor(options?: PGOptions) {
    if (!options) {
      throw new Error(`connection options is required`);
    }
    const { host, database, password, ssl = false } = options;
    if (!host || !database || !password) {
      throw new Error(`host, database and password are required`);
    }
    this.host = host;
    this.workspaceSqlName = database;
    this.PAT = password;
    this.ssl = ssl;
  }

  // When querying Canner enterprise, the Canner enterprise will save the query result as parquet files,
  // and store them in S3. This method will return the S3 urls of the query result.
  // For more Canner API ref: https://docs.cannerdata.com/reference/restful
  public async createAsyncQueryResultUrls(
    sql: string,
    headers?: Record<string, string>
  ): Promise<string[]> {
    this.logger.debug(`Create async request to Canner.`);
    let data = await this.getWorkspaceRequestData(
      'post',
      '/v2/async-queries',
      {
        data: {
          sql,
          timeout: 600,
          noLimit: true,
          cacheRefresh: true, // not use cached result
        },
      },
      headers
    );

    const { id: requestId } = data;
    this.logger.debug(`Wait Async request to finished.`);
    await this.waitAsyncQueryToFinish(requestId);

    // get the query result after the query finished
    data = await this.getRequestInfo(requestId);
    if (data.error?.message) {
      throw new Error(data.error.message);
    }

    this.logger.debug(`Get Query result urls.`);
    const urls = await this.getAsyncQueryResultUrls(requestId);
    this.logger.debug(`Query result urls: \n${urls.join('\n')}`);
    return urls;
  }

  private async getWorkspaceRequestData(
    method: string,
    urlPath: string,
    options?: Record<string, any>,
    headers?: Record<string, string>
  ) {
    await this.prepare();
    try {
      const response = await axios({
        headers: { ...headers, Authorization: `Token ${this.PAT}` },
        params: {
          workspaceSqlName: this.workspaceSqlName,
        },
        url: `${this.baseUrl}${urlPath}`,
        method,
        ...options,
      });
      return response.data;
    } catch (error: any) {
      const message = error.response
        ? `response status: ${
            error.response.status
          }, response data: ${JSON.stringify(error.response.data)}`
        : `remote server does not response. request ${error.toJSON()}}`;
      throw new InternalError(
        `Failed to get workspace request "${urlPath}" data, ${message}`
      );
    }
  }

  private async prepare() {
    if (this.baseUrl) {
      return;
    }
    const response = await axios({
      method: 'get',
      maxBodyLength: Infinity,
      url: `${this.getCannerUrl()}/cluster-info`,
      headers: {},
    });
    const { restfulApiBaseEndpoint } = response.data;
    if (!restfulApiBaseEndpoint) {
      throw new Error(
        `The restful API base endpoint is not found, please check "restfulApiBaseEndpoint" field from "/cluster-info" endpoint of Canner Enterprise`
      );
    }

    this.baseUrl = restfulApiBaseEndpoint;
  }

  private getCannerUrl() {
    if (envConfig.isOnKubernetes) {
      // use env to get the endpoint in k8s
      return `http://${envConfig.webServiceHost}`;
    } else {
      // otherwise use the host user provided
      const protocol = this.ssl ? 'https' : 'http';
      return `${protocol}://${this.host}`;
    }
  }

  private async waitAsyncQueryToFinish(requestId: string) {
    let data = await this.getRequestInfo(requestId);
    // FINISHED & FAILED are the end state of a async request, and the result urls will be generated only after the request is finished.
    while (!['FINISHED', 'FAILED'].includes(data.status)) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      data = await this.getRequestInfo(requestId);
    }
  }

  private async getRequestInfo(requestId: string) {
    return await this.getWorkspaceRequestData(
      'get',
      `/v2/async-queries/${requestId}`
    );
  }

  private async getAsyncQueryResultUrls(requestId: string): Promise<string[]> {
    const data = await this.getWorkspaceRequestData(
      'get',
      `/v2/async-queries/${requestId}/result/urls`
    );
    return data.urls || [];
  }
}
