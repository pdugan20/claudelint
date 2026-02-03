# Monorepo Support - Future Enhancements

Stack-ranked list of potential improvements beyond the core implementation.

## Stack Rank (High to Low Priority)

### Priority 1: Critical Gaps

| Enhancement | Difficulty | User Impact | Status | Notes |
|-------------|------------|-------------|--------|-------|
| CLI Integration Tests | Low | High | Missing | Should have been in Phase 3 |
| Parallel workspace validation | Low | High | Not started | Mentioned in future enhancements |
| Config caching with extends | Medium | High | Not started | Performance regression possible |

### Priority 2: High Value, Low Effort

| Enhancement | Difficulty | User Impact | Status | Notes |
|-------------|------------|-------------|--------|-------|
| Progress bar for --workspaces | Low | Medium | Not started | UX improvement for many packages |
| --workspace-pattern flag | Low-Medium | Medium | Not started | Convenience feature |
| Workspace root auto-detection | Medium | High | Not started | Run from any package directory |
| JSON workspace output | Low | Medium | Not started | Machine-readable format |

### Priority 3: High Value, Higher Effort

| Enhancement | Difficulty | User Impact | Status | Notes |
|-------------|------------|-------------|--------|-------|
| Preset configs (claudelint:recommended) | Medium | High | Not started | Shareable configs |
| Config validation before merge | Medium | High | Not started | Better error messages |
| Per-package config override UI | Medium | Medium | Not started | Show merged config per package |

### Priority 4: Nice to Have

| Enhancement | Difficulty | User Impact | Status | Notes |
|-------------|------------|-------------|--------|-------|
| Remote config URLs | Medium-High | Low | Not started | Security concerns |
| Glob patterns in extends | Low-Medium | Low | Not started | Edge case |
| Conditional extends | High | Low | Not started | Complex, rarely needed |
| Turborepo/Nx integration | High | Medium | Not started | Specialized use case |

---

## Detailed Breakdown

### Priority 1: Critical Gaps

#### 1.1 CLI Integration Tests

**Difficulty:** Low (2-3 hours)
**User Impact:** High (prevents regressions)
**Priority:** CRITICAL

Missing tests from Phase 3.1:

```typescript
describe('--workspace flag', () => {
  it('validates specific package', async () => {
    // Create fixture monorepo
    // Run: claudelint check-all --workspace app-1
    // Assert: only app-1 validated
  });

  it('errors when package not found', async () => {
    // Run: claudelint check-all --workspace nonexistent
    // Assert: helpful error with available packages
  });

  it('errors when no workspace detected', async () => {
    // Run in non-monorepo: claudelint check-all --workspace foo
    // Assert: clear error message
  });
});

describe('--workspaces flag', () => {
  it('validates all packages', async () => {
    // Create fixture with 3 packages
    // Run: claudelint check-all --workspaces
    // Assert: all 3 packages validated
  });

  it('aggregates exit codes', async () => {
    // One package has errors, others pass
    // Assert: exit code 1
  });

  it('shows workspace summary', async () => {
    // Assert output includes workspace summary
  });
});
```

**Why critical:** These are functional tests for the main feature. Without them, we could break workspace validation in future changes.

#### 1.2 Parallel Workspace Validation

**Difficulty:** Low (4-6 hours)
**User Impact:** High (performance for large monorepos)
**Priority:** HIGH

Currently `--workspaces` validates packages sequentially. For monorepos with 10+ packages, this is slow.

**Implementation:**

```typescript
// Current (sequential)
for (const packagePath of workspace.packages) {
  await validatePackage(packagePath);
}

// Proposed (parallel)
await Promise.all(
  workspace.packages.map(pkg => validatePackage(pkg))
);
```

**Benefits:**

- 5-10x faster for monorepos with many packages
- Better utilization of multi-core systems
- Aligns with how `check-all` already parallelizes validators

**Risks:**

- Output interleaving (needs buffering)
- Resource exhaustion (might need concurrency limit)

**Mitigation:**

- Buffer output per package, display after completion
- Add `--max-concurrency` flag (default: CPU cores)

#### 1.3 Config Caching with Extends

**Difficulty:** Medium (1 day)
**User Impact:** High (prevents performance regression)
**Priority:** HIGH

Currently, caching is disabled when using `--fix` to preserve autoFix functions. But with `extends`, we also need to invalidate cache when extended configs change.

**Problem:**

```bash
# User edits root config
vim .claudelintrc.json

# Package validation still uses cached results
cd packages/app-1
claudelint check-all  # BUG: Uses stale config
```

**Solution:**

Track config dependency chain in cache:

```typescript
interface CacheEntry {
  mtime: number;
  configDeps: string[];  // NEW: paths to all extended configs
  results: ValidationResult[];
}

// Invalidate if any config in chain changed
function isCacheValid(entry: CacheEntry): boolean {
  return entry.configDeps.every(path =>
    statSync(path).mtime <= entry.mtime
  );
}
```

