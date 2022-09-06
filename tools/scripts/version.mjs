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
  const { version } = JSON.parse(packageJson);
  // 0.1.0-dev.20220907.0
  return semver.inc(version, 'prerelease', `dev.${dayjs().tz('Asia/Taipei').format('YYYYMMDD')}`)
}


export function getBetaVersion() {
  const packageJson = fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8');
  const { version } = JSON.parse(packageJson);
  // 0.1.0-beta.0
  return semver.inc(version, 'prerelease', `beta`)
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



export function getVersionByArguments() {
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
