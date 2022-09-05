import { execSync } from 'child_process';

if (process.env.READY_FOR_PUBLISH !== 'true') {
  console.log(`Set env READY_FOR_PUBLISH=true before running publish commands.`)
  process.exit(1);
}

// Executing publish script: node path/to/publish.mjs {tag}
// Default "tag" to "alpha" so we won't publish the "latest" tag by accident.
let [, , tag] = process.argv;
if (!tag || tag === 'undefined') tag = 'alpha';

// Execute "npm publish" to publish
execSync(`npm publish --tag ${tag}`);
