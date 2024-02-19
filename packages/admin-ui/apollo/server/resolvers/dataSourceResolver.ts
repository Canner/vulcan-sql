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
    this.listDataSourceTables = this.listDataSourceTables.bind(this);
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

  public async listDataSourceTables(_root: any, arg, ctx: IContext) {
    // fetch connection info and write credential file
    const projects = await ctx.projectRepository.findAll();
    if (!projects.length) {
      return [];
    }
    const {
      location,
      projectId,
      dataset,
      credentials: encryptedCredentials,
    } = projects[0];

    const encryptor = new Encryptor(ctx.config);
    const credentials = await encryptor.decrypt(encryptedCredentials);
    let filePath = '';
    filePath = await this.writeCredentialsFile(
      JSON.parse(credentials),
      ctx.config.persistCredentialDir
    );

    // fetch tables
    const connectionOption: BigQueryOptions = {
      location,
      projectId,
      keyFilename: filePath,
    };
    const connector = new BQConnector(connectionOption);
    const listTableOptions = {
      dataset,
    };
    const tables = await connector.listTables(listTableOptions);
    return tables as any;
  }

  private async saveBigQueryDataSource(properties: any, ctx: IContext) {
    const { displayName, location, projectId, dataset, credentials } =
      properties;
    const { config } = ctx;
    let filePath = '';
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
    // check can list dataset table
    try {
      await connector.listTables({ dataset });
    } catch (e) {
      throw new Error('Cannot list tables in dataset');
    }
    // save DataSource to database
    const encryptor = new Encryptor(config);
    const encryptedCredentials = encryptor.encrypt(credentials);

    // TODO: add displayName, schema, catalog to the DataSource, depends on the MDL structure
    const project = await ctx.projectRepository.createOne({
      displayName,
      schema: 'tbd',
      catalog: 'tbd',
      type: DataSourceName.BIG_QUERY,
      projectId,
      location,
      dataset,
      credentials: encryptedCredentials,
    });
    return project;
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
