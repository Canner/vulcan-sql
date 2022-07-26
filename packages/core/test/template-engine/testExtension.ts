import { FilterBuilder, FilterRunner, OnInit } from '@vulcan-sql/core';

class TestFilterBuilder extends FilterBuilder {
  public filterName = 'test';
}

class TestFilterRunner extends FilterRunner implements OnInit {
  public filterName = 'test';
  private initDone = false;

  public async onInit(): Promise<void> {
    this.initDone = true;
  }

  public async transform({ value }: { value: any }): Promise<any> {
    return `${value}-${this.initDone}`;
  }
}

export default [TestFilterBuilder, TestFilterRunner];
