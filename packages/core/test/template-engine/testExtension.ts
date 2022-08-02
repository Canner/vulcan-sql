import { FilterBuilder, FilterRunner } from '@vulcan-sql/core';

export class TestFilterBuilder extends FilterBuilder {
  public filterName = 'test';
}

export class TestFilterRunner extends FilterRunner {
  public filterName = 'test';
  private initDone = false;

  public override async activate(): Promise<void> {
    this.initDone = true;
  }

  public async transform({ value }: { value: any }): Promise<any> {
    return `${value}-${this.initDone}`;
  }
}
