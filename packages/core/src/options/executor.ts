import { injectable, inject, optional } from 'inversify';
import { TYPES } from '@vulcan-sql/core/types';
import { IExecutorOptions } from '@vulcan-sql/core/models';
import { IsString, validateSync } from 'class-validator';

@injectable()
export class ExecutorOptions implements IExecutorOptions {
  @IsString()
  public readonly type: string = 'pg';

  constructor(
    @inject(TYPES.ExecutorInputOptions)
    @optional()
    options: Partial<IExecutorOptions> = {}
  ) {
    Object.assign(this, options);
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new Error('Invalid executor options: ' + errors.join(', '));
    }
  }
}
