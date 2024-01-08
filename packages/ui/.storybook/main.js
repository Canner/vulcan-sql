import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { mergeConfig } from 'vite';

const config = {
  stories: ['../src/lib/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  viteFinal: async (config) =>
    mergeConfig(config, {
      plugins: [nxViteTsPaths()],
      css: {
        preprocessorOptions: {
          less: {
            javascriptEnabled: true,
            additionalData: `@import "../styles/antd-variables.less";`,
          },
        },
      },
    }),
};

export default config;

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs
