import { program } from '../src/cli';
import { promises as fs } from 'fs';
import * as jsYAML from 'js-yaml';
import * as path from 'path';
import { runShutdownJobs } from '../src/utils';
import * as supertest from 'supertest';

const projectName = 'test-vulcan-project';

const workspaceRoot = path.resolve(__dirname, '..', '..', '..');
const projectRoot = path.resolve(workspaceRoot, projectName);

beforeAll(async () => {
  await fs.rm(projectRoot, { recursive: true, force: true });
  await program.parseAsync(['node', 'vulcan', 'init', '-p', projectName]);
  process.chdir(projectRoot);
}, 30000);

afterAll(async () => {
  await fs.rm(projectRoot, { recursive: true, force: true });
});

afterEach(async () => {
  await runShutdownJobs();
});

it('Init command should create new folder with default config', async () => {
  // Action
  const config: any = jsYAML.load(
    await fs.readFile(path.resolve(projectRoot, 'vulcan.yaml'), 'utf8')
  );
  // Assert
  expect(config.name).toBe(projectName);
});

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
  await program.parseAsync(['node', 'vulcan', 'serve', '-p', '12345']);
  const agent = supertest('http://localhost:12345');
  const result = await agent.get('/');
  // Assert
  expect(result.statusCode).toBe(200);
  await runShutdownJobs();
});

it('Start command should build the project and start Vulcan server', async () => {
  // Action
  await program.parseAsync(['node', 'vulcan', 'start', '-p', '12345']);
  const agent = supertest('http://localhost:12345');
  const result = await agent.get('/');
  // Assert
  expect(result.statusCode).toBe(200);
  await runShutdownJobs();
});
