import { execSync } from 'child_process';

export const isDockerInstalled = () => {
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

export const isDockerStarted = () => {
  try {
    execSync('docker ps', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

export const isDockerComposeInstalled = () => {
  try {
    execSync('docker-compose version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

export const isDockerComposeV2Installed = () => {
  try {
    execSync('docker compose version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

export const dockerCompose = (() => {
  if (isDockerComposeV2Installed()) {
    return 'docker compose';
  }

  if (isDockerComposeInstalled()) {
    return 'docker-compose';
  }

  return '';
})();

export const listDockerNetworks = () => {
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

export const createNetwork = (name: string) => {
  try {
    const result = execSync(`docker network create ${name}`, {
      stdio: 'inherit',
    });
    return result.toString() === name;
  } catch {
    return false;
  }
};

export const listDockerComposeProjectServices = (project: string) => {
  const commandLines = [
    dockerCompose,
    '--project-name',
    project,
    'ps',
    '--services',
  ];

  const result = execSync(commandLines.join(' '), {
    stdio: 'pipe',
  });

  return result
    .toString()
    .split('\n')
    .filter((name) => name !== '');
};

export const dockerPs = () => {
  const result = execSync('docker ps --format "{{.Names}}"', {
    stdio: 'pipe',
  });

  return result
    .toString()
    .split('\n')
    .filter((name) => name !== '');
};
