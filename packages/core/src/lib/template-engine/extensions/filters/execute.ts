import { NunjucksFilterExtension } from '../extension';
import { injectable } from 'inversify';
import { QueryBuilder } from '../tags';

@injectable()
export class ExecuteExtension implements NunjucksFilterExtension {
  public name = 'execute';
  public async transform({ value }: { value: any; args: any[] }): Promise<any> {
    const builder: QueryBuilder = value;
    return builder.value();
  }
}
