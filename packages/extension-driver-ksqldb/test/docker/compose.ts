import * as Docker from 'dockerode';
import * as path from 'path';
import * as jsYaml from 'js-yaml';
import { promises as fs } from 'fs';

const docker = new Docker();

interface ComposeConfig {
  image: string;
  hostname: string;
  ports: string[];
  volumes: string[];
  environment: Record<string, any>;
  expose: string[];
  entrypoint: string | string[];
  tty: boolean;
  networks: string[];
}

interface ComposeJson {
  services: Record<string, ComposeConfig>;
  networks: Record<string, any>;
}

export class Compose {
  public network?: Docker.Network;
  public containers = new Map<string, Docker.Container>();
  public ksqldbName = 'ksqldb-server';
  public ksqldbContainer?: Docker.Container;

  public async up() {
    const composeJson = await this.getComposeJson();
    await docker.pruneContainers();
    await docker.pruneNetworks();
    const network = Object.keys(composeJson.networks)[0];
    this.network = await docker.createNetwork({
      Name: network,
    });

    for (const serviceName in composeJson.services) {
      const service = composeJson.services[serviceName];
      const pullStream = await docker.pull(service.image);
      // https://github.com/apocas/dockerode/issues/647
      await new Promise((res) => docker.modem.followProgress(pullStream, res));

      const containerConfig: Docker.ContainerCreateOptions =
        this.convertContainerConfig(service, network);

      this.containers.set(
        serviceName,
        await docker.createContainer(containerConfig)
      );

      await this.containers.get(serviceName)!.start();
    }
  }

  public async down() {
    for (const container of this.containers.values()) {
      await container.stop();
    }
    await docker.pruneContainers();
    await docker.pruneNetworks();
  }

  private async getComposeJson(): Promise<ComposeJson> {
    const content = await fs.readFile(
      path.resolve(__dirname, 'docker-compose.yml'),
      'utf-8'
    );
    const composeJson = jsYaml.load(content) as ComposeJson;
    return composeJson;
  }

  private convertContainerConfig(service: ComposeConfig, network: string) {
    // dockerode does not support relative paths in container volumes
    const Binds = (service['volumes'] || []).map((volume) => volume.replace('./', `${__dirname}/`));
    return {
      Image: service['image'],
      name: service['hostname'],
      Hostname: service['hostname'],
      HostConfig: {
        PortBindings: (service['ports'] || []).reduce((acc, port) => {
          const [hostPort, containerPort] = port.split(':');
          return {
            ...acc,
            [`${containerPort}/tcp`]: [{ HostPort: hostPort }],
          };
        }, {}),
        Binds,
        NetworkMode: network,
      },
      Env: Object.keys(service['environment'] || {}).map(
        (key) => `${key}=${service['environment'][key]}`
      ),
      ExposedPorts: (service['expose'] || []).reduce(
        (acc, port) => ({ ...acc, [`${port}/tcp`]: {} }),
        {}
      ),
      Entrypoint: service['entrypoint'] || [],
      Tty: service['tty'] || false,
    } as Docker.ContainerCreateOptions;;
  }
}
