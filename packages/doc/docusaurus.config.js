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
            to: 'use-cases/internal-tools/appsmith',
            position: 'left',
            label: 'Use Cases',
            activeBaseRegex: '/use-cases/'
          },
          {
            to: 'blog',
            position: 'left',
            label: 'Blog',
          },
          {
            href: 'https://github.com/Canner/vulcan-sql-examples',
            position: 'left',
            label: 'Examples',
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
                to: '/docs/get-started/first-api',
              },
              {
                label: 'Building Data API',
                to: '/docs/develop/init',
              },
              {
                label: 'Extensions',
                to: '/docs/extensions/overview',
              },
              {
                label: 'API Catalog & Documentation',
                to: '/docs/catalog/intro',
              },
              {
                label: 'API Configuration',
                to: '/docs/api-plugin/overview',
              },
              {
                label: 'Deployment and Maintenance',
                to: '/docs/deployment',
              },
              {
                label: 'References',
                to: '/docs/references/project-configurations',
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
              {
                label: 'Examples',
                href: 'https://github.com/Canner/vulcan-sql-examples',
              },
              {
                label: 'Privacy',
                href: 'https://cannerdata.com/terms/privacy'
              }
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Canner, Inc. Built with Docusaurus.</div>`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      image: 'img/vulcan-sql-og.png',
      algolia: {
        // The application ID provided by Algolia
        appId: '1ZJ9I6IWTH',
  
        // Public API key: it is safe to commit it
        apiKey: 'b51243288e59236950e6843f26d6a8dd',
  
        indexName: 'vulcansql',
  
        // Optional: see doc section below
        contextualSearch: true,
  
        // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
        // externalUrlRegex: 'external\\.com|domain\\.com',
  
        // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl. You can use regexp or string in the `from` param. For example: localhost:3000 vs myCompany.com/docs
        replaceSearchResultPathname: {
          from: '/docs/', // or as RegExp: /\/docs\//
          to: '/',
        },
  
        // Optional: Algolia search parameters
        searchParameters: {},
  
        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: 'search',
  
        //... other Algolia params
      },
    }),

  plugins: [
    [
      '@docusaurus/plugin-google-gtag',
      {
        trackingID: 'G-8G055M318S',
        anonymizeIP: true,
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'use-cases',
        path: 'use-cases',
        routeBasePath: 'use-cases',
        sidebarPath: require.resolve('./use-cases/sidebars.js'),
      }
    ]
  ],
};

module.exports = config;
