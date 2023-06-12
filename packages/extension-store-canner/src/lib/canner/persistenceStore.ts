import {
  APISchema,
  ArtifactBuilderOptions,
  PersistentStore,
  TYPES,
  VulcanExtensionId,
} from '@vulcan-sql/core';
import { inject } from 'inversify';
import * as oas3 from 'openapi3-ts';
import { createStorageService } from '../storageService';
import { BaseStorageService } from '@canner/canner-storage';
import { CannerStoreConfig, getEnvConfig } from '../config';
import { getIndicatorFilesOfWorkspaces } from './utils';
import { ArtifactIndicator } from './models';

export interface RawBuiltInArtifact {
  // key is source name, value is combined sql js executable code
  templates: Record<string, string>;
  schemas: APISchema[];
  // specs content may be different according to the different spec generator, so we use the record type
  specs: Record<string, any>;
}

export type BuiltInArtifact = RawBuiltInArtifact & {
  specs: {
    oas3: oas3.OpenAPIObject;
  };
};

// key is workspaceSqlName, value is artifact buffer content
interface WorkspaceArtifact {
  workspaceSqlName: string;
  artifact: RawBuiltInArtifact;
}
/**
 * Used the string to identify the extension Id not by the enum "ArtifactBuilderProviderType".
 * Because if we create another enum to extend the 'ArtifactBuilderProviderType', it seems unnecessary to give the new enum only has 'Canner' as its type."
 *  */

@VulcanExtensionId('Canner')
export class CannerPersistenceStore extends PersistentStore {
  private filePath: string;
  private logger = this.getLogger();

  private envConfig: CannerStoreConfig = getEnvConfig();

  constructor(
    @inject(TYPES.ArtifactBuilderOptions) options: ArtifactBuilderOptions,
    @inject(TYPES.ExtensionConfig) config: any,
    @inject(TYPES.ExtensionName) moduleName: string
  ) {
    super(config, moduleName);
    this.filePath = options.filePath;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async save(data: Buffer): Promise<void> {
    throw new Error(
      'The extension not provide the save method, it only use to load the data from the storage'
    );
  }

  public async load(): Promise<Buffer> {
    const storageService = await createStorageService(this.envConfig.storage);
    this.logger.debug('Canner storage service created');
    const filesInfo = await storageService.listObjects({
      path: this.filePath,
      recursive: true,
    });
    // get the indicator files path of each workspaces
    const files = await getIndicatorFilesOfWorkspaces(filesInfo);
    this.logger.debug(
      `Succeed to get the indicator files of each workspaces: ${JSON.stringify(
        files
      )}`
    );
    // get the latest artifacts of each workspaces
    const artifacts = await this.getLatestArtifactsOfWorkspaces(
      storageService,
      files
    );
    // merge the artifacts of each workspaces to one artifact
    const artifact = await this.mergeArtifactsOfWorkspaces(artifacts);
    this.logger.debug(`Succeed to merge the artifacts: ${artifact}`);
    return Buffer.from(JSON.stringify(artifact), 'utf-8');
  }

  private async getLatestArtifactsOfWorkspaces(
    storageService: BaseStorageService,
    indicators: { workspaceId: string; name: string }[]
  ): Promise<WorkspaceArtifact[]> {
    return await Promise.all(
      // download latest artifact buffer content of each workspace by viewing the indicator.json of the each workspace
      indicators.map(async ({ workspaceId, name: indicatorPath }) => {
        const buffer = await storageService.downObjectAsBuffer({
          name: indicatorPath,
        });
        const indicator = JSON.parse(
          buffer.toString('utf-8')
        ) as ArtifactIndicator;
        const artifact = await this.getWorkspaceArtifact(
          storageService,
          indicatorPath,
          indicator
        );
        this.logger.debug('Succeed to download latest artifacts of workspaces');
        return {
          workspaceSqlName: indicator[workspaceId],
          artifact,
        };
      })
    );
  }

  private async getWorkspaceArtifact(
    storageService: BaseStorageService,
    indicatorPath: string,
    indicator: ArtifactIndicator
  ): Promise<BuiltInArtifact> {
    const latestArtifactFolder = indicator[indicator.master];
    const vulcanFolderPath = indicatorPath.replace('/indicator.json', '');
    const path = `${vulcanFolderPath}/${latestArtifactFolder}/result.json`;
    this.logger.debug(`Download the artifact from path: ${path}`);
    // download from artifact path name
    const buffer = await storageService.downObjectAsBuffer({
      name: path,
    });
    // parse the artifact buffer content to object
    return JSON.parse(buffer.toString('utf-8')) as BuiltInArtifact;
  }

  private async mergeArtifactsOfWorkspaces(
    artifacts: WorkspaceArtifact[]
  ): Promise<BuiltInArtifact> {
    const merged = artifacts.reduce(
      (merged, { workspaceSqlName, artifact }) => {
        // Template
        Object.entries(artifact.templates).forEach(([sourceName, value]) => {
          // add the workspace sql name prefix to original source name
          const workspaceSourceName = `${workspaceSqlName}/${sourceName}`;
          merged.templates[workspaceSourceName] = value;
        });
        // API Schemas
        artifact.schemas.forEach((schema) => {
          // concat the workspace sql name prefix to urlPath, urlPath has the "/" prefix, so concat directly
          schema.urlPath = `${workspaceSqlName}${schema.urlPath}`;
          // concat the workspace sql name prefix to template source, so it could find the "sourceName" in templates
          schema.templateSource = `${workspaceSqlName}/${schema.templateSource}`;
          // replace the profile to the canner enterprise integration used profile name, it will match to the profiles from canner profile reader.
          schema.profiles = [`canner-${workspaceSqlName}`];
          merged.schemas.push(schema);
        });
        // Specs, only support the oas3 specification for canner enterprise integration used
        if (!artifact.specs['oas3'])
          throw new Error(
            `The workspace sql name "${workspaceSqlName}" artifact not use "oas3" specification, canner persistence store only support the "oas3" specification`
          );
        if (artifact.specs['oas3']['paths'])
          Object.entries(artifact.specs['oas3']['paths']).forEach(
            ([apiEndpoint, endpointInfo]) => {
              // concat the workspace sql name prefix to original api endpoint, the "apiEndpoint" has the "/" prefix, so concat directly
              const endpoint = `${workspaceSqlName}${apiEndpoint}`;
              merged.specs['oas3']['paths'][endpoint] =
                endpointInfo as oas3.PathItemObject;
              // Add workspace sql name prefix to original operationId & summary
              const { summary, operationId } = merged.specs['oas3']['paths'][
                endpoint
              ]['get'] as oas3.OperationObject;
              merged.specs['oas3']['paths'][endpoint]['get'] = {
                ...merged.specs['oas3']['paths'][endpoint]['get'],
                // e.g: get/xxx => get/{workspaceSqlName}/xxx
                operationId: `get/${workspaceSqlName}/${operationId?.slice(4)}`,
                // e.g: /xxx => /{workspaceSqlName}/xxx
                summary: `/${workspaceSqlName}${summary}`,
              };
            }
          );
        return merged;
      },
      {
        templates: {},
        schemas: [],
        specs: { oas3: { paths: {} } },
      } as RawBuiltInArtifact
    );
    // assign the openapi version and info to the merged artifact
    merged.specs['oas3'] = {
      ...merged.specs['oas3'],
      // Follow the OpenAPI specification version 3.0.3
      // see https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md
      openapi: '3.0.3',
      info: {
        title: 'Data API',
        version: 'latest',
        description: 'Data API for Canner Enterprise',
      },
    };
    return merged as BuiltInArtifact;
  }
}
