import * as ora from 'ora';
import * as detectPort from 'detect-port';
import { SemanticJSON, Semantic, Config, ColumnJSON, tokenize } from '@vulcan-sql/core';
import { get } from 'lodash';
import { readFileSync, writeFileSync, copyFileSync, promises as fs } from 'fs';
import * as path from 'path';
import { PropertiesEditor } from 'properties-file/editor';
import { dirSync } from 'tmp-promise';
import { execSync } from 'child_process';


const isDockerInstalled = () => {
  try {
    execSync('docker version', { stdio: 'ignore' });
    return true;
  } catch (e: any) {
    if (e.status === 127) {
      // command not found
      return false;
    } else if (e.status === 1) {
      // docker daemon is not running
      return true;
    }

    return false;
  }
};

const isDockerStarted = () => {
  try {
    execSync('docker ps', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

const isDockerComposeInstalled = () => {
  try {
    execSync('docker-compose version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

const isDockerComposeV2Installed = () => {
  try {
    execSync('docker compose version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

const dockerCompose = (() => {
  if (isDockerComposeV2Installed()) {
    return 'docker compose';
  }

  if (isDockerComposeInstalled()) {
    return 'docker-compose';
  }

  return '';
})();

const listDockerNetworks = () => {
  try {
    const result = execSync('docker network ls --format "{{.Name}}"', {
      stdio: 'pipe',
    });

    return result
      .toString()
      .split('\n')
      .filter((name) => name !== '');
  } catch {
    return [];
  }
};

const createNetwork = (name: string) => {
  try {
    const result = execSync(`docker network create ${name}`, {
      stdio: 'inherit',
    });
    return result.toString() === name;
  } catch {
    return false;
  }
};

interface assignFunction {
  (config: Config, cb: assignCallback): void;
}

interface assignCallback {
  (key: string, value: string): void;
}

interface configVariable {
  name: string;
  required: boolean;
  attribute: string;
  assign?: string | assignFunction;
  default?: string | number;
}

const postgresVariables: configVariable[] = [
  {
    name: 'username',
    required: false,
    attribute: 'username',
    assign: 'postgres.user',
    default: 'postgres',
  },
  {
    name: 'password',
    required: false,
    attribute: 'password',
    assign: 'postgres.password',
    default: '',
  },
  {
    name: 'host',
    required: true,
    attribute: 'host',
    assign: (config, cb) => {
      const host = config.get('host') || 'localhost';
      const port = config.get('port') || 5432;
      const schema = config.get('schema') || 'public';
      // project is the database name
      const database = config.get('project') || 'postgres';
      const url = `jdbc:postgresql://${host}:${port}/${database}?options=--search_path%3D${schema}`;

      cb('postgres.jdbc.url', url);
    },
  },
];

const bigqueryVariables: configVariable[] = [
  {
    name: 'project id',
    required: true,
    attribute: 'project',
    assign: 'bigquery.project-id',
  },
  {
    name: 'credentials file',
    required: true,
    attribute: 'credential_file',
    assign: (config, cb) => {
      const filepath = get(config, 'credential_file', '');

      // need to base64 encode the credential file
      const credentialPathInConfig = path.resolve(process.cwd(), filepath);
      const userCredentialContent = readFileSync(
        path.resolve(process.cwd(), credentialPathInConfig),
        'utf-8'
      );

      const encoded = Buffer.from(userCredentialContent).toString('base64');

      cb('bigquery.credentials-key', encoded);
    },
  },
  {
    name: 'location',
    required: false,
    attribute: 'location',
    assign: 'bigquery.location',
    default: 'asia-east1',
  },
  {
    name: 'bucket name',
    required: false,
    attribute: 'bucket',
    assign: 'bigquery.bucket-name',
    default: 'test-pre-agg-cml',
  },
];

const commonVariables: configVariable[] = [
  {
    name: 'enviroment',
    required: false,
    attribute: 'env',
    assign: 'node.environment',
    default: 'test',
  },
  {
    name: 'duckdb access key',
    required: false,
    attribute: 'access_key',
    assign: 'duckdb.storage.access-key',
    default: '',
  },
  {
    name: 'duckdb secret key',
    required: false,
    attribute: 'secret_key',
    assign: 'duckdb.storage.secret-key',
    default: '',
  },
];

const getClientSettings = (client: string) => {
  const combineCommon = (variables: configVariable[]) => {
    return [...commonVariables, ...variables];
  };

  switch (client) {
    case 'postgres':
      return combineCommon(postgresVariables);
    case 'bigquery':
      return combineCommon(bigqueryVariables);
    default:
      return combineCommon([]);
  }
};

const checkTools = () => {
  const spinner = ora('Checking environment').start();

  if (!isDockerInstalled()) {
    spinner.fail('docker is not installed');
    return false;
  }

  if (dockerCompose === '') {
    spinner.fail('docker compose is not installed');
    return false;
  }

  spinner.succeed('Environment is ready');
  return true;
};

const neededPorts = [3000, 7432, 8080];

const makeSurePortAvailable = async () => {
  const availablePorts = await Promise.all(
    neededPorts.map((port) => detectPort(port))
  );

  return availablePorts.every((port) => neededPorts.includes(port));
};

const makeSureDockerNetworkExists = () => {
  const currentNetworks = listDockerNetworks();
  if (!currentNetworks.includes('vulcansql-net')) {
    createNetwork('vulcansql-net');
  }

  ora('Docker network is ready').succeed();
};

const templatePath = path.resolve(__dirname, '..', 'templates');

const setPlatform = (platform: string) => {
  process.env['PLATFORM'] = platform;
  ora('The platform to run VulcanSQL Engine is set').succeed();
};

const setVulcanSQLEnginePath = (targetPath: string) => {
  process.env['MDL_PATH'] = targetPath;
  ora('The VulcanSQL Engine Path to mount is set').succeed();
};

const setConfigPath = (targetPath: string) => {
  process.env['CONFIG_PATH'] = targetPath;
  ora('The Config Path to mount is set').succeed();
};

const checkConfigAllSet = (semantic: Semantic) => {
  const { config } = semantic;
  const engine = config.get('engine') || 'postgres';
  const engineSettings = getClientSettings(engine);
  const missingConfigs = engineSettings.filter((env) => {
    const value = config.get(env.attribute);
    return env.required && (!value || value === '');
  });

  if (missingConfigs.length === 0) {
    return {
      isConfigAllSet: true,
      missingConfigs: [],
    };
  }

  return {
    isConfigAllSet: false,
    missingConfigs,
  };
};

export const generateServeFiles = (targetDir: string, semantic: Semantic) => {
  const spinner = ora('Generating Serve files').start();
  const properties = new PropertiesEditor('');
  const { config } = semantic;
  const client = config.get('engine') || 'postgres';
  const clientSettings = getClientSettings(client);

  clientSettings.forEach((variable) => {
    const { attribute, assign, default: defaultValue } = variable;

    const value = config.get(attribute) || defaultValue;

    if (typeof assign === 'function') {
      assign(config, (key, value) =>
        properties.insert(key, value, { escapeUnicode: true })
      );
    } else if (typeof assign === 'string') {
      properties.insert(assign, value, { escapeUnicode: true });
    }
  });

  // hardcode the vulcansql compiled mdl path
  // TODO: accio -> vulcansql
  properties.insert('accio.file', 'etc/mdl.json');
  // set client type
  properties.insert('accio.datasource.type', client);

  // generate config.properties
  writeFileSync(
    path.resolve(targetDir, 'config.properties'),
    properties.format(),
    'utf-8'
  );

  // generate docker-compose.yml
  copyFileSync(
    path.resolve(templatePath, 'docker', 'docker-compose.yml'),
    path.resolve(targetDir, 'docker-compose.yml')
  );

  spinner.succeed('Serve files are generated');
};

export const generateCLIShell = (targetDir: string, semantic: Semantic) => {
  const { config } = semantic;
  const shellScript = ['#!/bin/bash'];

  const connectURI = 'postgres://localhost:7432/';
  const database = config.get('project') || 'postgres';
  const schema = config.get('schema') || 'public';

  shellScript.push(
    `psql ${connectURI}${database}?options=--search_path%3D${schema}`
  );

  writeFileSync(
    path.resolve(targetDir, 'launch-cli.sh'),
    shellScript.join('\n'),
    'utf-8'
  );
};

const setLaunchCLIPath = (targetPath: string) => {
  process.env['LAUNCH_CLI_PATH'] = targetPath;
  ora('The Launch CLI Path to mount is set').succeed();
};

export const runVulcanEngine = async (
  semantic: Semantic,
  compiledFilePath: string,
  platform: string, shouldPull?: boolean,
  isWatchMode?: boolean,
) => {
  if (!isWatchMode) {
    if (!checkTools()) {
      ora('Please install required tools').fail();
      return;
    }
  
    if (!isDockerStarted()) {
      ora('Please start docker').fail();
      return;
    }
  
    if (!(await makeSurePortAvailable())) {
      ora(`Please make sure port ${neededPorts.join(',')} is available`).fail();
      return;
    }

    makeSureDockerNetworkExists();
  }

  const { isConfigAllSet, missingConfigs } = checkConfigAllSet(semantic);
  if (!isConfigAllSet) {
    ora(
      [
        'Please set the following configs',
        ...missingConfigs.map((env) => `- ${env.name}`),
      ].join('\n')
    ).fail();
    return;
  }

  const tmpDir = dirSync({ unsafeCleanup: true });
  generateServeFiles(tmpDir.name, semantic);
  generateCLIShell(tmpDir.name, semantic);

  setPlatform(platform);
  setVulcanSQLEnginePath(compiledFilePath);
  setConfigPath(path.resolve(tmpDir.name, 'config.properties'));
  setLaunchCLIPath(path.resolve(tmpDir.name, 'launch-cli.sh'));

  const spinner = ora('Starting VulcanSQL Serve\n').start();

  try {
    const commandLines = [
      dockerCompose,
      '--project-directory',
      tmpDir.name,
      '--project-name',
      'vulcansql',
      'up',
      'engine',
      'admin-ui',
      '--detach',
    ];

    if (shouldPull) {
      commandLines.push('--pull=always');
    }

    execSync(commandLines.join(' '), {
      stdio: 'inherit',
    });

    spinner.succeed('Vulcan Serve is started');

    let vulcanEngineCliReady = false;
    while (!vulcanEngineCliReady) {
      try {
        execSync('vulcan cli', { stdio: 'ignore' });
        vulcanEngineCliReady = true;
      } catch {
        // ignore
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return true;
    // logger.info('Admin UI is available at http://localhost:3000');
  } catch (e) {
    spinner.fail('Vulcan Serve failed');
    return;
  } finally {
    spinner.stop();
  }

}

const generateTemplateSQL = (name: string, columns: ColumnJSON[]) => {
  let templateSQL = '-- This file is auto-generated. Please do not edit this file.\n-- If you would like to change the contents of this file, please copy and rename it on your own.\n'
  for (const column of columns) {
    templateSQL += `{% set ${column.name} = context.params.${column.name} %}\n`
  }

  templateSQL += `\nselect * from ${name}`
  if (columns.length > 0) {
    templateSQL += '\nwhere\n'

    for (const column of columns) {
      templateSQL += `  {% if ${column.name} %}\n  ${column.name} = cast({{ ${column.name} }} as ${column.type}) and\n  {% endif %}\n`
    }

    templateSQL += `  1=1\n`
  }

  return templateSQL
}

const generateTemplateYAML = (apiBasePath: string, name: string, columns: ColumnJSON[]) => {
  let templateYAML = `# This file is auto-generated. Please do not edit this file.\n# If you would like to change the contents of this file, please copy and rename it on your own.\n`
  // TODO: at the moment, pagination(offset+limit) is not supported
  // `urlPath: /${apiBasePath}/${name.toLowerCase()}\npagination:\n  mode: offset\n`
  templateYAML += `urlPath: /${apiBasePath}/${name.toLowerCase()}\n`
  if (columns.length > 0) {
    templateYAML += 'request:\n'
    for (const column of columns) {
      templateYAML += `  - fieldName: ${column.name}\n`
      templateYAML += `    fieldIn: query\n`
      if (column.description) {
        templateYAML += `    description: ${column.description}\n`
      }
    }
  }
  templateYAML += 'profiles:\n  - pg\n'

  return templateYAML
}

const writeTemplateFiles = async (
  templateFolderPath: string,
  schemaParserFolderPath: string,
  apiBasePath: string,
  name: string,
  columns: ColumnJSON[]
) => {
    // write template file
    const templateSQL = generateTemplateSQL(name, columns)
    const modelsFolderPath = path.resolve(templateFolderPath, apiBasePath);
    await fs.mkdir(modelsFolderPath, { recursive: true });
    await fs.writeFile(
      path.join(modelsFolderPath, `${name}.sql`),
      templateSQL
    );

    // write schema file
    const templateYAML = generateTemplateYAML(apiBasePath, name, columns);
    const schemasFolderPath = path.resolve(schemaParserFolderPath, apiBasePath);
    await fs.mkdir(schemasFolderPath, { recursive: true });
    await fs.writeFile(
      path.join(schemasFolderPath, `${name}.yaml`),
      templateYAML
    );
}

export const generateSqlTemplates = async (semantic: SemanticJSON, config: any) => {
  const templateFolderPath = path.resolve(process.cwd(), config.template?.folderPath?? 'sqls');
  const schemaParserFolderPath = path.resolve(process.cwd(), config['schema-parser']?.folderPath?? 'sqls');

  for (const model of semantic.models) {
    const columns = model.columns.filter(column => 'expression' in column).map(column => column);
    const modelName = model.name;

    writeTemplateFiles(templateFolderPath, schemaParserFolderPath, 'models', modelName, columns);
  }

  for (const metric of semantic.metrics) {
    const dimensions = metric.dimension.filter(dimension => 'expression' in dimension).map(dimension => dimension);
    const metricName = metric.name;

    writeTemplateFiles(templateFolderPath, schemaParserFolderPath, 'metrics', metricName, dimensions);
  }

  for (const cumulativeMetric of semantic.cumulativeMetrics) {
    const cumulativeMetricName = cumulativeMetric.name;

    writeTemplateFiles(templateFolderPath, schemaParserFolderPath, 'cumulative-metrics', cumulativeMetricName, []);
  }
}

const compile = async (filepath: string) => {
  const fileContent = await fs.readFile(filepath, 'utf-8');
  const tokens = tokenize(fileContent);
  const semantic = new Semantic(tokens);

  return semantic;
};

export const buildSemanticModels = async () => {
  const spinner = ora('Building semantic models...').start();
  let semantic = undefined;
  let compiledFileName = '';
  let compiledFolderPath = '';
  let compiledFilePath = '';

  try {
    const inputPath = path.resolve(process.cwd(), 'mdls');
    // get the number of mdl files of the inputPath folder
    const mdlFiles = (await fs.readdir(inputPath)).filter(file => file.endsWith('.mdl'));
    if (mdlFiles.length > 0) {
      const mdlFile = mdlFiles[0];
      semantic = await compile(path.join(inputPath, mdlFile));

      const mdlFileName = mdlFile.split('.')[0];
      compiledFileName = `${mdlFileName}.json`;
      compiledFolderPath = path.resolve(process.cwd(), 'outputs/compiled-mdls');
      compiledFilePath = path.resolve(compiledFolderPath, compiledFileName);

      await fs.mkdir(compiledFolderPath, { recursive: true });
      await fs.writeFile(
        compiledFilePath,
        JSON.stringify(semantic.toJSON(), null, 2)
      );
    }
  
    spinner.succeed('Built semantic models successfully.');
  } catch (e: any) {
    if (Object.getPrototypeOf(e).constructor.name === 'peg$SyntaxError') {
      spinner.fail(`Parsing failed at near line ${e.location?.start.line}, column ${e.location?.start.column}: ${e.message}`);
    } else {
      spinner.fail(`Built semantic models failed.: ${e}`);
    }
  }

  return {
    semantic,
    compiledFilePath,
    compiledFileName,
  };
}
