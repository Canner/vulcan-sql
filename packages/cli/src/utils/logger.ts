import { Logger } from 'tslog';

// We don't use createLogger helper from core package because CLI will be installed before all packages.
export const logger = new Logger({
  name: 'CLI',
  minLevel: 'info',
  exposeErrorCodeFrame: false,
  displayFilePath: 'hidden',
  displayFunctionName: false,
});
