import * as ora from 'ora';
import {
  isDockerInstalled,
  dockerCompose,
  isDockerStarted,
  listDockerNetworks,
  listDockerComposeProjectServices,
  logger,
} from '../utils';
import { execSync } from 'child_process';

const checkDockerNetworkExists = () => {
  const networks = listDockerNetworks();
  return networks.includes('vulcansql-net');
};

const checkVulcanSQLEngineExists = () => {
  const services = listDockerComposeProjectServices('vulcansql');
  return services.includes('engine');
};

export const handleCli = async () => {
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

  if (!checkDockerNetworkExists()) {
    ora(
      'VulcanSQL internal network is not found. Did you forget to run `serve` command?'
    ).fail();
    return;
  }

  if (!checkVulcanSQLEngineExists()) {
    ora(
      'VulcanSQL engine is not found. Did you forget to run `serve` command?'
    ).fail();
    return;
  }

  try {
    execSync(
      [
        'docker',
        'compose',
        '--project-name',
        'vulcansql',
        'exec',
        'engine',
        'bash',
        'launch-cli.sh',
      ].join(' '),
      {
        stdio: 'inherit',
      }
    );

    ora('Thanks for using VulcanSQL').succeed();
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
};
