import { extensionDriverKsqldb } from './extension-driver-ksqldb';

describe('extensionDriverKsqldb', () => {
  it('should work', () => {
    expect(extensionDriverKsqldb()).toEqual('extension-driver-ksqldb');
  });
});
