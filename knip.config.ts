import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // Entry points (what's considered "used")
  entry: [
    'src/cli.ts',                   // CLI entry point
    'scripts/**/*.{ts,js,sh}',      // All utility scripts are entry points
    'tests/api-examples/**/*.ts',   // API code samples (intentionally standalone)
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
    'docs/**',                      // Project tracking docs
    '**/*.test.ts',                 // Test files are separate entry points
    // Public API barrel exports (intentionally unused internally, for external consumers)
    'src/composition/index.ts',
    'src/schemas/index.ts',
  ],

  // These dependencies are actually used but knip can't detect them
  ignoreDependencies: [
    'husky',                        // Used via npx in scripts/util/setup-hooks.sh
    'lint-staged',                  // Used in husky hooks
    'prettier-plugin-packagejson',  // Auto-discovered by prettier at runtime
    'vue',                          // Used in website/ VitePress components (not scanned by knip)
  ],

  // Ignore exports used only within the same file (common for utility modules)
  ignoreExportsUsedInFile: true,

  // Plugin configuration
  jest: {
    config: ['jest.config.js'],
  },
};

export default config;
