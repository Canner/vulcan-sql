import * as inquirer from 'inquirer';
import { promises as fs } from 'fs';
import * as path from 'path';
import { version } from '../../package.json';
import * as ora from 'ora';
import { exec } from 'child_process';
import * as nunjucks from 'nunjucks';
import * as glob from 'glob';
import { logger } from '../utils';
import { initTemplates } from '../templates';

export interface InitCommandOptions {
  projectName: string;
  version: string;
  template?: string;
}

const validators: Record<
  string,
  {
    regex: RegExp;
    errorMessage: string;
  }
> = {
  projectName: {
    regex: /^[a-zA-Z0-9_-]+$/,
    errorMessage: `Project name should contain only letters, numbers, or dashes.`,
  },
};

const validateAnswer = (name: string) => (input: string) => {
  const validator = validators[name];
  if (!validator.regex.test(input)) {
    throw new Error(validator.errorMessage);
  }
  return true;
};

export const createProject = async (
  initPath: string | undefined,
  options: InitCommandOptions
): Promise<void> => {
  const projectPath = path.resolve(
    process.cwd(),
    initPath || options.projectName
  );
  await fs.mkdir(projectPath, { recursive: true });
  const existedFiles = await fs.readdir(projectPath);
  if (existedFiles.length > 0)
    throw new Error(`The directory ${projectPath} is not empty.`);

  const template = options.template || 'default';
  // based on template, we can have different init process
  const initTasks = initTemplates[template];
  if (!initTasks) {
    throw new Error(`Template ${template} is not supported.`);
  }

  const installSpinner = ora('Initializing project...').start();
  try {
    for (const task of initTasks) {
      switch (task.type) {
        case 'file':
          installSpinner.start(task.startMessage);
          await fs.writeFile(
            path.resolve(projectPath, task.filepath),
            task.content(options),
            'utf-8'
          );
          installSpinner.succeed(task.successMessage);
          break;
        case 'exec':
          installSpinner.start(task.startMessage);
          await execAndWait(task.command, projectPath);
          installSpinner.succeed(task.successMessage);
          break;
        case 'copyFiles':
          installSpinner.start(task.startMessage);
          await copyFiles(
            projectPath,
            task.templateName,
            options
          );
          installSpinner.succeed(task.successMessage);
          break;
        case 'info':
          logger.info(task.message(projectPath));
          break;
        default:
          throw new Error(`Task type ${task.type} is not supported.`);
      }
    }
  } catch (e) {
    installSpinner.fail();
    throw e;
  } finally {
    installSpinner.stop();
  }
};

export const execAndWait = async (command: string, cwd: string) => {
  return new Promise<void>((resolve, reject) => {
    exec(command, { cwd }, (error, _, stderr) => {
      if (error) {
        reject(stderr);
      }
      resolve();
    });
  });
};

const copyFiles = async (
  projectPath: string,
  templateName: string,
  options: InitCommandOptions
) => {
  if (!templateName) {
    throw new Error(`Template name is required.`);
  }

  const files = await listFiles(
    path.resolve(__dirname, '..', 'templates', templateName, '**/*.*')
  );

  for (const file of files) {
    const relativePath = path.relative(
      path.resolve(__dirname, '..', 'templates', templateName),
      file
    );
    let templateContent = await fs.readFile(file, 'utf8');
    if (path.extname(file) === '.yaml') {
      // Only render yaml files because sql files have some template scripts which are used by Vulcan.
      templateContent = nunjucks.renderString(templateContent, {
        options,
      });
    }
    const targetPath = path.resolve(projectPath, relativePath);
    const dir = path.dirname(targetPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(targetPath, templateContent, 'utf8');
  }
};

const listFiles = async (pattern: string) => {
  return new Promise<string[]>((resolve, reject) => {
    // Windows use backslash when using path.resolve, e.g. C:\\Users\\xxxxx\\cli. but glob accepts only forward ward slash
    // Glob: https://github.com/isaacs/node-glob#windows
    // Path separator: https://nodejs.org/api/path.html#pathsep
    const normalizedPattern = pattern.split(path.sep).join('/');
    glob(normalizedPattern, (err, files) => {
      if (err) return reject(err);
      return resolve(files);
    });
  });
};

export const handleInit = async (
  initPath: string | undefined,
  options: Partial<InitCommandOptions>
): Promise<void> => {
  const question = [];

  if (!options.projectName) {
    question.push({
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: 'my-first-vulcan-project',
      validate: validateAnswer('projectName'),
    });
  } else {
    validateAnswer('projectName')(options.projectName);
  }

  options = {
    ...{ version },
    ...options,
    ...(await inquirer.prompt(question)),
  };

  await createProject(initPath, options as InitCommandOptions);
};
