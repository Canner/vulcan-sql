import { FilterBuilder } from '@vulcan-sql/api-layer';

class Test1 extends FilterBuilder {
  public filterName = 'test1';
}

class Test2 extends FilterBuilder {
  public filterName = 'test2';
}

export default {
  test1: Test1,
  test2: Test2,
};
