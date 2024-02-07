import { BigQueryOptions } from '@google-cloud/bigquery';
import { BQConnector } from '../connectors/bqConnector';
import {
  DataSource,
  DataSourceName,
  IContext,
  UsableDataSource,
} from '../types';
import * as fs from 'fs';

export class DataSourceResolver {
  constructor() {
    this.saveDataSource = this.saveDataSource.bind(this);
  }

  public async saveDataSource(
    _root: any,
    args: {
      data: DataSource;
    },
    ctx: IContext
  ) {
    const { type, properties } = args.data;
    if (type === DataSourceName.BIG_QUERY) {
      await this.saveBigQueryDataSource(properties, ctx);
    }
  }

  private async saveBigQueryDataSource(properties: any, ctx: IContext) {
    const { location, projectId, credentials } = properties;
    let filePath = '';
    try {
      // check DataSource is valid and can connect to it
      filePath = await this.writeCredentialsFile(credentials);
      const connectionOption: BigQueryOptions = {
        location: location,
        projectId: projectId,
        keyFile: filePath,
      };
      const connector = new BQConnector(connectionOption);
      const connected = await connector.connect();
      if (!connected) {
        throw new Error('Cannot connect to DataSource');
      }
      // save DataSource to database
      const encryptedCredentials = await this.encryptCredentials(credentials);

      const project = await ctx.projectRepository.createOne({
        displayName: 'tbd',
        schema: 'tbd',
        catalog: 'tbd',
        type: 'BIG_QUERY',
        credentials: encryptedCredentials,
      });
      return project;
    } catch (e) {
      throw e;
    } finally {
      // remove the file
      if (filePath) {
        fs.unlinkSync(filePath);
      }
    }
  }

  private async encryptCredentials(credentials: string) {
    // encrypt credentials
    return credentials;
  }

  private async decryptCredentials(credentials: string) {
    return credentials;
  }

  private async writeCredentialsFile(credentials: string) {
    // write credentials to file
    return 'file_path';
  }
}
