import {
  BaseActivityLogger,
  ActivityLoggerType,
} from '../../models/extensions/logger';
import {
  VulcanExtensionId,
  VulcanInternalExtension,
} from '../../models/extensions';
import axios, { AxiosRequestHeaders } from 'axios';
import { ConnectionConfig, getUrl } from '../utils/url';

export interface HttpLoggerConfig {
  connection?: HttpLoggerConnectionConfig;
}

export interface HttpLoggerConnectionConfig extends ConnectionConfig {
  headers?: Record<string, string | number | boolean> | undefined;
}

@VulcanInternalExtension('activity-log')
@VulcanExtensionId(ActivityLoggerType.HTTP_LOGGER)
export class HttpLogger extends BaseActivityLogger<HttpLoggerConfig> {
  private logger = this.getLogger();

  public async log(payload: any): Promise<void> {
    if (!this.isEnabled()) return;
    const option = this.getOptions();
    if (!option?.connection) {
      throw new Error('Http logger connection should be provided');
    }
    const headers = option.connection.headers;
    const url = getUrl(option.connection);
    try {
      // get connection info from option and use axios to send a post requet to the endpoint
      await this.sendActivityLog(url, payload, headers);
      this.logger.debug(`Activity log sent`);
    } catch (err) {
      this.logger.debug(
        `Failed to send activity log to http logger, url: ${url}`
      );
      throw err;
    }
  }

  protected async sendActivityLog(
    url: string,
    payload: any,
    headers: AxiosRequestHeaders | undefined
  ): Promise<void> {
    await axios.post(url, payload, {
      headers: headers,
    });
  }
}
