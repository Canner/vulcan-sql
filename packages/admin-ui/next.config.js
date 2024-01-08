//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
const { withNx } = require('@nx/next/plugins/with-nx');
const withAntdLess = require('next-plugin-antd-less');

if (!process.env.JSON_PATH) {
  throw new Error('JSON_PATH environment variable is required');
}

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: {
      displayName: true,
      ssr: true,
    },
  },
  serverRuntimeConfig: {
    JSON_PATH: path.resolve(__dirname, process.env.JSON_PATH),
    PG_DATABASE: process.env.PG_DATABASE,
    PG_PORT: process.env.PG_PORT,
    PG_USERNAME: process.env.PG_USERNAME,
    PG_PASSWORD: process.env.PG_PASSWORD,
  },
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  ...withAntdLess({
    // next-plugin-antd-less options
    lessVarsFilePath: path.resolve(__dirname, 'styles/antd-variables.less'),
    lessVarsFilePathAppendToEndOfContent: false,
  }),
};

module.exports = withNx(nextConfig);
