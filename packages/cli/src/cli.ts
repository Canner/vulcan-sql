import { Command } from 'commander';
import {
  handleInit,
  handlePackage,
  handleStart,
  handleVersion,
  handleBuild,
  handleServe,
  handleCatalog,
  handleCli,
  handleStop,
} from './commands';

export interface CliProgramOptions {
  requireFromLocal?: boolean;
}

export const initializeProgram = (program: Command, options?: CliProgramOptions) => {

  // Default to require from local, which means the CLI will use the local dependencies
  const requireFromLocal = options?.requireFromLocal ?? true;
  program.exitOverride();

  program
    .command('version')
    .description('show the version of CLI and Vulcan packages')
    .action(async () => {
      await handleVersion(requireFromLocal);
    });

  program
    .command('hello')
    .argument('[path]', 'folder path to initialize Vulcan project')
    .description('quick-start to try VulcanSQL')
    .option('-p --project-name <project-name>', 'specify project name')
    .action(async (path: string | undefined, options) => {
      options = options || {};
      await handleInit(path, {...options, template: 'quick-start-from-binary'});
    });

  program
    .command('init')
    .argument('[path]', 'folder path to initialize Vulcan project')
    .description('create a new Vulcan project')
    .option('-p --project-name <project-name>', 'specify project name')
    .option('-v --version <version>', 'specify Vulcan version')
    .option('-t --template <template>', 'specify template to start with')
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
    .option('--pull', 'Pull latest docker images')
    .action(async (options) => {
      await handleBuild({...options, requireFromLocal});
    });

  program
    .command('package')
    .description('package Vulcan project for production environments')
    .option(
      '-c --config <config-path>',
      'path to Vulcan config file',
      './vulcan.yaml'
    )
    .option('-o --output <output>', 'package output type', 'node')
    .option('-t --target <target>', 'target package', 'vulcan-server')
    .action(async (options) => {
      await handlePackage({...options, requireFromLocal});
    });

  program
    .command('catalog')
    .alias('catalog-server')
    .description('serve Vulcan catalog server')
    .option('-p --port <port>', 'catalog server port', '4200')
    .action(async (options) => {
      await handleCatalog({...options, requireFromLocal});
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
    .option('--pull', 'Pull latest docker images')
    .action(async (options) => {
      await handleServe({...options, requireFromLocal});
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
    .option('-w --watch', 'watch file changes', false)
    .option('--pull', 'Pull latest docker images')
    .action(async (options) => {
      await handleStart({...options, requireFromLocal});
    });

  program
    .command('cli')
    .description('Run psql CLI in the specified directory')
    .action(async () => {
      await handleCli();
    });

  program
    .command('stop')
    .description('Stop VulcanSQL engine')
    .action(async () => {
      await handleStop();
    });
};
