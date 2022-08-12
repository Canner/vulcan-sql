#!/usr/bin/env node

import { program } from 'commander';
import { handleInit, handleStart, handleVersion } from './commands';
import { handleBuild } from './commands/build';
import { handleServe } from './commands/serve';
import { logger } from './utils';

program.exitOverride();

program.command('version').action(async () => {
  await handleVersion();
});

program
  .command('init')
  .option('-p --project-name <project-name>')
  .action(async (options) => {
    await handleInit(options);
  });

program
  .command('build')
  .option('-c --config <config-path>')
  .action(async (options) => {
    await handleBuild(options);
  });

program
  .command('serve')
  .option('-c --config <config-path>')
  .option('-p --port <port>')
  .action(async (options) => {
    await handleServe(options);
  });

program
  .command('start')
  .option('-c --config <config-path>')
  .option('-p --port <port>')
  .action(async (options) => {
    await handleStart(options);
  });

(async () => {
  try {
    await program.parseAsync();
  } catch (e: any) {
    // Ignore error with exit code = 0, e.g. commander.helpDisplayed error
    if (e?.exitCode === 0) return;
    logger.prettyError(e, true, false, false);
    process.exit(e?.exitCode ?? 1);
  }
})();
