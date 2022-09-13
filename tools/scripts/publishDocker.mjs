import { getReleaseTag, getVersionByArguments } from './version.mjs';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

// node publishDocker.mjs <tag> <version>

if (process.env.READY_FOR_PUBLISH !== 'true') {
  console.log(`Set env READY_FOR_PUBLISH=true before running publish commands.`)
  process.exit(1);
}

const packageName = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8')).name.replace('@vulcan-sql/', '');
if (!packageName) throw new Error(`Can't find package name`);
const version = getVersionByArguments();
const tag = getReleaseTag();

// run docker build xxx -t vulcan-sql/<package-name>:<version> before publish
// we tag it with url and version
execSync(`docker tag vulcan-sql/${packageName}:${version} ghcr.io/canner/vulcan-sql/${packageName}:${version}`);
execSync(`docker tag vulcan-sql/${packageName}:${version} ghcr.io/canner/vulcan-sql/${packageName}:${tag}`);
// push
execSync(`docker push ghcr.io/canner/vulcan-sql/${packageName}:${version}`);
execSync(`docker push ghcr.io/canner/vulcan-sql/${packageName}:${tag}`);