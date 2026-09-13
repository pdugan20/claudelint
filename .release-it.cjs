const config = {
  git: {
    commitMessage: 'chore: release v${version}',
    tagName: 'v${version}',
    requireCleanWorkingDir: true,
    requireUpstream: true,
    requireCommits: false,
    addUntrackedFiles: false,
    commit: true,
    tag: true,
    push: true,
  },
  github: {
    release: false,
  },
  npm: {
    publish: false,
  },
  hooks: {
    'before:init': ['npm run lint', 'npm run test', 'npm run build'],
    'after:bump': ['npm run sync:versions'],
    'after:release': ['echo Successfully released ${name} v${version} to ${repo.repository}.'],
  },
  plugins: {
    '@release-it/conventional-changelog': {
      preset: {
        name: 'conventionalcommits',
        types: [
          {
            type: 'feat',
            section: 'Features',
            effect: 'bump',
          },
          {
            type: 'fix',
            section: 'Bug Fixes',
            effect: 'bump',
          },
          {
            type: 'perf',
            section: 'Performance Improvements',
            effect: 'bump',
          },
          {
            type: 'revert',
            section: 'Reverts',
            effect: 'bump',
          },
          {
            type: 'docs',
            section: 'Documentation',
            effect: 'changelog',
          },
          {
            type: 'style',
            section: 'Styles',
            effect: 'changelog',
          },
          {
            type: 'refactor',
            section: 'Code Refactoring',
            effect: 'changelog',
          },
          {
            type: 'test',
            section: 'Tests',
            effect: 'changelog',
          },
          {
            type: 'build',
            section: 'Build System',
            effect: 'changelog',
          },
          {
            type: 'ci',
            section: 'Continuous Integration',
            effect: 'changelog',
          },
          {
            type: 'chore',
            effect: 'hidden',
          },
        ],
      },
      infile: 'CHANGELOG.md',
      header: '# Changelog\n\nAll notable changes to this project will be documented in this file.',
      strictSemVer: true,
      gitRawCommitsOpts: {
        path: '.',
      },
    },
  },
};

// Keep generated release notes compatible with the repository emoji policy.
config.plugins['@release-it/conventional-changelog'].preset.formatNoteIcon = () => '';

module.exports = config;
