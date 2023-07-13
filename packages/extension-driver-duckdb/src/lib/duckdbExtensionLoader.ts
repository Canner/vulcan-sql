import * as duckdb from 'duckdb';
import { getLogger } from '@vulcan-sql/core';
import { ConfigurationParameters } from './duckdbDataSource';

// DuckDB parameter name : configuration name
export enum HTTPFS_CONFIGURATIONS {
  s3_region = 'region',
  s3_access_key_id = 'accessKeyId',
  s3_secret_access_key = 'secretAccessKey',
  // sessionToken= alternative option for accessKeyId and secretAccessKey
  s3_session_token = 'sessionToken',
  s3_endpoint = 'endpoint',
  s3_url_style = 'url_style',
  s3_use_ssl = 'use_ssl',
}

export class DuckDBExtensionLoader {
  private configurations: ConfigurationParameters;
  private configurationMap: ReadonlyMap<string, Record<string, string>> =
    new Map([['httpfs', HTTPFS_CONFIGURATIONS]]);

  private logger = getLogger({ scopeName: 'CORE' });

  constructor(configurations: ConfigurationParameters) {
    this.configurations = configurations;
  }

  public async loadExtension(
    conn: duckdb.Connection,
    extensionName: string
  ): Promise<void> {
    const extensionConfigurations = this.configurationMap.get(extensionName);
    if (!extensionConfigurations) {
      this.logger.debug(
        `Can not find duckdb extension ${extensionName} or no configuration need to be set.`
      );
      return;
    }
    try {
      conn.run(`LOAD ${extensionName}`);
    } catch (error) {
      this.logger.debug(`Error when loading extension:${extensionName}`);
      throw error;
    }
    try {
      await Promise.all(
        Object.entries(extensionConfigurations).map(
          async ([dbParameterName, configurationKey]) => {
            const configurationValue =
              this.configurations[
                configurationKey as keyof ConfigurationParameters
              ];
            // if configuration is not undefined
            if (configurationValue !== undefined) {
              conn.run(`SET ${dbParameterName}='${configurationValue}'`);
              this.logger.debug(
                `Configuration parameter "${dbParameterName}" set`
              );
            } else {
              this.logger.debug(
                `Configuration "${dbParameterName}" has not been set`
              );
            }
          }
        )
      );
    } catch (error) {
      this.logger.debug(
        `Error when setting configuration for extension:${extensionName}`
      );
      throw error;
    }
  }
}
