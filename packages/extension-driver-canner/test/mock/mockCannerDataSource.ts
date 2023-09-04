import { CannerDataSource } from '../../src';
import { InternalError } from '@vulcan-sql/core';
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
      if (!userPool) {
        throw new InternalError(
          `User pool ${userPoolKey} is not a Pool instance`
        );
      }
      return userPool;
    }
    const pool = new Pool({ ...poolOptions, password: password });
    this.UserPool.set(userPoolKey, pool);
    return pool;
  }
}
