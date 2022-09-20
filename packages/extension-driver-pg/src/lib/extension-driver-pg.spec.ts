import { extensionDriverPg } from './extension-driver-pg';

describe('extensionDriverPg', () => {
  it('should work', () => {
    expect(extensionDriverPg()).toEqual('extension-driver-pg');
  });
});
