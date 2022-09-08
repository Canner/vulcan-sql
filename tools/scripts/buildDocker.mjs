import { getVersionByArguments } from './version.mjs';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

// CWD: ./dist/packages/xxx
const packageJSONPath = path.resolve(process.cwd(), 'package.json');

const packageName = JSON.parse(fs.readFileSync(packageJSONPath, 'utf-8')).name.replace('@vulcan-sql/', '');
if (!packageName) throw new Error(`Can't find package name`);
const version = getVersionByArguments();

// Update the version property in package.json
const packageJSON = JSON.parse(fs.readFileSync(packageJSONPath, 'utf-8'));
packageJSON.version = version;
fs.writeFileSync(packageJSONPath, JSON.stringify(packageJSON, null, 2), 'utf-8');

// Build image with tags
execSync(`docker build -f ./packages/${packageName}/Dockerfile -t vulcan-sql/${packageName}:${version} .`, {
  cwd: path.resolve(process.cwd(), '..', '..', '..')
});
