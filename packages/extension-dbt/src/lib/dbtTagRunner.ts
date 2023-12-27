import { TagRunner, TagRunnerOptions } from '@vulcan-sql/api-layer';
import { injectable } from 'inversify';
import * as nunjucks from 'nunjucks';

@injectable()
export class DBTTagRunner extends TagRunner {
  public tags = ['dbt'];

  public async run({ contentArgs }: TagRunnerOptions) {
    const sql = await contentArgs[0]();
    return new nunjucks.runtime.SafeString(sql);
  }
}
