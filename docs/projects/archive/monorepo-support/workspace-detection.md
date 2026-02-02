# Workspace Detection - Technical Design

Technical specification for detecting and validating monorepo workspaces in pnpm, npm, and Yarn.

## Overview

Workspace detection allows claudelint to understand monorepo boundaries, detect packages, and provide workspace-scoped validation through CLI flags.

## Design Goals

1. **Universal**: Support pnpm, npm, and Yarn workspaces
2. **Automatic**: Auto-detect workspace configuration
3. **Explicit**: Require flags for workspace-specific behavior (no magic)
4. **Fast**: Detection should be <100ms even for large monorepos
5. **Graceful**: Helpful errors when workspace operations used outside monorepos

## Workspace Types

### pnpm Workspaces

**Configuration File:** `pnpm-workspace.yaml`

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - '!**/test/**'
```

**Detection Strategy:**
- Check for `pnpm-workspace.yaml` in current directory
- Parse YAML to extract `packages` array
- Expand glob patterns to find package directories

### npm Workspaces

**Configuration File:** `package.json`

```json
{
  "name": "my-monorepo",
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

**Detection Strategy:**
- Check for `package.json` in current directory
- Look for `workspaces` field (array format)
- Expand glob patterns

### Yarn Workspaces

**Configuration File:** `package.json`

```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": {
    "packages": [
      "packages/*",
      "apps/*"
    ]
  }
}
```

**Detection Strategy:**
- Check for `package.json` in current directory
- Look for `workspaces.packages` field (object format)
- Also support array format (like npm)
- Expand glob patterns

## Implementation

### Data Structures

```typescript
/**
 * Information about detected workspace
 */
export interface WorkspaceInfo {
  /** Absolute path to workspace root */
  root: string;

  /** Absolute paths to all workspace packages */
  packages: string[];

  /** Package manager type */
  packageManager: 'pnpm' | 'npm' | 'yarn' | 'none';
}
```

### Main Detection Function

```typescript
/**
 * Detect workspace configuration from current directory
 *
 * @param cwd - Directory to search from (defaults to process.cwd())
 * @returns WorkspaceInfo if workspace found, null otherwise
 */
export async function detectWorkspace(
  cwd: string = process.cwd()
): Promise<WorkspaceInfo | null> {
  // Try pnpm first
  const pnpmWorkspace = await detectPnpmWorkspace(cwd);
  if (pnpmWorkspace) {
    return pnpmWorkspace;
  }

  // Try npm/Yarn workspaces
  const npmWorkspace = await detectNpmWorkspace(cwd);
  if (npmWorkspace) {
    return npmWorkspace;
  }

  // No workspace found
  return null;
}
```

### pnpm Detection

```typescript
/**
 * Detect pnpm workspace
 */
async function detectPnpmWorkspace(
  cwd: string
): Promise<WorkspaceInfo | null> {
  const workspaceFile = join(cwd, 'pnpm-workspace.yaml');

  if (!existsSync(workspaceFile)) {
    return null;
  }

  try {
    // Parse YAML
    const content = readFileSync(workspaceFile, 'utf-8');
    const config = parseYaml(content) as { packages?: string[] };

    if (!config.packages || !Array.isArray(config.packages)) {
      throw new Error('pnpm-workspace.yaml must have a "packages" array');
    }

    // Expand glob patterns to package directories
    const packages = await expandWorkspaceGlobs(config.packages, cwd);

    return {
      root: cwd,
      packages,
      packageManager: 'pnpm'
    };
  } catch (error) {
    // Log warning but don't fail - malformed config should be non-fatal
    console.warn(
      `Warning: Failed to parse pnpm-workspace.yaml: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}
```

### npm/Yarn Detection

```typescript
/**
 * Detect npm or Yarn workspace
 */