**Benefits:**

- Maintains cache speedup (~2.4x) even with extends
- Automatically invalidates when any config in chain changes
- No user intervention needed

---

### Priority 2: High Value, Low Effort

#### 2.1 Progress Bar for --workspaces

**Difficulty:** Low (2-3 hours)
**User Impact:** Medium (UX improvement)
**Priority:** MEDIUM-HIGH

Show progress when validating many packages:

```bash
claudelint check-all --workspaces

Validating workspace packages... [=========>        ] 6/10 (app-2)
```

**Implementation:**

- Use existing progress indicator infrastructure
- Show: current/total packages, current package name
- Hide in CI (same logic as existing progress bars)

**Libraries:**

- Already using `ora` for spinners
- Could use `cli-progress` or `listr2` for multi-line progress

#### 2.2 --workspace-pattern Flag

**Difficulty:** Low-Medium (4-6 hours)
**User Impact:** Medium (convenience)
**Priority:** MEDIUM

Validate multiple packages matching a pattern:

```bash
# Validate all app packages
claudelint check-all --workspace-pattern 'app-*'

# Validate all packages in libs/
claudelint check-all --workspace-pattern 'libs/*'
```

**Implementation:**

```typescript
if (options.workspacePattern) {
  const workspace = await detectWorkspace(cwd);
  const matching = workspace.packages.filter(pkg =>
    minimatch(basename(pkg), options.workspacePattern)
  );

  if (matching.length === 0) {
    logger.error(`No packages match pattern: ${options.workspacePattern}`);
    process.exit(2);
  }

  // Validate matching packages
}
```

**Use cases:**

- CI: validate only apps (not libs)
- Development: validate related packages
- Selective validation after changes

#### 2.3 Workspace Root Auto-Detection

**Difficulty:** Medium (6-8 hours)
**User Impact:** High (major UX improvement)
**Priority:** MEDIUM-HIGH

Currently must run from workspace root. Allow running from any package:

```bash
# Current: must cd to root
cd /path/to/monorepo
claudelint check-all --workspaces

# Proposed: works from anywhere
cd /path/to/monorepo/packages/app-1
claudelint check-all --workspaces  # Auto-finds root
```

**Implementation:**

```typescript
async function findWorkspaceRoot(cwd: string): Promise<string | null> {
  let current = cwd;

  while (current !== dirname(current)) {
    // Check for workspace config
    if (existsSync(join(current, 'pnpm-workspace.yaml')) ||
        hasWorkspacesField(join(current, 'package.json'))) {
      return current;
    }

    current = dirname(current);
  }

  return null;
}
```

**Benefits:**

- Better DX (works from any directory)
- Matches ESLint/Prettier behavior
- No need to remember workspace root location

#### 2.4 JSON Workspace Output

**Difficulty:** Low (2-3 hours)
**User Impact:** Medium (machine-readable)
**Priority:** MEDIUM

Add `--format json` support for workspace commands:

```bash
claudelint check-all --workspaces --format json

{
  "workspace": {
    "root": "/path/to/monorepo",
    "packageManager": "pnpm",
    "packages": 10
  },
  "results": [
    {
      "package": "app-1",
      "path": "/path/to/monorepo/packages/app-1",
      "errors": 0,
      "warnings": 2,
      "issues": [...]
    }
  ]
}
```

**Use cases:**

- CI integrations
- IDE plugins
- Custom reporting tools

---

### Priority 3: High Value, Higher Effort

#### 3.1 Preset Configs

**Difficulty:** Medium (1-2 days)
**User Impact:** High (ease of use)
**Priority:** MEDIUM

Support built-in presets:

```json
{
  "extends": "claudelint:recommended"
}
```

**Presets to ship:**

- `claudelint:recommended` - Balanced rules for most projects
- `claudelint:strict` - All rules as errors
- `claudelint:minimal` - Only critical rules

**Implementation:**

```typescript
const PRESETS = {
  'claudelint:recommended': {
    rules: {
      'claude-md-size-error': 'error',
      'skill-missing-version': 'error',
      // ... sensible defaults
    }
  },
  'claudelint:strict': {
    // All rules = 'error'
  }
};

function resolveConfigPath(extendsValue: string, fromDir: string): string {
  // Check for preset
  if (extendsValue.startsWith('claudelint:')) {
    const preset = PRESETS[extendsValue];
    if (!preset) {
      throw new ConfigError(`Unknown preset: ${extendsValue}`);
    }
    return preset;  // Return inline config
  }

  // ... existing relative/node_modules resolution
}
```

**Benefits:**

- Quick setup for new users
- Consistent defaults across projects
- Easier onboarding

#### 3.2 Config Validation Before Merge

**Difficulty:** Medium (1 day)
**User Impact:** High (better DX)
**Priority:** MEDIUM

