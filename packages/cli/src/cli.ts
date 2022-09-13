import { program } from 'commander';
import { handleInit, handleStart, handleVersion } from './commands';
import { handleBuild } from './commands/build';
import { handleServe } from './commands/serve';

program.exitOverride();

program
  .command('version')
  .description('show the version of CLI and Vulcan packages')
  .action(async () => {
    await handleVersion();
  });

program
  .command('init')
  .argument('[path]', 'folder path to initialize Vulcan project')
  .description('create a new Vulcan project')
  .option('-p --project-name <project-name>', 'specify project name')
  .action(async (path: string | undefined, options) => {
    await handleInit(path, options || {});
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

export { program };
