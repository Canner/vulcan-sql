import {
  BaseActivityLogger,
  ActivityLoggerType,
} from '../../models/extensions/logger';
import {
  VulcanExtensionId,
  VulcanInternalExtension,
} from '../../models/extensions';
import axios from 'axios';

interface HttpLoggerConfig {
  connection?: HttpLoggerConnectionConfig;
}

interface HttpLoggerConnectionConfig {
  protocol?: string | undefined;
  host?: string | undefined;
  port?: number | string;
  path?: string | undefined;
  headers?: NodeJS.Dict<string | string[]> | undefined;
}

@VulcanInternalExtension('activity-log')
@VulcanExtensionId(ActivityLoggerType.HTTP_LOGGER)
export class HttpLogger extends BaseActivityLogger<HttpLoggerConfig> {
  public async log(payload: any): Promise<void> {
    const option = this.getOptions();
    if (!option) {
      throw new Error('Http logger option is not defined.');
    }
    // TODO-ac: should implement http logger
    try {
      // get connection info from option and use axios to send a post requet to the endpoint
      const { protocol, host, port, path, headers } = option.connection!;
      const url = `${protocol}://${host}:${port}${path}`;
      await axios.post(url, payload, { headers: headers as any });
    } catch (err) {
      console.error(err);
    }
  }
}
