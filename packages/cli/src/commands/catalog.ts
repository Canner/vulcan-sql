import { localModulePath } from '../utils';
import { createServer } from 'http';

export interface CatalogCommandOptions {
  port: number;
}

const defaultOptions: CatalogCommandOptions = {
  port: 4200,
};

const mergeCatalogDefaultOption = (options: Partial<CatalogCommandOptions>) => {
  return {
    ...defaultOptions,
    ...options,
  } as CatalogCommandOptions;
};

const serveCatalog = async (options: CatalogCommandOptions) => {
  const next = await import(localModulePath('next'));
  const dirPath = localModulePath('@vulcan-sql/catalog-server');

  const hostname = 'localhost';
  const port = Number(options.port);
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
