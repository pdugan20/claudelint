import { defineConfig } from 'vitepress';

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
      { text: 'Rules', link: '/guide/rules-overview' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Rules Overview', link: '/guide/rules-overview' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/pdugan20/claudelint' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright (c) 2024-present Pat Dugan',
    },

    search: {
      provider: 'local',
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
