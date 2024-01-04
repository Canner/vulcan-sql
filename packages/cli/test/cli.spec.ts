import { program } from 'commander';
import { initializeProgram } from '../src/cli';
import { promises as fs } from 'fs';
import * as jsYAML from 'js-yaml';
import * as path from 'path';
import { runShutdownJobs } from '../src/utils';
import * as supertest from 'supertest';
import faker from '@faker-js/faker';

const projectName = 'test-vulcan-project';
const testingVersion = '0.1.2-dev.20220913.0';
const testingServerPort = faker.datatype.number({ min: 20000, max: 30000 });

const workspaceRoot = path.resolve(__dirname, '..', '..', '..');
const projectRoot = path.resolve(workspaceRoot, projectName);

initializeProgram(program);

beforeAll(async () => {
  await fs.rm(projectRoot, { recursive: true, force: true });
  await program.parseAsync([
    'node',
    'vulcan',
    'init',
    '-p',
    projectName,
    '-v',
    testingVersion,
  ]);
  process.chdir(projectRoot);
  const projectConfig = jsYAML.load(
    await fs.readFile(path.resolve(projectRoot, 'configs', 'vulcan.yaml'), 'utf-8')
  ) as Record<string, any>;
  projectConfig['port'] = testingServerPort;
  fs.writeFile(
    path.resolve(projectRoot, 'configs', 'vulcan.yaml'),
    jsYAML.dump(projectConfig),
    'utf-8'
  );
}, 30000);

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
      await fs.readFile(path.resolve(projectRoot, 'configs', 'vulcan.yaml'), 'utf8')
    );
    // Assert
    expect(config.name).toBe(projectName);
  },
  10 * 1000
);

it('Build command should make result.json', async () => {
  // Action
  await program.parseAsync(['node', 'vulcan', 'build']);
  // Assert
  expect(
    fs.readFile(path.resolve(projectRoot, 'result.json'), 'utf-8')
  ).resolves.not.toThrow();
});

it('Serve command should start Vulcan server', async () => {
  // Action
  await program.parseAsync(['node', 'vulcan', 'build']);
  await program.parseAsync(['node', 'vulcan', 'serve']);
  const agent = supertest(`http://localhost:${testingServerPort}`);
  const result = await agent.get('/doc');
  // Assert
  expect(result.statusCode).toBe(200);
  await runShutdownJobs();
});

it('Start command should build the project and start Vulcan server', async () => {
  // Action
  await program.parseAsync(['node', 'vulcan', 'start']);
  const agent = supertest(`http://localhost:${testingServerPort}`);
  const result = await agent.get('/doc');
  // Assert
  expect(result.statusCode).toBe(200);
  await runShutdownJobs();
});

it('Start command with watch option should watch the file changes', (done) => {
  // Arrange
  const agent = supertest(`http://localhost:${testingServerPort}`);
  const testYamlPath = path.resolve(projectRoot, 'sqls', 'test.yaml');

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
      runShutdownJobs()
        .then(() => fs.rm(testYamlPath))
        .then(() => done());
    });
}, 5000);

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
    fs.readFile(path.resolve(projectRoot, 'result.json'), 'utf-8')
  ).resolves.not.toThrow();
});