Validate extended configs upfront with clear errors:

```bash
# Current
claudelint check-all
# Error: Unknown rule 'typo-in-rule-name'
# (no indication which config file has the typo)

# Proposed
claudelint check-all
# Error in extended config ../../.claudelintrc.json:
#   Unknown rule 'typo-in-rule-name' at line 5
#
#   Did you mean 'claude-md-size-error'?
```

**Implementation:**

```typescript
function loadConfigWithExtends(configPath: string): ClaudeLintConfig {
  const config = loadConfig(configPath);

  // Validate THIS config before loading extends
  const errors = validateConfig(config);
  if (errors.length > 0) {
    throw new ConfigError(
      `Invalid config in ${configPath}:\n` +
      errors.map(e => `  - ${e.message}`).join('\n')
    );
  }

  // ... continue with extends
}
```

**Benefits:**

- Fail fast with clear errors
- Indicates which file in chain has issue
- Suggests fixes (typo detection)

#### 3.3 Per-Package Config Override UI

**Difficulty:** Medium (1-2 days)
**User Impact:** Medium (debugging aid)
**Priority:** LOW-MEDIUM

Show merged config for a specific package:

```bash
claudelint print-config --workspace app-1

# Merged configuration for packages/app-1:
#
# Rules (3 from root, 1 override):
#   claude-md-size-error: "error" (from ../../.claudelintrc.json)
#   skill-missing-version: "error" (from ../../.claudelintrc.json)
#   skill-missing-changelog: "warn" (from ../../.claudelintrc.json)
#   claude-md-size-warning: "error" (overridden in ./.claudelintrc.json)
```

**Benefits:**

- Debug config inheritance issues
- Understand what rules are active
- See where each setting comes from

---

### Priority 4: Nice to Have

#### 4.1 Remote Config URLs

**Difficulty:** Medium-High (2-3 days)
**User Impact:** Low (edge case)
**Priority:** LOW

**Security concerns:**

- MITM attacks
- Untrusted code execution
- Cache poisoning

**Not recommended** - use npm packages instead.

#### 4.2 Glob Patterns in Extends

**Difficulty:** Low-Medium (4-6 hours)
**User Impact:** Low (edge case)
**Priority:** LOW

```json
{
  "extends": ["./configs/*.json"]
}
```

**Use case:** Very large monorepos with many shared configs. Rare.

#### 4.3 Conditional Extends

**Difficulty:** High (3-5 days)
**User Impact:** Low (edge case)
**Priority:** LOW

```json
{
  "extends": {
    "production": "./strict.json",
    "development": "./relaxed.json"
  }
}
```

**Complexity:** Environment detection, cache invalidation, documentation burden.

**Recommendation:** Use overrides instead (already supported).

#### 4.4 Turborepo/Nx Integration

**Difficulty:** High (1-2 weeks)
**User Impact:** Medium (specialized users)
**Priority:** LOW

Integrate with task runners:

```bash
# Turborepo
turbo run lint --filter=[origin/main]

# Nx
nx affected --target=lint
```

**Challenges:**

- Learn their APIs
- Maintain compatibility
- Document integration
- Limited user base

**Recommendation:** Defer until user demand is clear.

---

## Recommended Next Steps

### Immediate (Should Do Now)

1. **Add CLI integration tests** (2-3 hours)
   - Critical gap in test coverage
   - Prevents regressions
   - Required for production readiness

2. **Add config caching with extends** (1 day)
   - Prevents performance regression
   - Maintains cache benefits
   - Automatic invalidation

### Short Term (Next Sprint)

1. **Parallel workspace validation** (4-6 hours)
   - High user impact for large monorepos
   - Low implementation risk
   - Natural performance win

2. **Progress bar for --workspaces** (2-3 hours)
   - Better UX for slow operations
   - Low effort, medium impact

3. **Workspace root auto-detection** (6-8 hours)
   - Major UX improvement
   - Matches user expectations from other tools

### Medium Term (Gather Feedback First)

1. **Preset configs** (1-2 days)
   - Wait for user feedback on current features
   - Ship after core is stable

2. **--workspace-pattern flag** (4-6 hours)
   - Convenience feature
   - Not critical for MVP

### Long Term (If Requested)

1. **Config validation improvements**
2. **Per-package config UI**
3. **Turborepo/Nx integration** (only if users ask)

---

## Success Metrics

Track these to prioritize future work:

- **Adoption rate** - How many users enable workspace features?
- **Monorepo size** - How many packages in typical user repos?
- **Performance** - Does config loading slow down?
- **Error reports** - What config issues do users hit?

---

## Not Recommended

These are out of scope and likely won't be implemented:

- Remote config URLs (security risk)
- Conditional extends (complexity vs value)
- Custom config resolvers (too flexible)
- Config inheritance from parent directories (conflicts with extends)
