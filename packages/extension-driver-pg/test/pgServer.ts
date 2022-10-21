/* istanbul ignore file */
import * as Docker from 'dockerode';
import faker from '@faker-js/faker';
import { Client } from 'pg';
import * as BPromise from 'bluebird';
import { PGOptions } from '../src/lib/pgDataSource';

const docker = new Docker();

/**
 * PG Server in docker
 * table: users (id INTEGER, name VARCHAR, enabled BOOLEAN)
 * rows: 200 rows.
 */
export class PGServer {
  public readonly password = '123';
  public readonly image = 'postgres:12.12';
  public readonly port = faker.datatype.number({ min: 20000, max: 30000 });
  public readonly host = 'localhost';
  public readonly user = 'postgres';
  public readonly database = 'postgres';
  private container?: Docker.Container;

  public async prepare() {
    const pullStream = await docker.pull(this.image);
    // https://github.com/apocas/dockerode/issues/647
    await new Promise((res) => docker.modem.followProgress(pullStream, res));
    this.container = await docker.createContainer({
      name: `vulcan-pg-test-${faker.random.word()}`,
      Image: this.image,
      ExposedPorts: {
        '5432/tcp': {},
      },
      Env: [`POSTGRES_PASSWORD=${this.password}`],
      HostConfig: {
        PortBindings: { '5432/tcp': [{ HostPort: `${this.port}` }] },
      },
    });
    await this.container.start({});
    await this.waitPGReady();
    // Init data
    const client = new Client({
      host: 'localhost',
      port: this.port,
      password: this.password,
      user: 'postgres',
      database: 'postgres',
    });
    await client.connect();
    await client.query(
      `create table if not exists users (id INTEGER, name VARCHAR, enabled BOOLEAN);`
    );
    for (let i = 1; i <= 200; i++) {
      await client.query(
        `insert into users values(${i}, $1, ${faker.datatype.boolean()});`,
        [faker.name.firstName()]
      );
    }
    await client.end();
  }

  public async destroy() {
    await this.container?.remove({ force: true });
  }

  public getProfile(name: string) {
    return {
      name,
      type: 'pg',
      connection: {
        host: this.host,
        user: this.user,
        password: this.password,
        database: this.database,
        port: this.port,
      } as PGOptions,
      allow: '*',
    };
  }

  private async waitPGReady() {
    const waitConnection = await this.container?.exec({
      Cmd: ['sh', '-c', 'until pg_isready; do sleep 5; echo "not ready"; done'],
    });
    if (!waitConnection) return;
    await waitConnection.start({});
    let wait = 20;
    while (wait--) {
      const { Running, ExitCode } = await waitConnection.inspect();
      if (!Running && ExitCode === 0) return;
      else if (!Running && ExitCode && ExitCode > 0)
        throw new Error(`PG wait commend return exit code ${ExitCode}`);
      await BPromise.delay(1000);
    }
    throw new Error(`PG timeout`);
  }
}
