/** @type {import('ts-jest').JestConfigWithTsJest} */

const sharedConfig = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  verbose: true,
};

module.exports = {
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/__tests__/**',
    // Entry points and barrel re-exports
    '!src/index.ts',
    '!src/api/index.ts',
    '!src/schemas/index.ts',
    '!src/utils/index.ts',
    '!src/utils/validators/index.ts',
    '!src/validators/index.ts',
    // Generated files
    '!src/rules/rule-ids.ts',
    '!src/rules/index.ts',
    // CLI (tested via integration tests, not unit tests)
    '!src/cli.ts',
    '!src/cli/commands/**',
    '!src/cli/init-wizard.ts',
    '!src/cli/config-debug.ts',
    '!src/cli/utils/logger.ts',
    '!src/cli/utils/config-loader.ts',
    '!src/cli/utils/system-tools.ts',
    '!src/cli/utils/formatters/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageDirectory: 'coverage',

  projects: [
    {
      ...sharedConfig,
      displayName: 'unit',
      roots: ['<rootDir>/src', '<rootDir>/tests'],
      testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
      testPathIgnorePatterns: ['<rootDir>/tests/integration/'],
    },
    {
      ...sharedConfig,
      displayName: 'integration',
      roots: ['<rootDir>/tests/integration'],
      testMatch: ['**/?(*.)+(spec|test).ts'],
      // Run integration tests sequentially -- they spawn CLI subprocesses
      // that compete for CPU when run in parallel
      maxWorkers: 1,
    },
  ],
};
