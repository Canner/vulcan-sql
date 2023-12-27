import * as ora from 'ora';
import {
  isDockerInstalled,
  dockerCompose,
  isDockerStarted,
  dockerPs,
  logger,
} from '../utils';
import { execSync } from 'child_process';

export const handleStop = async () => {
  if (!isDockerInstalled()) {
    ora('Docker is not installed.').fail();
    return;
  }

  if (!isDockerStarted()) {
    ora('Docker is not started.').fail();
    return;
  }

  if (!dockerCompose) {
    ora('Docker compose is not installed.').fail();
    return;
  }

  const processes = dockerPs();
  const needStopDemoDB = processes.includes('vulcansql-demo-db');

  try {
    execSync([dockerCompose, '--project-name', 'vulcansql', 'down'].join(' '), {
      stdio: 'inherit',
    });
    ora('VulcanSQL Engine is stopped.').succeed();

    if (needStopDemoDB) {
      execSync('docker stop vulcansql-demo-db', {
        stdio: 'inherit',
      });
      ora('VulcanSQL demo database is stopped.').succeed();
    }
  } catch (e) {
    ora('Failed to stop VulcanSQL Engine').fail();
    logger.error(e);
  }
};
