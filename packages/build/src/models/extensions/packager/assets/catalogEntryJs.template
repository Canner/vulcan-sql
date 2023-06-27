const { createServer } = require('http');
const fs = require('fs');
const path = require('path');
const next = require('next');
const dirPath = path.resolve(
  process.cwd(),
  'node_modules',
  '@vulcan-sql/catalog-server'
);
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
process.env['VULCAN_SQL_HOST'] = `http://localhost:${config.port || 3000}`;
const catalog = config.catalog || {};
const hostname = catalog.hostname || 'localhost';
const port = catalog.port || 4200;
const app = next({
  dev: false,
  hostname,
  port,
  dir: dirPath,
});
const handle = app.getRequestHandler();
app.prepare().then(() => {
  createServer(async (req, res) => {
    handle(req, res);
  }).listen(port, async () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
