import {
  ArtifactBuilder,
  FileTemplateProvider,
  LocalFilePersistentStore,
  TemplateEngine,
  VulcanArtifactBuilder,
} from '@vulcan/core';
import { FileSchemaReader, SchemaParser } from '../schema-parser';

export class BuildPipeline {
  private schemaParser: SchemaParser;
  private templateEngine: TemplateEngine;
  private artifactBuilder: ArtifactBuilder;

  constructor({
    schemaParser,
    templateEngine,
    artifactBuilder,
  }: {
    schemaParser: SchemaParser;
    templateEngine: TemplateEngine;
    artifactBuilder: ArtifactBuilder;
  }) {
    this.schemaParser = schemaParser;
    this.templateEngine = templateEngine;
    this.artifactBuilder = artifactBuilder;
  }

  static default({
    sourceFolderPath,
    destinationFilePath,
  }: {
    sourceFolderPath: string;
    destinationFilePath: string;
  }): BuildPipeline {
    const schemaReader = new FileSchemaReader({
      folderPath: sourceFolderPath,
    });
    const schemaParser = new SchemaParser({
      schemaReader,
      // TODO: mock loader, should be replaced with real loader from core package
      validatorLoader: {
        getLoader: () => ({
          name: '',
          validateSchema: () => true,
          validateData: () => true,
        }),
      },
    });
    const templateProvider = new FileTemplateProvider({
      folderPath: sourceFolderPath,
    });
    const templateEngine = TemplateEngine.useDefaultLoader({
      templateProvider,
    });
    const persistentStore = new LocalFilePersistentStore({
      filePath: destinationFilePath,
    });
    const artifactBuilder = new VulcanArtifactBuilder({ persistentStore });
    return new BuildPipeline({
      schemaParser,
      templateEngine,
      artifactBuilder,
    });
  }

  public async build() {
    const { compiler, templates, metadata } =
      await this.templateEngine.compile();
    const { schemas } = await this.schemaParser.parse({ metadata });
    await this.artifactBuilder.build({
      schemas,
      compiler,
      templates,
    });
  }
}
