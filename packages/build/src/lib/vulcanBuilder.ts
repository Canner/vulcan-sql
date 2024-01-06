import {
  IBuildOptions,
  Packager,
  PackagerOptions,
} from '@vulcan-sql/build/models';
import { Semantic } from '@vulcan-sql/core';
import { Container, TYPES } from '@vulcan-sql/build/containers';
import { SchemaParser } from '@vulcan-sql/build/schema-parser';
import {
  DataSource,
  BuiltInArtifactKeys,
  TemplateEngine,
  TYPES as CORE_TYPES,
  VulcanArtifactBuilder,
  getLogger,
  ConfigurationError,
} from '@vulcan-sql/core';
import * as path from 'path';
import { DocumentGenerator } from './document-generator';
import { interfaces } from 'inversify';
import { uniq } from 'lodash';
import { 
  buildSemanticModels,
  runVulcanEngine,
  generateSqlTemplates,
  generateServeFiles,
  generateCLIShell,
} from './utils';
import { copyFileSync, promises as fs } from 'fs';


const logger = getLogger({ scopeName: 'BUILD' });

export class VulcanBuilder {
  private options: IBuildOptions;
  constructor(options: IBuildOptions) {
    this.options = options;
  }

  private async buildVulcanAPILayer(packagerOptions?: PackagerOptions) {
    const container = new Container();
    await container.load(this.options);
    const schemaParser = container.get<SchemaParser>(TYPES.SchemaParser);
    const templateEngine = container.get<TemplateEngine>(
      CORE_TYPES.TemplateEngine
    );
    const artifactBuilder = container.get<VulcanArtifactBuilder>(
      CORE_TYPES.ArtifactBuilder
    );
    const documentGenerator = container.get<DocumentGenerator>(
      TYPES.DocumentGenerator
    );

    // Activate data sources
    const dataSources =
      container.getAll<DataSource>(CORE_TYPES.Extension_DataSource) || [];
    for (const dataSource of dataSources) {
      logger.debug(`Initializing data source: ${dataSource.getExtensionId()}`);
      await dataSource.activate();
      logger.debug(`Data source ${dataSource.getExtensionId()} initialized`);
    }

    const { metadata, templates } = await templateEngine.compile();
    const { schemas } = await schemaParser.parse({ metadata });

    // check if exist duplicate url paths in schemas, before generating API document and build artifact.
    const urlPaths = schemas.map((schema) => schema.urlPath);
    if (uniq(urlPaths).length !== urlPaths.length)
      throw new ConfigurationError(
        'Duplicate "urlPath" found in schemas, please check your definition of each schemas.'
      );

    artifactBuilder.addArtifact(BuiltInArtifactKeys.Templates, templates);
    artifactBuilder.addArtifact(BuiltInArtifactKeys.Schemas, schemas);

    await documentGenerator.generateDocuments(schemas);
    await artifactBuilder.build();

    // Package
    if (packagerOptions) {
      const packagerName = `${packagerOptions.output}_${packagerOptions.target}`;
      const packagerFactory = container.get<
        interfaces.AutoNamedFactory<Packager>
      >(TYPES.Factory_Packager);
      const packager = packagerFactory(packagerName);
      await packager.activate();
      await packager.package(this.options);
    }

    await container.unload();
  }

  private async prepareVulcanEngine(
    config: any,
    platform: string,
    shouldPull?: boolean,
    packagerOptions?: PackagerOptions,
    isWatchMode?: boolean,
  ) {
    logger.warn('At the moment, we only support one mdl file.');
    const { semantic, compiledFilePath, compiledFileName } = await buildSemanticModels();
    if (semantic) {
      await runVulcanEngine(semantic, compiledFilePath, platform, shouldPull, isWatchMode);
      await generateSqlTemplates(semantic.toJSON(), config);

      if (packagerOptions?.target === 'vulcan-server') {
        const targetFolderPath = path.resolve(process.cwd(), 'dist/vulcansql-core-server');
        await fs.mkdir(targetFolderPath, { recursive: true });

        generateServeFiles(targetFolderPath, semantic);
        generateCLIShell(targetFolderPath, semantic);
        copyFileSync(
          compiledFilePath,
          path.resolve(targetFolderPath, compiledFileName)
        );
        await fs.writeFile(
          path.join(targetFolderPath, '.env'),
          `PLATFORM=${packagerOptions.platform}\n` +
          `MDL_PATH=./${compiledFileName}\n` +
          `CONFIG_PATH=./config.properties\n` +
          `LAUNCH_CLI_PATH=./launch-cli.sh\n` +
          `COMPOSE_PROJECT_NAME=vulcansql\n`
        );
      }
    }
  
    return semantic;
  }

  public async build(
    platform: string,
    shouldPull: boolean,
    isWatchMode: boolean,
    shouldPrepareVulcanEngine: boolean,
    packagerOptions?: PackagerOptions,
  ) {
    let semantic: Semantic | undefined;
    if (shouldPrepareVulcanEngine) {
      semantic = await this.prepareVulcanEngine(
        this.options,
        platform, 
        shouldPull,
        packagerOptions,
        isWatchMode,
      );
    }

    await this.buildVulcanAPILayer(packagerOptions);
    return semantic;
  }
}
