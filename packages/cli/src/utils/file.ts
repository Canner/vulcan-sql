export const ensureExtension = (filename: string, ext: string) => {
  return !filename.endsWith(`.${ext}`) ? `${filename}.${ext}` : filename;
};
