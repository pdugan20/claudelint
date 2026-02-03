# Testing Strategy

Comprehensive testing plan for monorepo support features.

## Overview

This document outlines the testing approach for config inheritance and workspace detection features. The goal is >90% code coverage with comprehensive edge case handling.

## Test Categories

### 1. Unit Tests

Test individual functions in isolation.

### 2. Integration Tests

Test features working together (config loading + validation).

### 3. Fixture Tests

Test with real monorepo structures.

### 4. Regression Tests

Ensure existing functionality unchanged.

## Test Coverage Goals

| Category | Target Coverage | Priority |
|----------|----------------|----------|
| Config inheritance logic | >95% | High |
| Workspace detection | >90% | High |
| CLI integration | >85% | Medium |
| Error handling | 100% | High |
| Edge cases | >80% | Medium |

## Phase 1: Config Inheritance Tests

### Unit Tests

#### `resolveConfigPath()`

```typescript
describe('resolveConfigPath', () => {
  describe('relative paths', () => {
    it('resolves ./ prefix', () => {
      const resolved = resolveConfigPath('./base.json', '/path/to/dir');
      expect(resolved).toBe('/path/to/base.json');
    });

    it('resolves ../ prefix', () => {
      const resolved = resolveConfigPath('../../root.json', '/path/to/dir');
      expect(resolved).toBe('/path/root.json');
    });

    it('resolves complex relative paths', () => {
      const resolved = resolveConfigPath('./../config.json', '/path/to/dir');
      expect(resolved).toBe('/path/to/config.json');
    });

    it('throws when file does not exist', () => {
      expect(() => {
        resolveConfigPath('./missing.json', '/path/to/dir');
      }).toThrow(ConfigError);
      expect(() => {
        resolveConfigPath('./missing.json', '/path/to/dir');
      }).toThrow(/not found/);
    });
  });

  describe('node_modules packages', () => {
    it('resolves unscoped package', () => {
      const resolved = resolveConfigPath('claudelint-config-standard', '/path');
      expect(resolved).toContain('node_modules/claudelint-config-standard');
    });

    it('resolves scoped package', () => {
      const resolved = resolveConfigPath('@acme/claudelint-config', '/path');
      expect(resolved).toContain('node_modules/@acme/claudelint-config');
    });

    it('resolves scoped package with path', () => {
      const resolved = resolveConfigPath('@acme/claudelint-config/strict', '/path');
      expect(resolved).toContain('node_modules/@acme/claudelint-config');
      expect(resolved).toContain('strict');
    });

    it('throws when package not installed', () => {
      expect(() => {
        resolveConfigPath('nonexistent-package', '/path');
      }).toThrow(ConfigError);
      expect(() => {
        resolveConfigPath('nonexistent-package', '/path');
      }).toThrow(/not found/);
      expect(() => {
        resolveConfigPath('nonexistent-package', '/path');
      }).toThrow(/npm install/);
    });
  });

  describe('error messages', () => {
    it('includes resolved path in error', () => {
      expect(() => {
        resolveConfigPath('./missing.json', '/from/dir');
      }).toThrow(/Resolved to:.*\/from\/missing\.json/);
    });

    it('includes referenced directory in error', () => {
      expect(() => {
        resolveConfigPath('./missing.json', '/from/dir');
      }).toThrow(/Referenced from:.*\/from\/dir/);
    });

    it('suggests npm install for missing packages', () => {
      expect(() => {
        resolveConfigPath('missing-pkg', '/dir');
      }).toThrow(/npm install --save-dev missing-pkg/);
    });
  });
});
```

#### `loadConfigWithExtends()`

