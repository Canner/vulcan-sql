import { CannerDataSource } from '../../src';
import { InternalError } from '@vulcan-sql/api-layer';
import { Pool } from 'pg';

export class MockCannerDataSource extends CannerDataSource {
  public override getPool(profileName: string, password?: string): Pool {
    if (!this.poolMapping.has(profileName)) {
      throw new InternalError(`Profile instance ${profileName} not found`);
    }
    const { pool: defaultPool, options: poolOptions } =
      this.poolMapping.get(profileName)!;
    if (!password) {
      return defaultPool;
    }
    const database = poolOptions?.database || '';
    const userPoolKey = this.getUserPoolKey(password, database);
    if (this.UserPool.has(userPoolKey)) {
      const userPool = this.UserPool.get(userPoolKey);
      return userPool!;
    }
    const pool = new Pool({ ...poolOptions, password: password });
    this.UserPool.set(userPoolKey, pool);
    return pool;
  }

  public setUserPool = (userPool: Pool, password: string, database: string) => {
    const userPoolKey = this.getUserPoolKey(password, database);
    this.UserPool.set(userPoolKey, userPool);
  };

  public getUserPool = (password: string, database: string) => {
    const userPoolKey = this.getUserPoolKey(password, database);
    return this.UserPool.get(userPoolKey);
  };
}
