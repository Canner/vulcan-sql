/* istanbul ignore file */
import * as Docker from 'dockerode';
import faker from '@faker-js/faker';
import { createClient } from '@clickhouse/client';
import * as BPromise from 'bluebird';
import { ClickHouseOptions } from '../src/lib/clickHouseDataSource';

const docker = new Docker();

/**
 * ClickHouse Server in docker
 * table: users (id Int32, name String, enabled Boolean)
 * rows: 200 rows.
 */
export class ClickHouseServer {
  public readonly password = '123';
  // https://hub.docker.com/r/clickhouse/clickhouse-server/
  public readonly image = 'clickhouse/clickhouse-server:23';
  public readonly port = faker.datatype.number({ min: 20000, max: 30000 });
  public readonly host = 'localhost';
  public readonly user = 'user';
  public readonly database = 'db';
  private container?: Docker.Container;

  public async prepare() {
    const pullStream = await docker.pull(this.image);
    // https://github.com/apocas/dockerode/issues/647
    await new Promise((res) => docker.modem.followProgress(pullStream, res));
    this.container = await docker.createContainer({
      name: `vulcan-clickhouse-test-${faker.git.shortSha()}`,
      Image: this.image,
      ExposedPorts: {
        '8123/tcp': {},
      },
      Env: [
        `CLICKHOUSE_DB=${this.database}`,
        `CLICKHOUSE_USER=${this.user}`,
        `CLICKHOUSE_PASSWORD=${this.password}`,
      ],
      HostConfig: {
        PortBindings: {
          '8123/tcp': [{ HostPort: `${this.port}` }],
        },
        // Set unlimited options according to https://hub.docker.com/r/clickhouse/clickhouse-server/
        // Docs: https://docs.docker.com/engine/api/v1.37/#tag/Container/operation/ContainerCreate
        Ulimits: [{ Name: 'nofile', Soft: 262144, Hard: 262144 }],
      },
    });
    await this.container.start({});
    await this.waitClickHouseReady();
    // Init data
    const client = createClient({
      host: `http://${this.host}:${this.port}`,
      username: this.user,
      password: this.password,
      database: this.database,
    });

    await client.exec({
      query: `CREATE TABLE IF NOT EXISTS products
      (
          serial UInt32, 
          product_id UUID,
          name String,
          price UInt32,
          enabled Boolean
      )
      ENGINE = MergeTree
      PRIMARY KEY (product_id)`,
    });

    await client.exec({
      query: `INSERT INTO products (*) VALUES
        (1, '6fd1080f-c186-42ba-b32c-10211a8689a2', 'juice', 30, true),
        (2, '17a677ca-8f50-49c5-82d7-bce85031ee09', 'egg', 50, false),
        (3, '9fb20bb4-75ea-46bf-ab00-4898a28283fc', 'milk', 20, true)`,
    });
    for (let i = 4; i <= 200; i++) {
      await client.exec({
        query:
          'INSERT INTO products (*) VALUES ({serial: Int}, {product_id: UUID}, {name:String}, {price:Float}, {enabled:Boolean})',
        query_params: {
          serial: i,
          product_id: faker.datatype.uuid(),
          name: faker.commerce.product(),
          price: faker.commerce.price(100, 300, 0),
          enabled: faker.datatype.boolean(),
        },
      });
    }
  }

  public async destroy() {
    await this.container?.remove({ force: true });
  }

  public getProfile(name: string) {
    return {
      name,
      type: 'clickhouse',
      connection: {
        host: `http://${this.host}:${this.port}`,
        username: this.user,
        password: this.password,
        database: this.database,
      } as ClickHouseOptions,
      allow: '*',
    };
  }

  private async waitClickHouseReady() {
    const waitConnection = await this.container?.exec({
      Cmd: [
        '/bin/bash',
        '-c',
        'until grep "<Information> Application: Ready for connections" /var/log/clickhouse-server/clickhouse-server.log; do sleep 5; echo "not ready"; done',
      ],
    });
    if (!waitConnection) return;
    await waitConnection.start({});
    let wait = 20;
    while (wait--) {
      const { Running, ExitCode } = await waitConnection.inspect();
      if (!Running && ExitCode === 0) return;
      else if (!Running && ExitCode && ExitCode > 0)
        throw new Error(`ClickHouse wait commend return exit code ${ExitCode}`);
      await BPromise.delay(1000);
    }
    throw new Error(`ClickHouse timeout`);
  }
}