```typescript
describe('loadConfigWithExtends', () => {
  describe('single extends', () => {
    it('loads and merges extended config', () => {
      // Fixture: base.json with rules, child.json extends it
      const config = loadConfigWithExtends('/fixtures/child.json');

      expect(config.rules).toMatchObject({
        'size-error': 'error',    // From base
        'size-warning': 'warn'    // From child
      });
    });

    it('child overrides base rules', () => {
      // Fixture: base has rule, child overrides it
      const config = loadConfigWithExtends('/fixtures/override.json');

      expect(config.rules!['size-warning']).toBe('off');
    });

    it('returns as-is when no extends', () => {
      const config = loadConfigWithExtends('/fixtures/no-extends.json');

      expect(config).toMatchObject({
        rules: expect.any(Object)
      });
      expect(config.extends).toBeUndefined();
    });
  });

  describe('multiple extends', () => {
    it('merges array of extends in order', () => {
      // Fixture: child extends [base, strict]
      // base: { size-error: warn }
      // strict: { size-error: error, skill-missing-changelog: error }
      // child: { size-warning: warn }
      const config = loadConfigWithExtends('/fixtures/multi-extends.json');

      expect(config.rules).toMatchObject({
        'size-error': 'error',                // From strict (overrides base)
        'skill-missing-changelog': 'error',   // From strict
        'size-warning': 'warn'                // From child
      });
    });

    it('child overrides all extended configs', () => {
      // Fixture: base and strict both have size-error, child overrides
      const config = loadConfigWithExtends('/fixtures/override-all.json');

      expect(config.rules!['size-error']).toBe('off');
    });
  });

  describe('recursive extends', () => {
    it('loads multi-level extends (A → B → C)', () => {
      // Fixture: child → base → root
      const config = loadConfigWithExtends('/fixtures/deep/child.json');

      expect(config.rules).toMatchObject({
        'size-error': 'error',    // From root
        'size-warning': 'warn',   // From base
        'skill-missing-changelog': 'error'  // From child
      });
    });

    it('merge order is correct (root → base → child)', () => {
      // Fixture: all three configs have same rule with different values
      const config = loadConfigWithExtends('/fixtures/deep/priority.json');

      expect(config.rules!['test-rule']).toBe('from-child');
    });
  });

  describe('circular dependencies', () => {
    it('detects direct circular dependency (A → B → A)', () => {
      expect(() => {
        loadConfigWithExtends('/fixtures/circular/a.json');
      }).toThrow(ConfigError);
      expect(() => {
        loadConfigWithExtends('/fixtures/circular/a.json');
      }).toThrow(/Circular dependency/);
    });

    it('detects indirect circular dependency (A → B → C → A)', () => {
      expect(() => {
        loadConfigWithExtends('/fixtures/circular/deep-a.json');
      }).toThrow(/Circular dependency/);
    });

    it('includes dependency chain in error', () => {
      expect(() => {
        loadConfigWithExtends('/fixtures/circular/a.json');
      }).toThrow(/a\.json.*b\.json.*a\.json/);
    });
  });

  describe('config merging', () => {
    it('deep merges rules object', () => {
      const config = loadConfigWithExtends('/fixtures/merge/rules.json');

      expect(Object.keys(config.rules || {})).toContain('size-error');
      expect(Object.keys(config.rules || {})).toContain('size-warning');
    });

    it('concatenates overrides arrays', () => {
      const config = loadConfigWithExtends('/fixtures/merge/overrides.json');

      expect(config.overrides).toHaveLength(2);
      expect(config.overrides![0].files).toContain('*.md');
      expect(config.overrides![1].files).toContain('SKILL.md');
    });

    it('concatenates ignorePatterns', () => {
      const config = loadConfigWithExtends('/fixtures/merge/ignore.json');

      expect(config.ignorePatterns).toContain('node_modules/**');
      expect(config.ignorePatterns).toContain('dist/**');
    });

    it('last wins for output object', () => {
      const config = loadConfigWithExtends('/fixtures/merge/output.json');

      expect(config.output?.format).toBe('json');
    });

    it('last wins for scalar values', () => {
      const config = loadConfigWithExtends('/fixtures/merge/scalars.json');

      expect(config.maxWarnings).toBe(5);
      expect(config.reportUnusedDisableDirectives).toBe(true);
    });
  });

  describe('node_modules extends', () => {
    it('loads config from node_modules', () => {
      // Test with mock package in node_modules
      const config = loadConfigWithExtends('/fixtures/with-package/child.json');

      expect(config.rules).toMatchObject(expect.any(Object));
    });

    it('resolves scoped packages', () => {
      const config = loadConfigWithExtends('/fixtures/scoped-package/child.json');

      expect(config.rules).toMatchObject(expect.any(Object));
    });
  });

  describe('error handling', () => {
    it('provides helpful error for missing extended config', () => {
      expect(() => {
        loadConfigWithExtends('/fixtures/missing-extends/child.json');
      }).toThrow(/Extended config not found/);
    });

    it('provides helpful error for malformed extended config', () => {
      expect(() => {
        loadConfigWithExtends('/fixtures/malformed-extends/child.json');
      }).toThrow(ConfigError);
    });
  });
});
```

