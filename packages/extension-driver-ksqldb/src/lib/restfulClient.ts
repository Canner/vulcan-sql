import * as http2 from 'http2';


const RESTFUL_API = {
  INFO: '/info',
  KSQL: '/ksql',
  QUERY: '/query',
};

interface KsqlInfoResponse {
  KsqlServerInfo: {
    version: string;
    kafkaClusterId: string;
    ksqlServiceId: string;
    serverStatus: string;
  };
}

export type Header = {
  header: {
    queryId: string;
    schema: string;
  };
};

export type Row = {
  row: {
    columns: any[];
  };
};

export type FinalMessage = {
  finalMessage: string;
};

/**
 * The example query response like below:
 * [
 *  {
 *    "header": {
 *      "queryId": "transient_RIDERLOCATIONS_356492705638097482",
 *      "schema": "`PROFILEID` STRING, `LATITUDE` DOUBLE, `LONGITUDE` DOUBLE"
 *    }
 *  },
 *  { "row": {"columns": ["c2309eec",37.7877,-122.4205]} },
 *  { ...more rows },
 *
 *  { "finalMessage": "Query Completed"}
 * ]
 */
export type QueryResponse = Header | Row | FinalMessage;

export interface RestfulClientOptions {
  host?: string;
  username?: string;
  password?: string;
}

export class RestfulClient {
  private options: RestfulClientOptions;
  public client?: http2.ClientHttp2Session;
  public connected = false;
  private startSession: () => null | Promise<void> = () => null;

  constructor(options: RestfulClientOptions) {
    this.options = options;
    this.connect();
  }

  public connect() {
    this.startSession = () =>
      new Promise((resolve, reject) => {
        this.client = http2.connect(this.options.host || 'http://localhost:8088');

        this.client.on('connect', () => {
          this.connected = true;
          resolve();
        });

        this.client.on('error', (error: any) => {
          reject(error);
        });
      });
  }

  public close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.client) {
        !this.client.destroyed && this.client.destroy();
        this.connected = false;
        resolve();
      } else {
        reject(new Error('Client is not initialized'));
      }
    });
  }

  public async checkConnection(): Promise<
    KsqlInfoResponse['KsqlServerInfo']['serverStatus']
  > {
    try {
      const res = await this.request<KsqlInfoResponse>(RESTFUL_API.INFO, 'GET');
      return res.KsqlServerInfo['serverStatus'];
    } catch (e: any) {
      if(e.error_code) {
        throw new Error(JSON.stringify(e));
      } else {
        throw new Error('KsqlDb server is not ready');
      }
    }
  }

  public async checkConnectionRunning(): Promise<boolean> {
    const status = await this.checkConnection();
    const isRunning = status === 'RUNNING';
    return isRunning;
  }

  public async query({
    query,
    query_params = {},
  }: {
    query: string;
    query_params?: Record<string, any>;
  }) {
    // bind query parameters
    const ksql = this.bindParams(query, query_params);

    const buffer = Buffer.from(JSON.stringify({ ksql }));
    const res = await this.request(RESTFUL_API.QUERY, 'POST', buffer);
    return res;
  }

  public async exec({
    query,
    query_params = {},
  }: {
    query: string;
    query_params?: Record<string, any>;
  }) {
    // bind query parameters
    const ksql = this.bindParams(query, query_params);

    const buffer = Buffer.from(JSON.stringify({ ksql }));
    const res = await this.request(RESTFUL_API.KSQL, 'POST', buffer);
    return res;
  }

  private bindParams(query: string, query_params: Record<string, any>) {
    const values = Object.values(query_params);

    // replace the parameterized placeholder to values
    const ksql = query.replace(/\$(\d+)/g, (_, index) => {
      const valueIndex = parseInt(index) - 1;
      const paramValue = values[valueIndex];
      return typeof paramValue === 'string' ? `'${paramValue}'` : paramValue;
    });

    return ksql;
  }

  private async request<R = QueryResponse[]>(
    path: string,
    method: string,
    buffer?: Buffer
  ): Promise<R> {
    this.startSession && (await this.startSession());

    return new Promise((resolve, reject) => {
      const config: any = {
        'content-type': 'application/vnd.ksql.v1+json',
        ':method': method,
        ':path': path,
      };
      // add authorization if username and password is provided
      if(this.options.username && this.options.password) {
        config['authorization'] = `Basic ${Buffer.from(`${this.options.username}:${this.options.password}`).toString('base64')}`
      }

      const req = this.client!.request(config);
      req.setEncoding('utf-8');

      let status: number | null = null;
      req.on('response', (headers) => {
        status = headers[':status']!;
      });

      let data = '';
      req.on('data', (chunk) => {
        data += chunk;
      });

      req.on('end', () => {
        let responseData: any = data;
        try {
          responseData = JSON.parse(data);
        } catch (e) {
          responseData = data;
        }

        if (status === 200) {
          resolve(responseData);
        } else {
          reject(responseData);
        }
        this.close();
      });

      req.on('error', (error) => {
        reject(error);
        this.close();
      });

      buffer && req.write(buffer);
      req.end();
    });
  }
}
