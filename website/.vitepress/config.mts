import { defineConfig } from 'vitepress';
import rulesSidebar from '../rules/_sidebar.json';

export default defineConfig({
  title: 'claudelint',
  description: 'Comprehensive linter for Claude Code projects',
  lang: 'en-US',

  base: '/',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
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
        content:
          'Validate CLAUDE.md, skills, settings, hooks, MCP servers, and plugins',
      },
    ],
  ],

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      {
        text: 'Validators',
        link: '/validators/overview',
      },
      { text: 'Rules', link: '/rules/overview' },
      { text: 'Integrations', link: '/integrations/overview' },
      { text: 'API', link: '/api/overview' },
      { text: 'Development', link: '/development/overview' },
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
            { text: 'npm Scripts', link: '/integrations/npm-scripts' },
            {
              text: 'Claude Code Plugin',
              link: '/integrations/claude-code-plugin',
            },
            { text: 'Monorepos', link: '/integrations/monorepos' },
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
          ],
        },
      ],
      '/development/': [
        {
          text: 'Development',
          items: [
            { text: 'Overview', link: '/development/overview' },
            { text: 'Architecture', link: '/development/architecture' },
            { text: 'Custom Rules', link: '/development/custom-rules' },
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
      pattern:
        'https://github.com/pdugan20/claudelint/edit/main/website/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright (c) 2025-present Pat Dugan',
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
      light: 'github-light',
      dark: 'github-dark',
    },
  },

  sitemap: {
    hostname: 'https://claudelint.com',
  },
});