async function detectNpmWorkspace(
  cwd: string
): Promise<WorkspaceInfo | null> {
  const packageJsonPath = join(cwd, 'package.json');

  if (!existsSync(packageJsonPath)) {
    return null;
  }

  try {
    // Parse package.json
    const content = readFileSync(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(content);

    if (!pkg.workspaces) {
      return null;
    }

    // Handle both array and object formats
    // Array format (npm): "workspaces": ["packages/*"]
    // Object format (Yarn): "workspaces": { "packages": [...] }
    const workspacePatterns = Array.isArray(pkg.workspaces)
      ? pkg.workspaces
      : pkg.workspaces.packages;

    if (!workspacePatterns || !Array.isArray(workspacePatterns)) {
      throw new Error(
        'package.json workspaces must be an array or { packages: [...] }'
      );
    }

    // Expand glob patterns
    const packages = await expandWorkspaceGlobs(workspacePatterns, cwd);

    // Detect which package manager
    const packageManager = detectPackageManager(cwd);

    return {
      root: cwd,
      packages,
      packageManager
    };
  } catch (error) {
    // Log warning but don't fail
    console.warn(
      `Warning: Failed to parse package.json workspaces: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}
```

### Glob Expansion

```typescript
/**
 * Expand workspace glob patterns to actual package directories
 *
 * @param patterns - Glob patterns from workspace config
 * @param root - Workspace root directory
 * @returns Array of absolute paths to package directories
 */
async function expandWorkspaceGlobs(
  patterns: string[],
  root: string
): Promise<string[]> {
  const allPackages: string[] = [];

  for (const pattern of patterns) {
    // Skip negation patterns (start with !)
    // These are handled by glob library automatically
    const matches = await glob(pattern, {
      cwd: root,
      absolute: true,
      onlyDirectories: true, // Workspace packages are always directories
      ignore: ['**/node_modules/**', '**/.git/**'] // Always ignore these
    });

    allPackages.push(...matches);
  }

  // Remove duplicates
  const uniquePackages = [...new Set(allPackages)];

  // Sort for consistent ordering
  return uniquePackages.sort();
}
```

### Package Manager Detection

```typescript
/**
 * Detect package manager from lock files
 *
 * @param cwd - Directory to check
 * @returns Package manager type
 */
function detectPackageManager(cwd: string): 'pnpm' | 'yarn' | 'npm' {
  // Check for pnpm-lock.yaml
  if (existsSync(join(cwd, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }

  // Check for yarn.lock
  if (existsSync(join(cwd, 'yarn.lock'))) {
    return 'yarn';
  }

  // Default to npm
  return 'npm';
}
```

## CLI Integration

### Command Flags

Add two new flags to `check-all` command:

```typescript
program
  .command('check-all')
  .option('--workspace <name>', 'Validate only the specified workspace package')
  .option('--workspaces', 'Validate each workspace package independently')
  // ... existing options
```

### Flag Implementation

```typescript
async function handleCheckAll(options: {
  workspace?: string;
  workspaces?: boolean;
  // ... other options
}) {
  // Workspace-specific validation
  if (options.workspace || options.workspaces) {
    const workspace = await detectWorkspace(process.cwd());

    if (!workspace) {
      logger.error('No workspace detected in current directory.');
      logger.error('The --workspace and --workspaces flags require a monorepo setup.');
      logger.error('Supported: pnpm-workspace.yaml, npm workspaces, Yarn workspaces');
      process.exit(2);
    }

    if (options.workspace) {
      return await validateSpecificWorkspace(workspace, options.workspace, options);
    }

    if (options.workspaces) {
      return await validateAllWorkspaces(workspace, options);
    }
  }

  // Normal validation (existing code)
  await runNormalValidation(options);
}
```

### Validate Specific Workspace

```typescript
/**
 * Validate a specific workspace package
 */
async function validateSpecificWorkspace(
  workspace: WorkspaceInfo,
  packageName: string,
  options: CommandOptions
): Promise<void> {
  // Find package by name
  const pkg = workspace.packages.find(p => basename(p) === packageName);

  if (!pkg) {
    logger.error(`Package "${packageName}" not found in workspace.`);
    logger.error(`Available packages:`);
    workspace.packages.forEach(p => {
      logger.error(`  - ${basename(p)}`);
    });
    process.exit(2);
  }

  logger.info(`Validating workspace package: ${packageName}`);
  logger.info(`Path: ${pkg}`);
  logger.newline();

  // Run validation with package as cwd
  const results = await runValidation({
    ...options,
    path: pkg
  });

  // Display results
  await displayResults(results, options);

  // Exit with appropriate code
  const exitCode = getExitCode(results);
  process.exit(exitCode);
}
```

### Validate All Workspaces

```typescript
/**
 * Validate all workspace packages independently
 */
async function validateAllWorkspaces(
  workspace: WorkspaceInfo,
  options: CommandOptions
): Promise<void> {
  logger.info(`Found ${workspace.packages.length} workspace packages`);
  logger.newline();

  const allResults: ValidationResult[] = [];
  let totalErrors = 0;
  let totalWarnings = 0;

  // Validate each package
  for (const pkg of workspace.packages) {
    const pkgName = basename(pkg);

    logger.info(`[${pkgName}] Validating...`);

    const results = await runValidation({
      ...options,
      path: pkg
    });

    allResults.push({
      package: pkgName,
      path: pkg,
      results
    });

    // Count errors/warnings
    const errors = results.filter(r => r.errorCount > 0).length;
    const warnings = results.filter(r => r.warningCount > 0).length;

    totalErrors += errors;
    totalWarnings += warnings;

    // Display package results
    if (errors > 0 || warnings > 0) {
      logger.error(`[${pkgName}] ${errors} errors, ${warnings} warnings`);
    } else {
      logger.success(`[${pkgName}] No issues`);
    }

    logger.newline();
  }

  // Display summary
  logger.newline();
  logger.info('='.repeat(50));
  logger.info('Workspace Validation Summary');
  logger.info('='.repeat(50));
  logger.info(`Total Packages: ${workspace.packages.length}`);
  logger.info(`Total Errors: ${totalErrors}`);
  logger.info(`Total Warnings: ${totalWarnings}`);

  // Exit with error if any package failed
  if (totalErrors > 0) {
    process.exit(1);
  }
}
```

## Usage Examples

### Validate Specific Package

```bash
# From monorepo root
claudelint check-all --workspace my-app

# Output:
# Validating workspace package: my-app
# Path: /path/to/monorepo/packages/my-app
#
# ✓ Validated CLAUDE.md files (45ms)
# ✓ Validated skills (120ms)
# ...
```

### Validate All Packages

```bash
# From monorepo root
claudelint check-all --workspaces

# Output:
# Found 3 workspace packages
#
# [app-1] Validating...
# [app-1] No issues
#
# [app-2] Validating...
# [app-2] 2 errors, 1 warning
#
# [shared] Validating...
# [shared] No issues
#
# ==================================================
# Workspace Validation Summary
# ==================================================
# Total Packages: 3
# Total Errors: 2
# Total Warnings: 1
```

## Error Handling

### No Workspace Detected

```bash
$ claudelint check-all --workspace my-app

# Error output:
No workspace detected in current directory.
The --workspace and --workspaces flags require a monorepo setup.
Supported: pnpm-workspace.yaml, npm workspaces, Yarn workspaces

# Exit code: 2
```

### Package Not Found

```bash
$ claudelint check-all --workspace nonexistent

# Error output:
Package "nonexistent" not found in workspace.
Available packages:
  - app-1
  - app-2
  - shared

# Exit code: 2
```

### Malformed Config

```bash
# If pnpm-workspace.yaml is malformed
Warning: Failed to parse pnpm-workspace.yaml: Unexpected token
Falling back to normal validation...
```

## Testing Strategy

### Unit Tests

```typescript
describe('detectWorkspace', () => {
  it('detects pnpm workspace', async () => {
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

  it('detects npm workspace', async () => {
    const workspace = await detectWorkspace('/fixtures/npm-monorepo');
    expect(workspace?.packageManager).toBe('npm');
  });

  it('detects Yarn workspace', async () => {
    const workspace = await detectWorkspace('/fixtures/yarn-monorepo');
    expect(workspace?.packageManager).toBe('yarn');
  });

  it('returns null for non-monorepo', async () => {
    const workspace = await detectWorkspace('/fixtures/single-repo');
    expect(workspace).toBeNull();
  });

  it('handles malformed YAML gracefully', async () => {
    const workspace = await detectWorkspace('/fixtures/malformed-yaml');
    expect(workspace).toBeNull();
  });
});

describe('expandWorkspaceGlobs', () => {
  it('expands single pattern', async () => {
    const packages = await expandWorkspaceGlobs(['packages/*'], '/root');
    expect(packages).toEqual([
      '/root/packages/app-1',
      '/root/packages/app-2'
    ]);
  });

  it('expands multiple patterns', async () => {
    const packages = await expandWorkspaceGlobs(
      ['packages/*', 'apps/*'],
      '/root'
    );
    expect(packages.length).toBeGreaterThan(0);
  });

  it('handles negation patterns', async () => {
    const packages = await expandWorkspaceGlobs(
      ['packages/*', '!packages/test'],
      '/root'
    );
    expect(packages).not.toContain('/root/packages/test');
  });
});
```

### Integration Tests

```typescript
describe('CLI workspace flags', () => {
  it('validates specific workspace', async () => {
    const output = await runCLI([
      'check-all',
      '--workspace',
      'app-1'
    ], '/fixtures/monorepo');

    expect(output).toContain('Validating workspace package: app-1');
  });

  it('validates all workspaces', async () => {
    const output = await runCLI([
      'check-all',
      '--workspaces'
    ], '/fixtures/monorepo');

    expect(output).toContain('Workspace Validation Summary');
  });

  it('errors when workspace not found', async () => {
    const { code, stderr } = await runCLI([
      'check-all',
      '--workspace',
      'app-1'
    ], '/fixtures/single-repo');

    expect(code).toBe(2);
    expect(stderr).toContain('No workspace detected');
  });
});
```

### Test Fixtures

Create fixture monorepos for testing:

```
tests/fixtures/
├── pnpm-monorepo/
│   ├── pnpm-workspace.yaml
│   ├── pnpm-lock.yaml
│   ├── package.json
│   └── packages/
│       ├── app-1/
│       └── app-2/
├── npm-monorepo/
│   ├── package.json         # with workspaces array
│   ├── package-lock.json
│   └── packages/
│       ├── app-1/
│       └── app-2/
├── yarn-monorepo/
│   ├── package.json         # with workspaces object
│   ├── yarn.lock
│   └── packages/
│       ├── app-1/
│       └── app-2/
└── malformed/
    ├── invalid-yaml/
    │   └── pnpm-workspace.yaml  # Malformed YAML
    └── invalid-json/
        └── package.json         # Malformed workspaces
```

## Performance Considerations

### Benchmarks

Expected performance for workspace detection:

| Operation | Time | Notes |
|-----------|------|-------|
| Detect pnpm workspace | <10ms | File read + YAML parse |
| Detect npm workspace | <5ms | File read + JSON parse |
| Expand 10 globs | <50ms | Disk I/O dominant |
| Expand 100 globs | <200ms | Parallel glob expansion |

### Optimizations

1. **Early returns**: Check for file existence before reading
2. **Parallel glob expansion**: Use `Promise.all()` for multiple patterns
3. **Cache results**: Cache workspace detection per CLI invocation
4. **Lazy detection**: Only detect when flags are used

## Future Enhancements

Possible additions (not in scope for this project):

1. **Workspace roots**: Auto-detect workspace root from package directory
2. **Package filtering**: `--workspace-pattern 'app-*'`
3. **Parallel validation**: Validate all workspaces in parallel
4. **Progress bar**: Show progress when validating many packages
5. **JSON output**: Machine-readable workspace info

## References

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [npm Workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces)
- [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/)
- [Turborepo](https://turbo.build/repo/docs) - Example of workspace-aware tooling
