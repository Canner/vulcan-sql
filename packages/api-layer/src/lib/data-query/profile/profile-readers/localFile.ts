import {
  Profile,
  ProfileReader,
  ProfilesLookupType,
  VulcanExtensionId,
  VulcanInternalExtension,
} from '@vulcan-sql/api-layer/models';
import * as path from 'path';
import * as fs from 'fs';
import * as jsYAML from 'js-yaml';
import { ConfigurationError } from '@vulcan-sql/api-layer/utils';

export interface LocalFileProfileReaderOptions {
  path: string;
}

@VulcanInternalExtension()
@VulcanExtensionId(ProfilesLookupType.LocalFile)
export class LocalFileProfileReader extends ProfileReader {
  public async read(options: LocalFileProfileReaderOptions) {
    if (!options.path)
      throw new ConfigurationError(
        'LocalFile profile reader needs options.path property'
      );

    const profilePath = path.resolve(process.cwd(), options.path);
    if (!fs.existsSync(profilePath)) return [];

    const profiles = jsYAML.load(
      await fs.promises.readFile(profilePath, 'utf-8')
    ) as Profile<Record<string, any>>[];

    // validate profiles
    for (const profile of profiles) {
      if (!profile.name || !profile.type)
        throw new ConfigurationError(
          `Invalid profile in ${profilePath}. Profile name and type are required.`
        );
    }

    return profiles;
  }
}
