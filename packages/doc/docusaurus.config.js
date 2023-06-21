// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'VulcanSQL',
  tagline: 'Build Data APIs from parameterized SQL on your data',
  url: 'https://vulcansql.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/Canner/vulcan-sql/tree/main/packages/doc/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'VulcanSQL',
        logo: {
          alt: 'VulcanSQL logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Docs',
          },
          {
            href: 'https://discord.gg/ztDz8DCmG4',
            position: 'left',
            label: 'Community',
          },
          {
            href: 'https://twitter.com/vulcansql',
            label: 'Twitter',
            position: 'right',
          },
          {
            href: 'https://github.com/Canner/vulcan-sql',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              {
                label: 'Getting Started',
                to: '/docs/intro',
              },
              {
                label: 'Building Data API',
                to: '/docs/develop/init',
              },
              {
                label: 'API Catalog & Documentation',
                to: '/docs/catalog/catalog-intro',
              },
              {
                label: 'API Configuration',
                to: '/docs/api-plugin/overview',
              },
              {
                label: 'Deployment and Maintenance',
                to: '/docs/deployment',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.gg/ztDz8DCmG4',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/vulcansql',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/Canner/vulcan-sql',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Canner, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      image: 'img/vulcan-sql-og.png',
    }),

  plugins: [
    [
      '@docusaurus/plugin-google-gtag',
      {
        trackingID: 'G-8G055M318S',
        anonymizeIP: true,
      },
    ],
  ],
};

module.exports = config;
