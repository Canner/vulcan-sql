import { modulePath } from '../utils';
import { createServer } from 'http';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as jsYAML from 'js-yaml';
import * as ora from 'ora';
import { execSync, spawnSync } from 'child_process';

export interface CatalogCommandOptions {
  config: string;
  port: number;
  requireFromLocal?: boolean;
}

const defaultOptions: CatalogCommandOptions = {
  config: './vulcan.yaml',
  port: 4200,
};

const mergeCatalogDefaultOption = (options: Partial<CatalogCommandOptions>) => {
  return {
    ...defaultOptions,
    ...options,
  } as CatalogCommandOptions;
};

const serveCatalog = async (options: CatalogCommandOptions) => {
  const configPath = path.resolve(process.cwd(), options.config);
  const config: any = jsYAML.load(await fs.readFile(configPath, 'utf-8'));
  // we need to use the "next" module in the same root with our "catalog-server" module
  // or it may fail to get next.config.js variables in the app
  const next = await import(modulePath('next', options.requireFromLocal));
  const dirPath = modulePath('@vulcan-sql/catalog-server', options.requireFromLocal);

  // provide catalog-server env variables for interacting with vulcan-server host
  process.env['VULCAN_SQL_HOST'] = `http://localhost:${config.port || 3000}`;

  const catalogConfig = config.catalog || {};
  const hostname = catalogConfig.hostname || 'localhost';
  const port = catalogConfig.port || Number(options.port);
  const app = next({ dev: false, hostname, port, dir: dirPath });

  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    createServer(async (req, res) => {
      handle(req, res);
    }).listen(port, async () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
  });
};

const serveCatalogByDocker = async (options: CatalogCommandOptions) => {
  const configPath = path.resolve(process.cwd(), options.config);
  const config: any = jsYAML.load(await fs.readFile(configPath, 'utf-8'));
  const catalogConfig = config.catalog || {};
  const port = catalogConfig.port || Number(options.port);
  const VULCAN_SQL_HOST = `http://host.docker.internal:${config.port || 3000}`

  // sync the version with binary package.json
  const catalogVersion = JSON.parse(await fs.readFile(path.resolve('/snapshot/binary', 'package.json'), 'utf-8'))['version']
  const dockerImage = `ghcr.io/canner/vulcan-sql/catalog-server:${catalogVersion}`
  const containerName = "catalog-server"

  const checkDocker = ()  => {
    try {
      execSync('docker ps')
    } catch(e) {
      throw new Error('docker is not running')
    }
  }

  const removeContainer= () => {
    try {
      execSync(`docker ps -a | grep ${containerName}`)
      execSync(`docker rm -f ${containerName}`)
    } catch(e) {
      // do nothing
    }
  }

  const spinner = ora('Starting catalog-server...').start();
  try {
    checkDocker()
    removeContainer()

    const args = ['run', '-it', '-p', `${port}:4200`, '-e', `VULCAN_SQL_HOST=${VULCAN_SQL_HOST}`, '--name', containerName, dockerImage];
    spawnSync('docker', args , { stdio: 'inherit' })
    spinner.succeed('Started catalog-server successfully.');
  } catch(e) {
    spinner.fail();
    throw e
  } finally {
    spinner.stop();
  }
}

export const handleCatalog = async (
  options: Partial<CatalogCommandOptions>
): Promise<void> => {
  const isPkg = Boolean((<any>process).pkg)
  if(isPkg) {
    await serveCatalogByDocker(mergeCatalogDefaultOption(options))
  } else {
    await serveCatalog(mergeCatalogDefaultOption(options));
  }
};
