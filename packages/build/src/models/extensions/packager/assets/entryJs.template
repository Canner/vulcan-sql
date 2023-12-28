const { VulcanServer } = require('@vulcan-sql/serve');
const { getLogger } = require('@vulcan-sql/core');
const logger = getLogger({ scopeName: 'CORE' });
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
const server = new VulcanServer(config);
server.start().then(() => logger.info('server started'));