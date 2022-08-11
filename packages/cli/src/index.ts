import { program } from 'commander';
import { InitCommand } from './commands';
import { Logger } from 'tslog';

// We don't use createLogger helper from core package because CLI will be installed before all packages.
const logger = new Logger({
  name: 'CLI',
  minLevel: 'info',
  exposeErrorCodeFrame: false,
  displayFilePath: 'hidden',
  displayFunctionName: false,
});

const initCommand = new InitCommand(logger);

program.exitOverride();

program
  .command('init')
  .option('-p --project-name <project-name>')
  .action(async (options) => {
    await initCommand.handle(options);
  });

(async () => {
  try {
    await program.parseAsync();
  } catch (e: any) {
    // Ignore error with exit code = 0, e.g. commander.helpDisplayed error
    if (e?.exitCode === 0) return;
    logger.prettyError(e, true, false, false);
    process.exit(1);
  }
})();
