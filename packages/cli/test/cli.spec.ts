import { program } from 'commander';
import { initializeProgram } from '../src/cli';
import { promises as fs } from 'fs';
import * as jsYAML from 'js-yaml';
import * as path from 'path';
import { runShutdownJobs } from '../src/utils';
import * as supertest from 'supertest';
import faker from '@faker-js/faker';
import { exec } from 'child_process';

const projectName = 'test-vulcan-project';
const testingVersion = '0.10.2';
const testingServerPort = faker.datatype.number({ min: 20000, max: 30000 });

const workspaceRoot = path.resolve(__dirname, '..', '..', '..');
const projectRoot = path.resolve(workspaceRoot, projectName);

initializeProgram(program);

beforeAll(async () => {
  exec('yarn nx build build');
  exec('yarn nx build core');

  await fs.rm(projectRoot, { recursive: true, force: true });
  await program.parseAsync([
    'node',
    'vulcan',
    'init',
    '-p',
    projectName,
    '-cp',
    'linux/arm64/v8',
    '-v',
    testingVersion,
  ]);
  process.chdir(projectRoot);

  // remove the old version of packages and copy the latest version of vulcansql minimal required packages to the project
  await fs.rm(path.resolve('node_modules/@vulcan-sql/build'), { recursive: true, force: true });
  await fs.rm(path.resolve('node_modules/@vulcan-sql/core'), { recursive: true, force: true });
  await fs.cp(
    path.resolve('../dist/packages/build'),
    path.resolve('node_modules/@vulcan-sql/build'),
    { recursive: true, force: true },
  );
  await fs.cp(
    path.resolve('../dist/packages/core'),
    path.resolve('node_modules/@vulcan-sql/core'),
    { recursive: true, force: true },
  );

  const projectConfig = jsYAML.load(
    await fs.readFile(path.resolve(projectRoot, 'outputs', 'api-configs', 'vulcan.yaml'), 'utf-8')
  ) as Record<string, any>;
  projectConfig['port'] = testingServerPort;
  fs.writeFile(
    path.resolve(projectRoot, 'outputs', 'api-configs', 'vulcan.yaml'),
    jsYAML.dump(projectConfig),
    'utf-8'
  );
}, 300 * 1000);

afterAll(async () => {
  await fs.rm(projectRoot, { recursive: true, force: true, maxRetries: 5 });
});

afterEach(async () => {
  await runShutdownJobs();
});

it(
  'Init command should create new folder with default config',
  async () => {
    // Action
    const config: any = jsYAML.load(
      await fs.readFile(path.resolve(projectRoot, 'outputs', 'api-configs', 'vulcan.yaml'), 'utf8')
    );
    // Assert
    expect(config.name).toBe(projectName);
  },
  300 * 1000
);

it('Build command should make result.json', async () => {
  // Action
  await program.parseAsync(['node', 'vulcan', 'build']);
  // Assert
  expect(
    fs.readFile(path.resolve(projectRoot, 'outputs', 'api-endpoints', 'result.json'), 'utf-8')
  ).resolves.not.toThrow();
}, 300 * 1000);

it('Serve command should start Vulcan server', async () => {
  // Action
  await program.parseAsync(['node', 'vulcan', 'build']);
  await program.parseAsync(['node', 'vulcan', 'serve']);
  const agent = supertest(`http://localhost:${testingServerPort}`);
  const result = await agent.get('/doc');
  // Assert
  expect(result.statusCode).toBe(200);
  await program.parseAsync(['node', 'vulcan', 'stop']);
}, 300 * 1000);

it('Start command should build the project and start Vulcan server', async () => {
  // Action
  await program.parseAsync(['node', 'vulcan', 'start']);
  const agent = supertest(`http://localhost:${testingServerPort}`);
  const result = await agent.get('/doc');
  // Assert
  expect(result.statusCode).toBe(200);
  await program.parseAsync(['node', 'vulcan', 'stop']);
}, 300000);

it('Start command with watch option should watch the file changes', (done) => {
  // Arrange
  const agent = supertest(`http://localhost:${testingServerPort}`);
  const testYamlPath = path.resolve(projectRoot, 'outputs', 'api-endpoints', 'test.yaml');

  // Act
  program
    .parseAsync(['node', 'vulcan', 'start', '-w'])
    // Wait for server start
    .then(() => new Promise((resolve) => setTimeout(resolve, 1000)))
    // Write some invalid configs, let server fail to start
    .then(() => fs.writeFile(testYamlPath, 'url: /user/:id\ns', 'utf-8'))
    // Wait for serer restart
    .then(() => new Promise((resolve) => setTimeout(resolve, 1000)))
    .then(() => expect(agent.get('/doc')).rejects.toThrow())
    .finally(() => {
      program.parseAsync(['node', 'vulcan', 'stop']);
      runShutdownJobs()
        .then(() => fs.rm(testYamlPath))
        .then(() => done());
    });
}, 300 * 1000);

it('Version command should execute without error', async () => {
  // Action, Assert
  await expect(
    program.parseAsync(['node', 'vulcan', 'version'])
  ).resolves.not.toThrow();
});

// TODO: We can't test package result until the new version of build package release
it('Package command should make result.json', async () => {
  // Action
  await program.parseAsync(['node', 'vulcan', 'package']);
  // Assert
  expect(
    fs.readFile(path.resolve(projectRoot, 'outputs', 'api-endpoints', 'result.json'), 'utf-8')
  ).resolves.not.toThrow();
}, 300 * 1000);
