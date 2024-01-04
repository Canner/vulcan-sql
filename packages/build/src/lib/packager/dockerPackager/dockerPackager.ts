import {
  ArtifactBuilderProviderType,
  VulcanExtensionId,
  VulcanInternalExtension,
} from '@vulcan-sql/core';
import { IBuildOptions } from '../../../models/buildOptions';
import {
  Packager,
  PackagerName,
  PackagerTarget,
} from '../../../models/extensions';
import * as path from 'path';
import { promises as fs } from 'fs';

@VulcanExtensionId(PackagerName.Docker)
@VulcanInternalExtension('docker-packager')
export class DockerPackager extends Packager {
  private logger = this.getLogger();
  private readonly target = PackagerTarget.VulcanServer;

  public async package(option: IBuildOptions): Promise<void> {
    const config = this.getConfig() || {};
    const { folderPath = 'dist/vulcansql-api-server' } = config[this.target] || {};
    const distFolder = path.resolve(process.cwd(), folderPath);
    await fs.rm(distFolder, { recursive: true, force: true });
    await fs.mkdir(distFolder, { recursive: true });
    // package.json
    await fs.writeFile(
      path.resolve(distFolder, 'package.json'),
      JSON.stringify(await this.getPackageJson(), null, 4),
      'utf-8'
    );
    // config.json (vulcan config)
    await fs.writeFile(
      path.resolve(distFolder, 'config.json'),
      JSON.stringify(option),
      'utf-8'
    );
    // entrypoint
    await fs.writeFile(
      path.resolve(distFolder, 'index.js'),
      await this.getEntryJS(),
      'utf-8'
    );
    // result.json
    if (
      option.artifact.provider === ArtifactBuilderProviderType.LocalFile &&
      option.artifact.filePath
    ) {
      // if option.artifact.filePath contains /, we need to create the folder first
      const folder = path.dirname(option.artifact.filePath);
      if (folder) {
        await fs.mkdir(path.resolve(distFolder, folder), {
          recursive: true,
        });
      }
      await fs.copyFile(
        path.resolve(process.cwd(), option.artifact.filePath),
        path.resolve(distFolder, option.artifact.filePath)
      );
    }
    // Dockerfile
    await fs.copyFile(
      path.resolve(__dirname, 'assets', 'Dockerfile'),
      path.resolve(distFolder, 'Dockerfile')
    );
    this.logger.info(
      `Package successfully, you can go to "${folderPath}" folder and run "docker build ." to build the image.`
    );
  }
}
