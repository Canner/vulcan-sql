import { isEmpty } from 'lodash';
import { inject, multiInject } from 'inversify';
import { TYPES as CORE_TYPES } from '@vulcan-sql/core';
import {
  BuiltInMiddleware,
  BaseAuthenticator,
  AuthOptions,
} from '@vulcan-sql/serve/models';
import { TYPES } from '@vulcan-sql/serve/containers';

type AuthenticatorMap = {
  [name: string]: BaseAuthenticator<any>;
};

export abstract class BaseAuthMiddleware extends BuiltInMiddleware<AuthOptions> {
  protected options = (this.getOptions() as AuthOptions) || {};
  protected authenticators: AuthenticatorMap;

  constructor(
    @inject(CORE_TYPES.ExtensionConfig) config: any,
    @inject(CORE_TYPES.ExtensionName) name: string,
    @multiInject(TYPES.Extension_Authenticator)
    authenticators: BaseAuthenticator<any>[]
  ) {
    super(config, name);

    this.authenticators = authenticators.reduce<AuthenticatorMap>(
      (prev, authenticator) => {
        prev[authenticator.getExtensionId()!] = authenticator;
        return prev;
      },
      {}
    );
  }
  public async initialize() {
    if (this.enabled && isEmpty(this.options)) {
      throw new Error(
        'please set at least one auth type and user credential when you enable the "auth" options.'
      );
    }

    const names = Object.keys(this.authenticators);
    // check setup auth type in options also valid in authenticators
    Object.keys(this.options).map((type) => {
      if (!names.includes(type))
        throw new Error(
          `The auth type "${type}" in options not supported, authenticator only supported ${names}.`
        );
    });

    for (const name of names) {
      const authenticator = this.authenticators[name];
      if (authenticator.activate) await authenticator.activate();
    }
  }
}
