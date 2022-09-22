export const escapeRegExp = (s: string) => {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

export const getRegexpFromWildcardPattern = (wildcardString: string) => {
  const escapedString = escapeRegExp(wildcardString);
  return new RegExp('^' + escapedString.replace(/\\\*/g, '.*') + '$');
};
