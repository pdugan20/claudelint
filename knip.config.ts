import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // Entry points (what's considered "used")
  entry: [
    'src/index.ts',                 // Main library export (public API)
    'src/cli.ts',                   // CLI entry point
    'scripts/**/*.{ts,js,sh}',      // All utility scripts are entry points
  ],

  // Project files to analyze
  project: [
    'src/**/*.ts',
    'tests/**/*.ts',
  ],

  // Ignore these paths completely
  ignore: [
    'dist/**',                      // Build artifacts
    'coverage/**',                  // Test coverage
    'packages/**',                  // Separate packages (have their own entry points)
    'docs/**',                      // Documentation
    '**/*.test.ts',                 // Test files are separate entry points
    // Public API barrel exports (intentionally unused internally, for external consumers)
    'src/composition/index.ts',
    'src/schemas/index.ts',
  ],

  // These dependencies are actually used
  ignoreDependencies: [
    'zod-validation-error',         // Used for better error messages
    '@commitlint/cli',              // Used in husky hooks
    'lint-staged',                  // Used in husky hooks
    'eslint-plugin-vue',            // Used in eslint.config.mjs for Vue linting
    'vue-eslint-parser',            // Peer dependency of eslint-plugin-vue
    'cspell',                       // Used via npm script for spell checking
    'stylelint',                     // Used via npm script and lint-staged
    'stylelint-config-recommended-vue', // Stylelint config preset
    'postcss-html',                  // PostCSS syntax for stylelint Vue parsing
  ],

  // Ignore exports used only within the same file (common for utility modules)
  ignoreExportsUsedInFile: true,

  // Plugin configuration
  jest: {
    config: ['jest.config.js'],
  },
};

export default config;
