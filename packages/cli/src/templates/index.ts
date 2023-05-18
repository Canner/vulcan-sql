import { InitCommandOptions } from '../commands/init';

const defaultInit = [{
  type: 'file',
  filepath: 'package.json',
  startMessage: 'Preparing package.json...',
  successMessage: 'package.json has been prepared.',
  content: (options: InitCommandOptions) => {
    return JSON.stringify(
      {
        name: options.projectName,
        dependencies: {
          '@vulcan-sql/core': options.version,
          '@vulcan-sql/serve': options.version,
        },
        devDependencies: {
          '@vulcan-sql/build': options.version,
        },
      },
      null,
      2
    );
  }
}, {
  type: 'exec',
  command: 'npm install --silent',
  startMessage: 'Installing dependencies...',
  successMessage: 'Dependencies have been installed.',
}, {
  type: 'copyFiles',
  templateName: 'default',
  startMessage: 'Writing initial content...',
  successMessage: 'Initial content has been written.',
}, {
  type: 'info',
  message: (projectPath: string) => `Project has been initialized. Set the profiles and run "cd ${projectPath} && vulcan start" to start the server.`
}];

const binaryInit = [{
  type: 'copyFiles',
  templateName: 'binary',
  startMessage: 'Writing initial content...',
  successMessage: 'Initial content has been written.',
}, {
  type: 'info',
  message: (projectPath: string) => `Project has been initialized. Run "cd ${projectPath} && vulcan start" to start the server.`
}];

const nodejsQuickStartInit = [{
  type: 'file',
  filepath: 'package.json',
  startMessage: 'Preparing package.json...',
  successMessage: 'package.json has been prepared.',
  content: (options: InitCommandOptions) => {
    return JSON.stringify(
      {
        name: options.projectName,
        dependencies: {
          '@vulcan-sql/core': options.version,
          '@vulcan-sql/serve': options.version,
          '@vulcan-sql/extension-driver-duckdb': options.version,
        },
        devDependencies: {
          '@vulcan-sql/build': options.version,
        },
      },
      null,
      2
    );
  }
}, {
  type: 'exec',
  command: 'npm install --silent',
  startMessage: 'Installing dependencies...',
  successMessage: 'Dependencies have been installed.',
}, {
  type: 'copyFiles',
  templateName: 'nodejs-quick-start',
  startMessage: 'Writing initial content...',
  successMessage: 'Initial content has been written.',
}, {
  type: 'info',
  message: (projectPath: string) => `Project has been initialized. Run "cd ${projectPath} && vulcan start" to start the server.`
}];

export const initTemplates: Record<string, any[]> = {
  default: defaultInit,
  nodejs: defaultInit,
  binary: binaryInit,
  'quick-start-from-binary': binaryInit,
  'quick-start-from-nodejs': nodejsQuickStartInit,
};
