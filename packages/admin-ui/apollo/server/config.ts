import { pickBy } from 'lodash';

export interface IConfig {
  // pg
  pgUrl?: string;
  debug?: boolean;

  persistCredentialDir?: string;

  // encryption
  encryptionPassword: string;
  encryptionSalt: string;
}

const defaultConfig: IConfig = {
  // pg
  pgUrl: 'postgres://postgres:postgres@localhost:5432/admin_ui',
  debug: false,

  persistCredentialDir: process.cwd(),

  // encryption
  encryptionPassword: 'sementic',
  encryptionSalt: 'layer',
};

const config: IConfig = {
  // pg
  pgUrl: process.env.PG_URL,
  debug: process.env.DEBUG === 'true',

  persistCredentialDir: (() => {
    if (
      process.env.PERSIST_CREDENTIAL_DIR &&
      process.env.PERSIST_CREDENTIAL_DIR.length > 0
    ) {
      console.log(
        'process.env.PERSIST_CREDENTIAL_DIR:',
        process.env.PERSIST_CREDENTIAL_DIR
      );
      return process.env.PERSIST_CREDENTIAL_DIR;
    }
    return undefined;
  })(),

  // encryption
  encryptionPassword: process.env.ENCRYPTION_PASSWORD,
  encryptionSalt: process.env.ENCRYPTION_SALT,
};

export function getConfig(): IConfig {
  return { ...defaultConfig, ...pickBy(config) };
}
