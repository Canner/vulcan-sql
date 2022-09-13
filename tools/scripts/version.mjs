import semver from 'semver';
import path from 'path';
import fs from 'fs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import dayjs from 'dayjs';
dayjs.extend(utc)
dayjs.extend(timezone);


export function getNightlyVersion() {
  const packageJson = fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8');
  const { major, minor, patch } = semver.parse(JSON.parse(packageJson).version);
  // 0.1.0-dev.20220907.0
  return `${major}.${minor}.${patch}-dev.${dayjs().tz('Asia/Taipei').format('YYYYMMDD')}.0`
}


export function getBetaVersion() {
  const packageJson = fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8');
  const { major, minor, patch } = semver.parse(JSON.parse(packageJson).version);
  // 0.1.0-beta.0
  return `${major}.${minor}.${patch}-beta.0`
}

export function getLatestVersion() {
  const packageJson = fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8');
  const { major, minor, patch } = semver.parse(JSON.parse(packageJson).version);
  // Remove all prerelease message
  // 0.1.0
  return `${major}.${minor}.${patch}`
}

export function getReleaseTag() {
  // Executing publish script: node path/to/xxxx.mjs {tag}
  let [, , tag] = process.argv;

  if (!['dev', 'beta', 'latest'].includes(tag))
    throw new Error(`Unexpected tag ${tag}`);

  return tag;
}

/** Get the release version which is passed by argument directly */
export function getReleaseVersionInArguments() {
  // Executing publish script: node path/to/xxxx.mjs {tag} {version}
  let [, , , version] = process.argv;

  if (!version || version === 'undefined') return null;

  return version;
}

/** Get the release version from argument or generate one by tag */
export function getVersionByArguments() {
  const versionFromInArg = getReleaseVersionInArguments();
  if (versionFromInArg) return versionFromInArg;

  const tag = getReleaseTag();
  switch (tag) {
    case 'dev':
      return getNightlyVersion();
    case 'beta':
      return getBetaVersion();
    case 'latest':
      return getLatestVersion();
    default:
      throw new Error(`Unexpected tag ${tag}`)
  }

}