### Integration Tests

```typescript
describe('extends with validation', () => {
  it('validates with inherited rules', async () => {
    const linter = new ClaudeLint({
      cwd: '/fixtures/monorepo/packages/app-1'
    });

    const results = await linter.lintFiles(['CLAUDE.md']);

    // Should apply rules from extended config
    expect(results).toHaveLength(1);
  });

  it('child config overrides inherited rules', async () => {
    const linter = new ClaudeLint({
      cwd: '/fixtures/monorepo/packages/strict'
    });

    const results = await linter.lintFiles(['CLAUDE.md']);

    // Package has stricter rules than root
    expect(results[0].errorCount).toBeGreaterThan(0);
  });

  it('works without extends (backward compatible)', async () => {
    const linter = new ClaudeLint({
      cwd: '/fixtures/single-repo'
    });

    const results = await linter.lintFiles(['CLAUDE.md']);

    expect(results).toHaveLength(1);
  });
});
```

## Phase 2: Workspace Detection Tests

### Unit Tests

#### `detectWorkspace()`

```typescript
describe('detectWorkspace', () => {
  describe('pnpm workspaces', () => {
    it('detects pnpm-workspace.yaml', async () => {
      const workspace = await detectWorkspace('/fixtures/pnpm-monorepo');

      expect(workspace).toMatchObject({
        root: expect.stringContaining('pnpm-monorepo'),
        packageManager: 'pnpm',
        packages: expect.arrayContaining([
          expect.stringContaining('packages/app-1'),
          expect.stringContaining('packages/app-2')
        ])
      });
    });

    it('expands glob patterns', async () => {
      const workspace = await detectWorkspace('/fixtures/pnpm-globs');

      expect(workspace?.packages.length).toBeGreaterThan(0);
    });

    it('handles negation patterns', async () => {
      const workspace = await detectWorkspace('/fixtures/pnpm-negation');

      expect(workspace?.packages).not.toContain(
        expect.stringContaining('packages/test')
      );
    });

    it('returns null for malformed YAML', async () => {
      const workspace = await detectWorkspace('/fixtures/malformed-yaml');

      expect(workspace).toBeNull();
    });
  });

  describe('npm workspaces', () => {
    it('detects npm workspaces array format', async () => {
      const workspace = await detectWorkspace('/fixtures/npm-monorepo');

      expect(workspace).toMatchObject({
        packageManager: 'npm',
        packages: expect.any(Array)
      });
    });

    it('expands glob patterns', async () => {
      const workspace = await detectWorkspace('/fixtures/npm-globs');

      expect(workspace?.packages.length).toBeGreaterThan(0);
    });
  });

  describe('yarn workspaces', () => {
    it('detects yarn workspaces object format', async () => {
      const workspace = await detectWorkspace('/fixtures/yarn-monorepo');

      expect(workspace).toMatchObject({
        packageManager: 'yarn',
        packages: expect.any(Array)
      });
    });

    it('handles array format (like npm)', async () => {
      const workspace = await detectWorkspace('/fixtures/yarn-array');

      expect(workspace?.packageManager).toBe('yarn');
    });
  });

  describe('no workspace', () => {
    it('returns null for single repo', async () => {
      const workspace = await detectWorkspace('/fixtures/single-repo');

      expect(workspace).toBeNull();
    });

    it('returns null when no config files', async () => {
      const workspace = await detectWorkspace('/fixtures/empty');

      expect(workspace).toBeNull();
    });
  });

  describe('package manager detection', () => {
    it('detects pnpm from pnpm-lock.yaml', () => {
      const pm = detectPackageManager('/fixtures/pnpm-monorepo');
      expect(pm).toBe('pnpm');
    });

    it('detects yarn from yarn.lock', () => {
      const pm = detectPackageManager('/fixtures/yarn-monorepo');
      expect(pm).toBe('yarn');
    });

    it('defaults to npm', () => {
      const pm = detectPackageManager('/fixtures/npm-monorepo');
      expect(pm).toBe('npm');
    });
  });
});
```

