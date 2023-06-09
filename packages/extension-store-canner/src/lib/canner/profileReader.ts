import {
  Profile,
  ProfileReader,
  VulcanExtensionId,
  VulcanInternalExtension,
  ConfigurationError,
} from '@vulcan-sql/core';
import { CannerStoreConfig, getEnvConfig } from '../config';
import { createStorageService } from '../storageService';
import { getIndicatorFilesOfWorkspaces } from './utils';
import { ArtifactIndicator } from './models';

export interface CannerProfileReaderOptions {
  // root path on Canner storage
  path?: string;
}

/**
 * Used the string to identify the extension Id not by the enum "LocalFileProfileReader".
 * Because if we create another enum to extend the 'LocalFileProfileReader', it seems unnecessary to give the new enum only has 'Canner' as its type."
 *  */
@VulcanInternalExtension()
@VulcanExtensionId('Canner')
export class CannerProfileReader extends ProfileReader {
  private envConfig: CannerStoreConfig = getEnvConfig();
  private logger = this.getLogger();

  public async read(options: CannerProfileReaderOptions) {
    if (!options.path)
      throw new ConfigurationError(
        'Canner profile reader needs options.path property'
      );
    const storageService = await createStorageService(this.envConfig.storage);
    this.logger.debug('Canner storage service created');
    const filesInfo = await storageService.listObjects({
      path: options.path,
      recursive: true,
    });
    // get the indicator files path of each workspaces
    const files = await getIndicatorFilesOfWorkspaces(filesInfo);
    this.logger.debug(
      `Succeed to get the indicator files of each workspaces: ${JSON.stringify(
        files
      )}`
    );

    // generate profiles from the indicator files of each workspaces
    const { user, password, host, port } = this.envConfig.profile;
    if (!user || !password || !host)
      throw new ConfigurationError(
        'Canner profile reader needs username, password, host properties.'
      );
    const profiles = await Promise.all(
      files.map(async ({ workspaceId, name }) => {
        const buffer = await storageService.downObjectAsBuffer({ name });
        const indicator = JSON.parse(
          buffer.toString('utf-8')
        ) as ArtifactIndicator;
        const workspaceSqlName = indicator[workspaceId];
        const profile = {
          name: `profile-${workspaceSqlName}`,
          type: 'canner',
          connection: {
            user,
            password,
            host,
            port,
            database: workspaceSqlName,
          },
          allow: '*',
        } as Profile<Record<string, any>>;
        this.logger.debug(`created "${profile.name}".`);
        return profile;
      })
    );
    return profiles;
  }
}
