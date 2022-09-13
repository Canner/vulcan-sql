import { execSync } from 'child_process';
import { getReleaseTag, getVersionByArguments } from './version.mjs';
import path from 'path';
import fs from 'fs';

// node publish.mjs <tag> <version>
// CWD: ./dist/packages/xxx
const packageJSONPath = path.resolve(process.cwd(), 'package.json');

if (process.env.READY_FOR_PUBLISH !== 'true') {
  console.log(`Set env READY_FOR_PUBLISH=true before running publish commands.`)
  process.exit(1);
}

const tag = getReleaseTag();

// Update the version property in package.json
const version = getVersionByArguments();
const packageJSON = JSON.parse(fs.readFileSync(packageJSONPath, 'utf-8'));
packageJSON.version = version;
fs.writeFileSync(packageJSONPath, JSON.stringify(packageJSON, null, 2), 'utf-8');

// Set npm credential
fs.writeFileSync('.npmrc', '//registry.npmjs.org/:_authToken=${NPM_TOKEN}', 'utf-8');
// Execute "npm publish" to publish
execSync(`npm publish --tag ${tag}`); 
