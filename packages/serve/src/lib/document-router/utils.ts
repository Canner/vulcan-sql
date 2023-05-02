// get the doc default url prefix if not setting up
export const getDocUrlPrefix = (url: string) => {
  return url.replace(/\/+$/, '').replace(/^\/+/, '') || 'doc';
};
