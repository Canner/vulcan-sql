import { extensionAuthenticatorOidc } from './extension-authenticator-oidc';

describe('extensionAuthenticatorOidc', () => {
  it('should work', () => {
    expect(extensionAuthenticatorOidc()).toEqual(
      'extension-authenticator-oidc'
    );
  });
});
