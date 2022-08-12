import { Command } from './base';
import * as jsYAML from 'js-yaml';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as ora from 'ora';

export interface StartCommandOptions {
  config: string;
  port: number;
}

const defaultConfig: StartCommandOptions = {
  config: './vulcan.yaml',
  port: 3000,
};

export class StartCommand extends Command {
  public async handle(options: Partial<StartCommandOptions>): Promise<void> {
    options = {
      ...defaultConfig,
      ...options,
    };
    await this.buildAndServe(options as StartCommandOptions);
  }

  public async buildAndServe(options: StartCommandOptions) {
    const configPath = path.resolve(process.cwd(), options.config);
    const config: any = jsYAML.load(await fs.readFile(configPath, 'utf-8'));

    // Import dependencies. We use dynamic import here to import dependencies at runtime.
    const { VulcanBuilder } = await import(
      this.localModulePath('@vulcan-sql/build')
    );
    const { VulcanServer } = await import(
      this.localModulePath('@vulcan-sql/serve')
    );

    // Build project
    const spinner = ora('Building project...').start();
    try {
      const builder = new VulcanBuilder(config);
      await builder.build();
      spinner.succeed('Built successfully.');

      // Start server
      this.logger.info('Starting server...');
      const server = new VulcanServer(config);
      await server.start(options.port);
      this.logger.info(`Server is listening at port ${options.port}.`);
    } catch (e) {
      spinner.fail();
      throw e;
    } finally {
      spinner.stop();
    }
  }

  private localModulePath(moduleName: string): string {
    return path.resolve(process.cwd(), 'node_modules', moduleName);
  }
}
