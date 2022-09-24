#!/usr/bin/env node

import { logger } from './utils';
import { program } from './cli';

(async () => {
  try {
    await program.parseAsync();
  } catch (e: any) {
    // Ignore error with exit code = 0, e.g. commander.helpDisplayed error
    if (e?.exitCode === 0) return;
    logger.prettyError(e, true, false, true);
    process.exit(e?.exitCode ?? 1);
  }
})();
