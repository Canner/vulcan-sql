import { localModulePath } from '../utils';
import { createServer } from 'http';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as jsYAML from 'js-yaml';

export interface CatalogCommandOptions {
  config: string;
  port: number;
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
  const next = await import(localModulePath('next'));
  const dirPath = localModulePath('@vulcan-sql/catalog-server');

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

export const handleCatalog = async (
  options: Partial<CatalogCommandOptions>
): Promise<void> => {
  await serveCatalog(mergeCatalogDefaultOption(options));
};