#### `expandWorkspaceGlobs()`

```typescript
describe('expandWorkspaceGlobs', () => {
  it('expands single pattern', async () => {
    const packages = await expandWorkspaceGlobs(['packages/*'], '/fixtures/monorepo');

    expect(packages).toEqual([
      expect.stringContaining('packages/app-1'),
      expect.stringContaining('packages/app-2')
    ]);
  });

  it('expands multiple patterns', async () => {
    const packages = await expandWorkspaceGlobs(
      ['packages/*', 'apps/*'],
      '/fixtures/monorepo'
    );

    expect(packages.length).toBeGreaterThan(2);
  });

  it('deduplicates results', async () => {
    const packages = await expandWorkspaceGlobs(
      ['packages/*', 'packages/app-*'],
      '/fixtures/monorepo'
    );

    const uniqueCount = new Set(packages).size;
    expect(packages.length).toBe(uniqueCount);
  });

  it('returns sorted results', async () => {
    const packages = await expandWorkspaceGlobs(['packages/*'], '/fixtures/monorepo');

    const sorted = [...packages].sort();
    expect(packages).toEqual(sorted);
  });
});
```

### CLI Integration Tests

```typescript
describe('CLI workspace flags', () => {
  describe('--workspace', () => {
    it('validates specific package', async () => {
      const { stdout, code } = await runCLI([
        'check-all',
        '--workspace',
        'app-1'
      ], '/fixtures/monorepo');

      expect(stdout).toContain('Validating workspace package: app-1');
      expect(code).toBe(0);
    });

    it('errors when package not found', async () => {
      const { stderr, code } = await runCLI([
        'check-all',
        '--workspace',
        'nonexistent'
      ], '/fixtures/monorepo');

      expect(stderr).toContain('Package "nonexistent" not found');
      expect(stderr).toContain('Available packages:');
      expect(code).toBe(2);
    });

    it('errors when no workspace detected', async () => {
      const { stderr, code } = await runCLI([
        'check-all',
        '--workspace',
        'app-1'
      ], '/fixtures/single-repo');

      expect(stderr).toContain('No workspace detected');
      expect(code).toBe(2);
    });
  });

  describe('--workspaces', () => {
    it('validates all packages', async () => {
      const { stdout, code } = await runCLI([
        'check-all',
        '--workspaces'
      ], '/fixtures/monorepo');

      expect(stdout).toContain('Workspace Validation Summary');
      expect(stdout).toContain('Total Packages:');
      expect(code).toBe(0);
    });

    it('displays per-package results', async () => {
      const { stdout } = await runCLI([
        'check-all',
        '--workspaces'
      ], '/fixtures/monorepo');

      expect(stdout).toContain('[app-1]');
      expect(stdout).toContain('[app-2]');
    });

    it('exits with error if any package fails', async () => {
      const { code } = await runCLI([
        'check-all',
        '--workspaces'
      ], '/fixtures/monorepo-with-errors');

      expect(code).toBe(1);
    });
  });
});
```

## Test Fixtures

### Fixture Structure

