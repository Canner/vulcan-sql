import { VulcanExtensionId, VulcanInternalExtension } from '@vulcan-sql/api-layer';
import { IBuildOptions } from '../../../models/buildOptions';
import {
  Packager,
  PackagerName,
  PackagerTarget,
} from '../../../models/extensions';
import * as path from 'path';
import { promises as fs } from 'fs';

@VulcanExtensionId(PackagerName.NodeCatalog)
@VulcanInternalExtension('node-packager')
export class NodeCatalogPackager extends Packager {
  private logger = this.getLogger();
  private readonly target = PackagerTarget.CatalogServer;

  public async package(option: IBuildOptions): Promise<void> {
    const config = this.getConfig() || {};
    const { folderPath = 'dist' } = config[this.target] || {};
    const distFolder = path.resolve(process.cwd(), folderPath);
    await fs.rm(distFolder, { recursive: true, force: true });
    await fs.mkdir(distFolder, { recursive: true });
    // package.json
    await fs.writeFile(
      path.resolve(distFolder, 'package.json'),
      JSON.stringify(await this.getCatalogPackageJson(), null, 4),
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
      await this.getCatalogEntryJS(),
      'utf-8'
    );
    this.logger.info(
      `Package successfully, you can go to "${folderPath}" folder and run "npm install && node index.js" to start the server`
    );
  }
}
