export enum ProfilesLookupType {
  LocalFile = 'LocalFile',
}

/** Define the way to find profiles */
export interface ProfilesLookup {
  type: ProfilesLookupType | string;
  options: Record<string, any>;
}

// Use pure string as a shortcut of LocalFile profiles lookup
export type IProfilesLookupOptions = Array<ProfilesLookup | string>;