```text
tests/fixtures/
├── config-inheritance/
│   ├── single-extend/
│   │   ├── base.json
│   │   └── child.json
│   ├── multi-extend/
│   │   ├── base.json
│   │   ├── strict.json
│   │   └── child.json
│   ├── deep/
│   │   ├── root.json
│   │   ├── base.json
│   │   └── child.json
│   └── circular/
│       ├── a.json (extends b.json)
│       └── b.json (extends a.json)
├── workspaces/
│   ├── pnpm-monorepo/
│   │   ├── pnpm-workspace.yaml
│   │   ├── pnpm-lock.yaml
│   │   └── packages/
│   ├── npm-monorepo/
│   │   ├── package.json
│   │   ├── package-lock.json
│   │   └── packages/
│   └── yarn-monorepo/
│       ├── package.json
│       ├── yarn.lock
│       └── packages/
└── single-repo/
    ├── .claudelintrc.json
    └── CLAUDE.md
```

## Regression Tests

Ensure existing functionality unchanged:

```typescript
describe('backward compatibility', () => {
  it('validates without extends field', async () => {
    const linter = new ClaudeLint({
      cwd: '/fixtures/single-repo'
    });

    const results = await linter.lintFiles(['**/*.md']);

    expect(results).toBeDefined();
  });

  it('check-all works without workspace flags', async () => {
    const { code } = await runCLI(['check-all'], '/fixtures/single-repo');

    expect(code).toBe(0);
  });

  it('existing configs still work', async () => {
    const config = loadConfig('/fixtures/existing-config.json');

    expect(config).toMatchObject({
      rules: expect.any(Object)
    });
  });
});
```

## Performance Tests

```typescript
describe('performance', () => {
  it('config loading not significantly slower', async () => {
    const start = Date.now();
    const config = loadConfigWithExtends('/fixtures/large-monorepo/child.json');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100);
  });

  it('workspace detection fast', async () => {
    const start = Date.now();
    const workspace = await detectWorkspace('/fixtures/large-monorepo');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(200);
  });
});
```

## Test Data Setup

### Helper Functions

```typescript
/**
 * Create test fixture with config files
 */
function createConfigFixture(files: Record<string, ClaudeLintConfig>): string {
  const tempDir = mkdtempSync('/tmp/claudelint-test-');

  for (const [path, config] of Object.entries(files)) {
    const fullPath = join(tempDir, path);
    mkdirSync(dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, JSON.stringify(config, null, 2));
  }

  return tempDir;
}

/**
 * Create monorepo fixture
 */
function createMonorepoFixture(type: 'pnpm' | 'npm' | 'yarn'): string {
  const tempDir = mkdtempSync('/tmp/claudelint-monorepo-');

  // Create workspace config
  if (type === 'pnpm') {
    writeFileSync(
      join(tempDir, 'pnpm-workspace.yaml'),
      'packages:\n  - "packages/*"\n'
    );
  } else {
    const pkg = {
      workspaces: type === 'yarn'
        ? { packages: ['packages/*'] }
        : ['packages/*']
    };
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify(pkg, null, 2));
  }

  // Create packages
  for (const name of ['app-1', 'app-2']) {
    const pkgDir = join(tempDir, 'packages', name);
    mkdirSync(pkgDir, { recursive: true });
    writeFileSync(join(pkgDir, 'CLAUDE.md'), '# Test\n');
  }

  return tempDir;
}
```

## Coverage Requirements

### Minimum Coverage Thresholds

```json
{
  "jest": {
    "coverageThresholds": {
      "global": {
        "branches": 85,
        "functions": 90,
        "lines": 90,
        "statements": 90
      },
      "src/utils/config/extends.ts": {
        "branches": 95,
        "functions": 95,
        "lines": 95,
        "statements": 95
      },
      "src/utils/workspace/detector.ts": {
        "branches": 90,
        "functions": 90,
        "lines": 90,
        "statements": 90
      }
    }
  }
}
```

## Test Execution

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

```bash
npm test -- config-inheritance
npm test -- workspace-detection
npm test -- cli-integration
```

### Coverage Report

```bash
npm test -- --coverage
```

## Continuous Integration

Tests run automatically on:

- Every commit (pre-commit hook)
- Pull requests (GitHub Actions)
- Before releases

## Success Criteria

All tests must pass with:

- [ ] >90% code coverage overall
- [ ] >95% coverage for config inheritance
- [ ] >90% coverage for workspace detection
- [ ] All edge cases covered
- [ ] No regression in existing tests
- [ ] CI pipeline green
