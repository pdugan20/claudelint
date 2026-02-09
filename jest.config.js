module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
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
      branches: 50,
      functions: 55,
      lines: 65,
      statements: 65,
    },
  },
  coverageDirectory: 'coverage',
  verbose: true,
};
