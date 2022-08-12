import { Command } from './base';
import * as path from 'path';
import { promises as fs } from 'fs';

export class VersionCommand extends Command {
  public async handle(): Promise<void> {
    this.logger.info(`cli version: ${await this.cliVersion()}`);
    for (const pkg of ['core', 'build', 'serve']) {
      this.logger.info(
        `${pkg} version: ${await this.localModuleVersion(`@vulcan-sql/${pkg}`)}`
      );
    }
  }

  private async cliVersion() {
    return JSON.parse(
      await fs.readFile(
        path.resolve(__dirname, '..', '..', 'package.json'),
        'utf8'
      )
    ).version;
  }

  private async localModuleVersion(moduleName: string): Promise<string> {
    try {
      const packageJson = path.resolve(
        process.cwd(),
        'node_modules',
        moduleName,
        'package.json'
      );
      return JSON.parse(await fs.readFile(packageJson, 'utf8')).version;
    } catch {
      return '-';
    }
  }
}
