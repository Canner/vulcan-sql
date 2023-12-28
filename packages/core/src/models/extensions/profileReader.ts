import { TYPES } from '@vulcan-sql/core/types';
import { Profile } from '../profile';
import { ExtensionBase } from './base';
import { VulcanExtension } from './decorators';

@VulcanExtension(TYPES.Extension_ProfileReader, { enforcedId: true })
export abstract class ProfileReader<
  C = any,
  Options = Record<string, any>
> extends ExtensionBase<C> {
  abstract read(options: Options): Promise<Profile<Record<string, any>>[]>;
}
