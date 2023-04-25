// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNx = require('@nrwl/next/plugins/with-nx');
const withAntdLess = require('next-plugin-antd-less');
const path = require('path');

const themeVariables = path.resolve(__dirname, './styles/antd-variables.less');

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  serverRuntimeConfig: {
    // Will only be available on the server side
    tokenSecret: process.env.TOKEN_SECRET || 'tokenSecret',
    refreshTokenSecret:
      process.env.REFRESH_TOKEN_SECRET || 'refreshTokenSecret',
  },
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  reactStrictMode: false,
  ...withAntdLess({
    lessVarsFilePath: themeVariables,
    lessVarsFilePathAppendToEndOfContent: false,
  }),
};

module.exports = withNx(nextConfig);
