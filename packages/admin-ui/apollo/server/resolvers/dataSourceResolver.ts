import { BigQueryOptions } from '@google-cloud/bigquery';
import { BQConnector } from '../connectors/bqConnector';
import { DataSource, DataSourceName, IContext } from '../types';
import crypto from 'crypto';
import * as fs from 'fs';
import path from 'path';
import { getLogger, Encryptor } from '@vulcan-sql/admin-ui/apollo/server/utils';

const logger = getLogger('DataSourceResolver');
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
      return args.data;
    }
  }

  private async saveBigQueryDataSource(properties: any, ctx: IContext) {
    const { location, projectId, credentials } = properties;
    const { config } = ctx;
    let filePath = '';
    try {
      // check DataSource is valid and can connect to it
      filePath = await this.writeCredentialsFile(
        credentials,
        config.persistCredentialDir
      );
      const connectionOption: BigQueryOptions = {
        location,
        projectId,
        keyFilename: filePath,
      };
      const connector = new BQConnector(connectionOption);
      const connected = await connector.connect();
      if (!connected) {
        throw new Error('Cannot connect to DataSource');
      }
      // save DataSource to database
      const encryptor = new Encryptor(config);
      const encryptedCredentials = await encryptor.encrypt(credentials);

      // TODO: add displayName, schema, catalog to the DataSource, depends on the MDL structure
      const project = await ctx.projectRepository.createOne({
        displayName: 'tbd',
        schema: 'tbd',
        catalog: 'tbd',
        type: 'BIG_QUERY',
        projectId,
        credentials: encryptedCredentials,
      });
      return project;
    } finally {
      // remove the file
      if (filePath) {
        fs.unlinkSync(filePath);
      }
    }
  }

  private async writeCredentialsFile(
    credentials: JSON,
    persist_credential_dir: string
  ) {
    // file name will be the hash of the credentials, file path is current working directory
    // convert credentials from base64 to string and replace all the matched "\n" with "\\n",  there are many \n in the "private_key" property
    const credentialString = JSON.stringify(credentials);
    const fileName = crypto
      .createHash('md5')
      .update(credentialString)
      .digest('hex');

    const filePath = path.join(persist_credential_dir, `${fileName}.json`);
    // check if file exists
    if (fs.existsSync(filePath)) {
      logger.debug(`File ${filePath} already exists`);
      return filePath;
    }
    logger.debug(`Writing credentials to file ${filePath}`);
    fs.writeFileSync(filePath, credentialString);
    return filePath;
  }
}
