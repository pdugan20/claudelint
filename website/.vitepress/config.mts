import { defineConfig } from 'vitepress';
import pkg from '../../package.json';
import rulesSidebar from '../rules/_sidebar.json';
import claudeLight from './theme/claude-light.json';
import claudeDark from './theme/claude-dark.json';
import { sourceLinkPlugin } from './plugins/source-link';

export default defineConfig({
  title: 'claudelint',
  description: 'Comprehensive linter for Claude Code projects',
  lang: 'en-US',

  base: '/',
  cleanUrls: true,
  lastUpdated: true,
  deadLinks: 'error',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'icon', href: '/favicon.ico', sizes: '32x32' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    ['meta', { name: 'theme-color', content: '#1a1a19' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400;1,8..60,500&display=swap',
      },
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    [
      'meta',
      {
        property: 'og:title',
        content: 'claudelint - Lint your Claude Code projects',
      },
    ],
    [
      'meta',
      {
        property: 'og:description',
        content: 'Validate CLAUDE.md, skills, settings, hooks, MCP servers, and plugins',
      },
    ],
  ],

  themeConfig: {
    logo: {
      light: '/logo.svg',
      dark: '/logo-dark.svg',
    },
    nav: [
      { text: 'Guide', link: '/guide/getting-started', activeMatch: '^/guide/' },
      {
        text: 'Validators',
        link: '/validators/overview',
        activeMatch: '^/validators/',
      },
      { text: 'Rules', link: '/rules/overview', activeMatch: '^/rules/' },
      { text: 'Integrations', link: '/integrations/overview', activeMatch: '^/integrations/' },
      { text: 'API', link: '/api/overview', activeMatch: '^/api/' },
      { text: 'Development', link: '/development/overview', activeMatch: '^/development/' },
      {
        text: `v${pkg.version}`,
        items: [
          {
            text: 'Changelog',
            link: 'https://github.com/pdugan20/claudelint/blob/main/CHANGELOG.md',
          },
          {
            text: 'Releases',
            link: 'https://github.com/pdugan20/claudelint/releases',
          },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/getting-started' },
            { text: 'Why claudelint?', link: '/guide/why-claudelint' },
          ],
        },
        {
          text: 'Usage',
          items: [
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'CLI Reference', link: '/guide/cli-reference' },
            { text: 'File Discovery', link: '/guide/file-discovery' },
            { text: 'Auto-fix', link: '/guide/auto-fix' },
            { text: 'Inline Disables', link: '/guide/inline-disables' },
          ],
        },
        {
          text: 'Help',
          items: [
            { text: 'Troubleshooting', link: '/guide/troubleshooting' },
            { text: 'Glossary', link: '/guide/glossary' },
          ],
        },
      ],
      '/validators/': [
        {
          text: 'Validators',
          items: [
            { text: 'Overview', link: '/validators/overview' },
            { text: 'CLAUDE.md', link: '/validators/claude-md' },
            { text: 'Skills', link: '/validators/skills' },
            { text: 'Settings', link: '/validators/settings' },
            { text: 'Hooks', link: '/validators/hooks' },
            { text: 'MCP Servers', link: '/validators/mcp' },
            { text: 'Plugins', link: '/validators/plugin' },
            { text: 'Agents', link: '/validators/agents' },
            { text: 'LSP', link: '/validators/lsp' },
            { text: 'Output Styles', link: '/validators/output-styles' },
            { text: 'Commands', link: '/validators/commands' },
          ],
        },
      ],
      '/rules/': rulesSidebar,
      '/integrations/': [
        {
          text: 'Integrations',
          items: [
            { text: 'Overview', link: '/integrations/overview' },
            { text: 'CI/CD', link: '/integrations/ci' },
            { text: 'Claude Code Hooks', link: '/integrations/pre-commit' },
            { text: 'Npm Scripts', link: '/integrations/npm-scripts' },
            {
              text: 'Claude Code Plugin',
              link: '/integrations/claude-code-plugin',
            },
            { text: 'Monorepos', link: '/integrations/monorepos' },
            { text: 'FAQ Mockups', link: '/integrations/faq-mockups' },
            { text: 'SARIF', link: '/integrations/sarif' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/overview' },
            { text: 'ClaudeLint Class', link: '/api/claudelint-class' },
            { text: 'Functional API', link: '/api/functional-api' },
            { text: 'Types', link: '/api/types' },
            { text: 'Schemas', link: '/api/schemas' },
            { text: 'Formatters', link: '/api/formatters' },
            { text: 'Recipes', link: '/api/recipes' },
          ],
        },
      ],
      '/development/': [
        {
          text: 'Development',
          items: [
            { text: 'Overview', link: '/development/overview' },
            { text: 'Design Philosophy', link: '/development/design-philosophy' },
            { text: 'Architecture', link: '/development/architecture' },
            { text: 'Rule System', link: '/development/rule-system' },
            { text: 'Internals', link: '/development/internals' },
            {
              text: 'Custom Rules',
              link: '/development/custom-rules',
              items: [
                {
                  text: 'Troubleshooting',
                  link: '/development/custom-rules-troubleshooting',
                },
              ],
            },
            { text: 'Helper Library', link: '/development/helper-library' },
            { text: 'Contributing', link: '/development/contributing' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/pdugan20/claudelint' },
      {
        icon: 'npm',
        link: 'https://www.npmjs.com/package/claude-code-lint',
      },
    ],

    editLink: {
      pattern: 'https://github.com/pdugan20/claudelint/edit/main/website/:path',
      text: 'Edit this page on GitHub',
    },

    search: {
      provider: 'local',
    },

    outline: {
      level: [2, 3],
    },
  },

  markdown: {
    theme: {
      light: claudeLight as any,
      dark: claudeDark as any,
    },
    config(md) {
      md.use(sourceLinkPlugin);
    },
  },

  sitemap: {
    hostname: 'https://claudelint.com',
  },

  transformPageData(pageData) {
    const title = pageData.frontmatter.title || pageData.title;
    const description =
      pageData.frontmatter.description || pageData.description || 'claudelint documentation';
    const canonicalUrl = `https://claudelint.com/${pageData.relativePath}`
      .replace(/index\.md$/, '')
      .replace(/\.md$/, '');

    pageData.frontmatter.head ??= [];
    pageData.frontmatter.head.push(
      ['meta', { property: 'og:title', content: `${title} | claudelint` }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:url', content: canonicalUrl }],
      ['link', { rel: 'canonical', href: canonicalUrl }]
    );
  },
});
