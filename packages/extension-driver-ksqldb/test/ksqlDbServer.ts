/* istanbul ignore file */

import * as Docker from 'dockerode';
import * as BPromise from 'bluebird';
import faker from '@faker-js/faker';
import { RestfulClient } from '../src/lib/restfulClient';
import { Compose } from './docker/compose';

const compose = new Compose();

/**
 * KsqlDb Server in docker
 * table: users (id Int32, name String, enabled Boolean)
 * rows: 200 rows.
 */
export class KSqlDbServer {
  public readonly port = '8088';
  public readonly host = 'localhost';
  public readonly image = 'confluentinc/ksqldb-server:0.29.0';
  public readonly username = 'admin';
  public readonly password = 'admin123';
  public container?: Docker.Container;
  public client?: RestfulClient;

  public async prepare() {
    await compose.up();
    // https://github.com/apocas/dockerode/issues/647
    this.client = new RestfulClient({
      host: `http://${this.host}:${this.port}`,
      username: this.username,
      password: this.password,
    });
    await this.waitKSqlDbReady(this.client);

    // Init data
    try {
      await this.client.exec({
        query: `CREATE STREAM riderLocations (profileId VARCHAR, latitude DOUBLE, longitude DOUBLE)
        WITH (kafka_topic='locations', value_format='json', partitions=1);`,
      });

      await this.client.exec({
        query: `CREATE TABLE currentLocation AS
        SELECT profileId,
               LATEST_BY_OFFSET(latitude) AS la,
               LATEST_BY_OFFSET(longitude) AS lo
        FROM riderlocations
        GROUP BY profileId
        EMIT CHANGES;`,
      });

      await this.client.exec({
        query: `CREATE TABLE ridersNearMountainView AS
        SELECT ROUND(GEO_DISTANCE(la, lo, 37.4133, -122.1162), -1) AS distanceInMiles,
               COLLECT_LIST(profileId) AS riders,
               COUNT(*) AS count
        FROM currentLocation
        GROUP BY ROUND(GEO_DISTANCE(la, lo, 37.4133, -122.1162), -1);`,
      });

      await this.client.exec({
        query: `
          INSERT INTO riderLocations (profileId, latitude, longitude) VALUES ('c2309eec', 37.7877, -122.4205);
          INSERT INTO riderLocations (profileId, latitude, longitude) VALUES ('18f4ea86', 37.3903, -122.0643);
          INSERT INTO riderLocations (profileId, latitude, longitude) VALUES ('4ab5cbad', 37.3952, -122.0813);
          INSERT INTO riderLocations (profileId, latitude, longitude) VALUES ('8b6eae59', 37.3944, -122.0813);
          INSERT INTO riderLocations (profileId, latitude, longitude) VALUES ('4a7c7b41', 37.4049, -122.0822);
          INSERT INTO riderLocations (profileId, latitude, longitude) VALUES ('4ddad000', 37.7857, -122.4011);`,
      });

      const values = [];
      for (let i = 7; i <= 110; i++) {
        values.push(
          `INSERT INTO riderLocations (profileId, latitude, longitude) VALUES ('${
            faker.datatype.uuid
          }', ${faker.address.latitude()}, ${faker.address.longitude()});`
        );
      }
      await this.client.exec({ query: values.join('') });
    } catch (error) {
      console.log(error);
    }
  }

  public async start() {
    await this.container?.start();
    await this.waitKSqlDbReady(this.client!);
  }

  public async stop() {
    await this.container?.stop();
  }

  public async destroy() {
    await compose.down();
    await BPromise.delay(60 * 1000);
  }

  public getProfile(name: string) {
    return {
      name,
      type: 'ksqldb',
      connection: {
        host: `http://${this.host}:${this.port}`,
        username: this.username,
        password: this.password,
      },
      allow: '*',
    };
  }

  private async waitKSqlDbReady(client: RestfulClient): Promise<void> {
    // start to check connect after 1 minute
    await BPromise.delay(60 * 1000);
    console.log(
      'Start to check ksqldb connection: ',
      `http://${this.host}:${this.port}`
    );
    let wait = 20;
    while (wait--) {
      try {
        const status = await client.checkConnection();
        if (status === 'RUNNING') {
          console.log('KsqlDb is ready');
          return;
        }
      } catch (e: any) {
        console.log(e.message);
      }
      await BPromise.delay(3000);
    }
    throw new Error('KsqlDb timeout');
  }
}
