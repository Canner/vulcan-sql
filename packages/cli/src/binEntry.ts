#!/usr/bin/env node
// The entrypoint of the pre-bundled CLI
import { program } from 'commander';
import { logger } from './utils';
import { initializeProgram } from './cli';

(async () => {
  try {
    // When calling from the pre-bundled CLI, we don't want to require from local
    // because the CLI is already bundled with the dependencies
    initializeProgram(program, { requireFromLocal: false });
    await program.parseAsync();
  } catch (e: any) {
    // Ignore error with exit code = 0, e.g. commander.helpDisplayed error
    if (e?.exitCode === 0) return;
    logger.prettyError(e, true, false, true);
    process.exit(e?.exitCode ?? 1);
  }
})();
