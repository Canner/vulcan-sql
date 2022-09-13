import { program } from '../src/cli';
import { promises as fs } from 'fs';
import * as jsYAML from 'js-yaml';
import * as path from 'path';
import { runShutdownJobs } from '../src/utils';

const projectName = 'test-vulcan-project-init';
const testingVersion = '0.1.2-dev.20220913.0';

const workspaceRoot = path.resolve(__dirname, '..', '..', '..');
const projectRoot = path.resolve(workspaceRoot, `${projectName}-with-path`);

beforeAll(async () => {
  await fs.rm(projectRoot, { recursive: true, force: true });
});

afterAll(async () => {
  await fs.rm(projectRoot, { recursive: true, force: true });
});

afterEach(async () => {
  await runShutdownJobs();
});

it('Init command with folder path should create default config in target folder', async () => {
  // Arrange
  await program.parseAsync([
    'node',
    'vulcan',
    'init',
    '-p',
    projectName,
    '-v',
    testingVersion,
    projectRoot,
  ]);
  // Action
  const config: any = jsYAML.load(
    await fs.readFile(path.resolve(projectRoot, 'vulcan.yaml'), 'utf8')
  );
  // Assert
  expect(config.name).toBe(projectName);
}, 30000);
