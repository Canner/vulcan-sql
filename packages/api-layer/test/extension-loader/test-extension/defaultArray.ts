import { FilterBuilder } from '@vulcan-sql/api-layer';

class Test1 extends FilterBuilder {
  public filterName = 'test1';
}

class Test2 extends FilterBuilder {
  public filterName = 'test2';
}

export default [Test1, Test2];
