#!/usr/bin/env node

import { program } from 'commander';
import { handleInit, handleStart, handleVersion } from './commands';
import { handleBuild } from './commands/build';
import { handleServe } from './commands/serve';
import { logger } from './utils';

program.exitOverride();

program
  .command('version')
  .description('show the version of CLI and Vulcan packages')
  .action(async () => {
    await handleVersion();
  });

program
  .command('init')
  .description('create a new Vulcan project')
  .option('-p --project-name <project-name>', 'specify project name')
  .action(async (options) => {
    await handleInit(options);
  });

program
  .command('build')
  .description('build Vulcan project')
  .option(
    '-c --config <config-path>',
    'path to Vulcan config file',
    './vulcan.yaml'
  )
  .action(async (options) => {
    await handleBuild(options);
  });

program
  .command('serve')
  .description('serve Vulcan project')
  .option(
    '-c --config <config-path>',
    'path to Vulcan config file',
    './vulcan.yaml'
  )
  .option('-p --port <port>', 'server port', '3000')
  .action(async (options) => {
    await handleServe(options);
  });

program
  .command('start')
  .description('build and serve Vulcan project')
  .option(
    '-c --config <config-path>',
    'path to Vulcan config file',
    './vulcan.yaml'
  )
  .option('-p --port <port>', 'server port', '3000')
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
