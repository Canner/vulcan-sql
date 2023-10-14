import axios from 'axios';
import { isEmpty } from 'lodash';
import { ConnectionOptions } from 'tls';
import { createEnvConfig } from './config';
import { InternalError, getLogger, DataColumn } from '@vulcan-sql/core';
import {
  countObjectIdColumnLocations,
  formatObjectIdTypeValue,
} from './valueFormatter';
const envConfig = createEnvConfig();

interface Options {
  host: string;
  database: string;
  password: string;
  ssl?: boolean;
}

enum Status {
  QUEUED = 'QUEUED',
  WAITING_FOR_RESOURCES = 'WAITING_FOR_RESOURCES',
  DISPATCHING = 'DISPATCHING',
  PLANNING = 'PLANNING',
  STARTING = 'STARTING',
  RUNNING = 'RUNNING',
  FINISHING = 'FINISHING',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

interface SyncQueryResult {
  nextData: () => Promise<NextData>;
}

interface NextData {
  data: Record<string, any>[] | null;
  columns: DataColumn[];
}

interface SyncQueryResultData {
  id: string;
  infoUri: string;
  nextUri?: string;
  columns?: Array<{
    name: string;
    type: string;
  }>;
  data?: any[];
  stats: {
    state: Status;
  };
  warnings: any[];
}

export class CannerAdapter {
  public readonly host: string;
  public readonly workspaceSqlName: string;
  public readonly PAT: string | (() => string | Promise<string>);
  public readonly ssl: boolean | ConnectionOptions;
  private baseUrl: string | undefined;
  private logger = getLogger({ scopeName: 'CORE' });

  constructor(options?: Options) {
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

  public async syncQuery(sql: string): Promise<SyncQueryResult> {
    const pat = typeof this.PAT === 'function' ? await this.PAT() : this.PAT;
    const bareToken = Buffer.from(pat, 'base64').toString();

    // get userid
    // 377e8838-8c6f-45df-801d-3604c130a5ab_test_pat:am3xekzIxCd5tX0c9lXUUwNoCW3lwva1 => 377e8838-8c6f-45df-801d-3604c130a5ab
    const userId = bareToken.split('_')[0];
    const headers = this.getRequestHeaderForPresto({
      workspaceSqlName: this.workspaceSqlName,
    });

    const userSession = `canner_user_id=${userId}`;
    headers['x-trino-session'] = userSession;
    const res = await axios({
      method: 'post',
      url: `${this.getTrinoUrl()}/v1/statement`,
      data: sql,
      headers,
    });

    let firstCall = true;
    let columns: Array<any> = res.data.columns;
    let objectIdColumns: Array<number> = [];
    let nextUri: string | undefined;

    const nextData = async (): Promise<NextData> => {
      if (!nextUri && !firstCall) {
        this.logger.debug('no more data');
        return { data: null, columns };
      }

      const nextRes = firstCall ? res.data : await this.getNextUri(nextUri!);
      if (!isEmpty(nextRes.columns) && isEmpty(objectIdColumns)) {
        columns = nextRes.columns!;
        objectIdColumns = countObjectIdColumnLocations(nextRes.columns);
      }

      nextUri = nextRes.nextUri;
      firstCall = false;

      // if nextRes.data is empty, call nextData again
      if (isEmpty(nextRes.data)) {
        return await nextData();
      }

      const formatData = formatObjectIdTypeValue({
        data: nextRes.data,
        objectIdColumns,
      });

      return {
        data: formatData.map((item) => {
          const mergedObject: Record<string, any> = {};
          columns.forEach((col, index) => {
            mergedObject[col.name] = item[index];
          });
          return mergedObject;
        }),
        columns,
      };
    };

    return {
      nextData,
    };
  }

  private getNextUri = async (uri: string): Promise<SyncQueryResultData> => {
    const headers = this.getRequestHeaderForPresto({});
    const res = await axios.get(uri, { headers });
    return res.data;
  };

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

  private getTrinoUrl() {
    if (envConfig.isOnKubernetes) {
      return `http://${envConfig.trinoEndpoint}`;
    } else {
      const protocol = this.ssl ? 'https' : 'http';
      return `${protocol}://localhost:8081`;
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

  private getRequestHeaderForPresto({
    workspaceSqlName,
  }: {
    workspaceSqlName?: string;
  }): Record<string, any> {
    const headers: Record<string, any> = {
      'X-Trino-User': 'user',
      'X-Trino-Catalog': 'cannerflow',
      'Content-Type': 'text/plain',
    };

    if (workspaceSqlName) {
      headers['X-Trino-Schema'] = workspaceSqlName;
      headers['X-Trino-Source'] = `cannerflow-ui#${workspaceSqlName}`;
      headers['X-Cannerflow-Query-Workspaces'] = workspaceSqlName;
    }

    return headers;
  }
}
