# Logging Architecture: Implementation Tracker (v2)

**Last Updated**: 2026-02-03

**Approach**: Architecture-First with DiagnosticCollector Pattern

**Status**: Planning Complete, Ready for Implementation

## Overview

**Problem**: Library code calls console directly in 10 places, no unified diagnostic system

**Solution**: Implement DiagnosticCollector pattern (ESLint/TypeScript approach) consistently across entire codebase

**Key Insight**: This is a **system architecture problem**, not individual file refactoring

**See**: [architecture-analysis.md](./architecture-analysis.md) for complete analysis

---

## Phase 1: Foundation - DiagnosticCollector Core COMPLETE

**Goal**: Create the central diagnostic collection system

**Duration**: 30 minutes

**Status**: Complete (All Tasks 1.1-1.3 Complete)

### Task 1.1: Create DiagnosticCollector class (15 min) COMPLETE

**Create**: `src/utils/diagnostics/collector.ts`

**Interface**:

```typescript
export interface Diagnostic {
  message: string;
  source: string;        // 'ConfigResolver', 'WorkspaceDetector', etc.
  severity: 'info' | 'warning' | 'error';
  code?: string;         // 'CONFIG_001', 'CACHE_001', etc.
  context?: Record<string, unknown>;
}

export class DiagnosticCollector {
  private diagnostics: Diagnostic[] = [];

  // Add methods
  add(diagnostic: Diagnostic): void
  warn(message: string, source: string, code?: string): void
  error(message: string, source: string, code?: string): void
  info(message: string, source: string, code?: string): void

  // Query methods
  getAll(): Diagnostic[]
  getWarnings(): Diagnostic[]
  getErrors(): Diagnostic[]

  // Utility methods
  clear(): void
  hasWarnings(): boolean
  hasErrors(): boolean
}
```

**Testing**: Unit tests for DiagnosticCollector

**Acceptance Criteria**:

- [x] DiagnosticCollector class created
- [x] All methods implemented
- [x] Unit tests pass (33 tests passing)
- [x] TypeScript compiles

---

### Task 1.2: Create index export (5 min) COMPLETE

**Create**: `src/utils/diagnostics/index.ts`

```typescript
export { DiagnosticCollector, Diagnostic, DiagnosticSeverity } from './collector';
```

**Acceptance Criteria**:

- [x] Index export created
- [x] Can import from 'src/utils/diagnostics'

---

### Task 1.3: Integrate into FileValidator (10 min) COMPLETE

**File**: `src/validators/file-validator.ts`

**Changes**:

```typescript
import { DiagnosticCollector } from '../utils/diagnostics';

export abstract class FileValidator {
  protected diagnostics = new DiagnosticCollector();

  protected getResult(): ValidationResult {
    // Collect diagnostic warnings
    const diagnosticWarnings = this.diagnostics.getWarnings().map(d => ({
      message: `[${d.source}] ${d.message}`,
      severity: 'warning' as const,
      // Include code if available
      ...(d.code && { ruleId: d.code as RuleId })
    }));

    return {
      valid: errors.length === 0,
      errors,
      warnings: [...warnings, ...diagnosticWarnings],
      deprecatedRulesUsed,
    };
  }
}
```

**Testing**: Verify FileValidator tests still pass

**Acceptance Criteria**:

- [x] DiagnosticCollector added to FileValidator
- [x] getResult() collects diagnostics as warnings and errors
- [x] All FileValidator tests pass (855 tests passing)
- [x] No console output in tests
- [x] TypeScript compiles successfully

---

## Phase 2: Integration - Thread Through Components

**Goal**: Update all components to use DiagnosticCollector

**Duration**: 2 hours

**Status**: In Progress (Phase 1 Complete)

**Dependencies**: Phase 1 complete

### Task 2.1: Refactor ConfigResolver (20 min) COMPLETE

**File**: `src/utils/config/resolver.ts`

**Changes**:

```typescript
import { DiagnosticCollector } from '../diagnostics';

export class ConfigResolver {
  constructor(
    private config: ClaudeLintConfig,
    private diagnostics?: DiagnosticCollector
  ) {}

  // Remove: private warnings: string[] = [];
  // Remove: getWarnings() method

  private normalizeRuleConfig(...) {
    if (rule?.schema) {
      try {
        rule.schema.parse(options);
      } catch (error) {
        // NEW: Use diagnostics collector
        this.diagnostics?.warn(
          `Invalid options for rule '${ruleId}': ${error instanceof Error ? error.message : String(error)}. Rule will be disabled.`,
          'ConfigResolver',
          'CONFIG_INVALID_OPTIONS'
        );
        return null;
      }
    }
  }
}
```

**Update Callers**:

```typescript
// src/validators/file-validator.ts
if (options.config) {
  this.configResolver = new ConfigResolver(
    options.config,
    this.diagnostics  // Pass collector
  );
}
```

**Testing**:

- Update tests to check diagnostics.getWarnings()
- Remove console.warn mocking
- Verify rule disabled on invalid options

**Acceptance Criteria**:

- [x] ConfigResolver accepts diagnostics parameter
- [x] console.warn removed (replaced with diagnostics?.warn())
- [x] Warnings collected via diagnostics with source='ConfigResolver' and code='CONFIG_INVALID_OPTIONS'
- [x] Tests updated and passing (28 tests passing)
- [x] No console output in tests
- [x] FileValidator updated to pass diagnostics to ConfigResolver

---

### Task 2.2: Refactor WorkspaceDetector (30 min) COMPLETE

**File**: `src/utils/workspace/detector.ts`

**Changes**:

```typescript
import { DiagnosticCollector } from '../diagnostics';

// Update function signature
export async function detectWorkspace(
  startDir: string,
  diagnostics?: DiagnosticCollector
): Promise<WorkspaceInfo | null> {
  // 4 console.warn calls to replace
}

// Update private functions
async function detectPnpmWorkspace(
  cwd: string,
  diagnostics?: DiagnosticCollector
): Promise<WorkspaceInfo | null> {
  if (!config.packages || !Array.isArray(config.packages)) {
    diagnostics?.warn(
      'pnpm-workspace.yaml must have a "packages" array',
      'WorkspaceDetector',
      'WORKSPACE_INVALID_YAML'
    );
    return null;
  }

  // On parse error
  diagnostics?.warn(
    `Failed to parse pnpm-workspace.yaml: ${error.message}`,
    'WorkspaceDetector',
    'WORKSPACE_PARSE_ERROR'
  );
}

async function detectNpmWorkspace(
  cwd: string,
  diagnostics?: DiagnosticCollector
): Promise<WorkspaceInfo | null> {
  if (invalid format) {
    diagnostics?.warn(
      'package.json workspaces must be an array or { packages: [...] }',
      'WorkspaceDetector',
      'WORKSPACE_INVALID_FORMAT'
    );
    return null;
  }

  // On parse error
  diagnostics?.warn(
    `Failed to parse package.json workspaces: ${error.message}`,
    'WorkspaceDetector',
    'WORKSPACE_PARSE_ERROR'
  );
}
```

**Update Callers**:

```typescript
// All places that call detectWorkspace
const workspace = await detectWorkspace(dir, this.diagnostics);
```

**Find callers**:

```bash
grep -rn "detectWorkspace" src/ --include="*.ts"
```

**Testing**:

- Test invalid pnpm-workspace.yaml
- Test invalid package.json workspaces
- Test parse errors
- Verify warnings in diagnostics

**Acceptance Criteria**:

- [x] All 4 console.warn calls removed
- [x] detectWorkspace accepts diagnostics parameter (optional)
- [x] Private functions (detectPnpmWorkspace, detectNpmWorkspace) accept diagnostics
- [x] Warnings use diagnostic codes: WORKSPACE_INVALID_YAML, WORKSPACE_PARSE_ERROR, WORKSPACE_INVALID_FORMAT
- [x] All callers reviewed (CLI code doesn't need to pass diagnostics)
- [x] Tests passing (855 tests)
- [x] No console output in library code
- [x] TypeScript compiles successfully

---

### Task 2.3: Refactor CacheManager (20 min)

**File**: `src/utils/cache.ts`

**Changes**:

```typescript
import { DiagnosticCollector } from './diagnostics';

export class CacheManager {
  constructor(
    private cacheDir: string,
    private diagnostics?: DiagnosticCollector
  ) {}

  private async saveCacheIndex() {
    try {
      // ...
    } catch (error) {
      // Optional diagnostic - cache is truly optional
      this.diagnostics?.warn(
        `Failed to save cache index: ${error.message}`,
        'CacheManager',
        'CACHE_SAVE_FAILED'
      );
    }
  }

  async cacheResult(...) {
    try {
      // ...
    } catch (error) {
      this.diagnostics?.warn(
        `Failed to cache result: ${error.message}`,
        'CacheManager',
        'CACHE_WRITE_FAILED'
      );
    }
  }

  async clearCache() {
    try {
      // ...
    } catch (error) {
      // This one is an error, not warning (operation failed)
      this.diagnostics?.error(
        `Failed to clear cache: ${error.message}`,
        'CacheManager',
        'CACHE_CLEAR_FAILED'
      );
      throw error; // Still throw
    }
  }
}
```

**Update Callers**:

```typescript
// Find all CacheManager instantiations
grep -rn "new CacheManager" src/ --include="*.ts"

// Update to pass diagnostics
this.cache = new CacheManager(cacheDir, this.diagnostics);
```

**Testing**:

- Mock cache write failures
- Mock cache clear failures
- Verify diagnostics collected
- Verify no console output

**Acceptance Criteria**:

- [ ] All 3 console calls removed
- [ ] CacheManager accepts diagnostics parameter
- [ ] All callers updated
- [ ] Tests updated and passing
- [ ] No console output in tests

---

### Task 2.4: Refactor ClaudeLint validator error handling (30 min)

**File**: `src/api/claudelint.ts`

**Context**: Lines 699 and 801 - validator exceptions during validation

**Current Code**:

```typescript
try {
  return await validator.validate();
} catch (error) {
  console.error(`Validator failed for ${filePath}:`, error);
  return { valid: true, errors: [], warnings: [] };
}
```

**Problem**: Validator failures are swallowed and validation continues

**Better Approach**: Include validator failure as an error in ValidationResult

**Changes**:

```typescript
// Line 699 (validateFiles method)
try {
  return await validator.validate();
} catch (error) {
  // Return validator failure as error in result
  return {
    valid: false,
    errors: [{
      message: `Validator failed: ${error instanceof Error ? error.message : String(error)}`,
      file: filePath,
      severity: 'error',
    }],
    warnings: [],
  };
}

// Line 801 (validateFile method) - same change
```

**Rationale**: Validator failures ARE validation errors, not silent warnings. Users should know validation failed.

**Testing**:

- Mock validator throwing error
- Verify error in ValidationResult
- Verify validation continues for other files

**Acceptance Criteria**:

- [ ] Both console.error calls removed
- [ ] Validator failures return as errors in ValidationResult
- [ ] Validation continues for other files
- [ ] Tests updated and passing
- [ ] No console output in tests

---

### Task 2.5: Update all validator instantiations (20 min)

**Goal**: Ensure ConfigResolver/CacheManager get diagnostics from validators

**Files to check**:

- All validators in `src/validators/*.ts`
- Any place that creates ConfigResolver or CacheManager

**Search**:

```bash
grep -rn "new ConfigResolver" src/ --include="*.ts"
grep -rn "new CacheManager" src/ --include="*.ts"
```

**Pattern**:

```typescript
// BEFORE
this.configResolver = new ConfigResolver(options.config);

// AFTER
this.configResolver = new ConfigResolver(options.config, this.diagnostics);
```

**Acceptance Criteria**:

- [ ] All ConfigResolver instantiations pass diagnostics
- [ ] All CacheManager instantiations pass diagnostics
- [ ] All validators compile
- [ ] Full test suite passes

---

## Phase 3: Testing & Verification

**Goal**: Ensure all diagnostics are collected and no console output

**Duration**: 1 hour

**Status**: Ready to Start (after Phase 2)

**Dependencies**: Phase 2 complete

### Task 3.1: Update existing tests (30 min)

**Scope**: ~10 tests that check console output

**Strategy**:

1. Remove console.warn/error mocking
2. Check diagnostics instead
3. Verify warnings in ValidationResult.warnings

**Example**:

```typescript
// BEFORE
const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
await validator.validate();
expect(warnSpy).toHaveBeenCalled();
warnSpy.mockRestore();

// AFTER
const result = await validator.validate();
expect(result.warnings).toContainEqual(
  expect.objectContaining({ message: expect.stringContaining('Invalid options') })
);
```

**Files to check**:

- `tests/utils/config-resolver.test.ts` - Already partially updated
- `tests/utils/workspace/*.test.ts` - If exists
- `tests/validators/*.test.ts` - Integration tests

**Acceptance Criteria**:

- [ ] All tests updated to check diagnostics
- [ ] No console mocking (except for negative tests)
- [ ] All tests pass
- [ ] Test coverage maintained

---

### Task 3.2: Add diagnostic integration tests (20 min)

**Create**: `tests/utils/diagnostics/collector.test.ts`

**Test Cases**:

```typescript
describe('DiagnosticCollector', () => {
  it('should collect warnings', () => {
    const collector = new DiagnosticCollector();
    collector.warn('Test warning', 'TestSource', 'TEST_001');

    const warnings = collector.getWarnings();
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatchObject({
      message: 'Test warning',
      source: 'TestSource',
      severity: 'warning',
      code: 'TEST_001'
    });
  });

  it('should filter by severity', () => {
    const collector = new DiagnosticCollector();
    collector.warn('Warning', 'Source');
    collector.error('Error', 'Source');
    collector.info('Info', 'Source');

    expect(collector.getWarnings()).toHaveLength(1);
    expect(collector.getErrors()).toHaveLength(1);
    expect(collector.getAll()).toHaveLength(3);
  });

  it('should clear diagnostics', () => {
    const collector = new DiagnosticCollector();
    collector.warn('Test', 'Source');
    collector.clear();

    expect(collector.getAll()).toHaveLength(0);
  });
});
```

**Create**: `tests/validators/diagnostic-propagation.test.ts`

**Test Cases**:

```typescript
describe('Diagnostic Propagation', () => {
  it('should propagate config warnings to ValidationResult', async () => {
    // Setup config with invalid rule options
    // Run validation
    // Check result.warnings includes config warning
  });

  it('should propagate workspace warnings', async () => {
    // Setup invalid workspace config
    // Run validation
    // Check result.warnings includes workspace warning
  });

  it('should not output to console during validation', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Run validation with warning scenarios

    expect(consoleSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
```

**Acceptance Criteria**:

- [ ] DiagnosticCollector unit tests pass
- [ ] Integration tests verify propagation
- [ ] No console output test passes
- [ ] All tests green

---

### Task 3.3: Run full test suite (10 min)

**Commands**:

```bash
# Run all tests
npm test

# Check for console output
npm test 2>&1 | grep "console\."

# Run specific suites
npm test tests/validators
npm test tests/utils
```

**Acceptance Criteria**:

- [ ] All tests pass (822+ tests)
- [ ] No console output during tests (except reporters)
- [ ] No test failures
- [ ] Coverage maintained

---

## Phase 4: Enforcement & Documentation

**Goal**: Prevent future console usage, document the system

**Duration**: 1 hour

**Status**: Ready to Start (after Phase 3)

**Dependencies**: Phase 3 complete

### Task 4.1: Extend logger-usage.sh enforcement (15 min)

**File**: `scripts/check/logger-usage.sh`

**Changes**:

```bash
#!/bin/bash
set -e

ERRORS=0

echo "Checking for direct console usage..."

# Allowed files (logger implementations and output layers)
ALLOWED_FILES=(
  "src/cli/utils/logger.ts"
  "src/utils/reporting/reporting.ts"
  "src/utils/reporting/progress.ts"
  "scripts/util/logger.ts"
)

# Build grep exclude pattern
EXCLUDE_ARGS=""
for file in "${ALLOWED_FILES[@]}"; do
  EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude=${file##*/}"
done

# Check ALL of src/ (not just scripts/)
if grep -rn "console\." src/ --include="*.ts" $EXCLUDE_ARGS 2>/dev/null; then
  echo ""
  echo "ERROR: Found console usage in src/"
  echo "Library code must not use console directly"
  echo ""
  echo "Use DiagnosticCollector instead:"
  echo "  diagnostics?.warn('message', 'Source', 'CODE');"
  ERRORS=$((ERRORS + 1))
fi

# Check scripts/ directory
if grep -rn "console\." scripts/ --include="*.ts" --exclude="logger.ts" 2>/dev/null; then
  echo ""
  echo "ERROR: Found console usage in scripts/"
  echo "Import and use logger from scripts/util/logger.ts instead"
  ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -eq 0 ]; then
  echo "No direct console usage found"
  exit 0
else
  echo ""
  echo "Found $ERRORS violation(s)"
  echo ""
  echo "Allowed console usage:"
  echo "  - src/cli/utils/logger.ts (CLI logger implementation)"
  echo "  - src/utils/reporting/*.ts (output formatting layer)"
  echo "  - scripts/util/logger.ts (script logger implementation)"
  echo ""
  echo "For library code:"
  echo "  - Use DiagnosticCollector to collect warnings/errors"
  echo "  - Pass diagnostics?: DiagnosticCollector to functions/constructors"
  echo "  - Call diagnostics?.warn('message', 'Source', 'CODE')"
  exit 1
fi
```

**Testing**:

- Run script on clean codebase (should pass)
- Add test console.log to library code (should fail)
- Verify error messages are clear

**Acceptance Criteria**:

- [ ] Script checks all of src/ directory
- [ ] Allowlist for legitimate files
- [ ] Clear error messages with examples
- [ ] Script passes on clean codebase

---

### Task 4.2: Fix verification scripts spacing (15 min)

**Files**:

- `scripts/verify/tool-names.ts`
- `scripts/verify/model-names.ts`

**Changes**: Remove manual `\n` and spacing

**Pattern**:

```typescript
// BEFORE
log.info('Querying...\n');
log.info('\nManual fallback:');
log.dim('   Install from...');
log.info('  1. Do thing');

// AFTER
log.info('Querying...');
log.blank();
log.blank();
log.info('Manual fallback:');
log.dim('Install from...');  // Remove leading spaces
log.dim('1. Do thing');      // Use dim for indented items
```

**Testing**:

- Run verification scripts
- Check output formatting looks good
- Run `scripts/check/logger-spacing.sh` (should pass)

**Acceptance Criteria**:

- [ ] No manual \n in verification scripts
- [ ] No hardcoded spacing
- [ ] Output looks clean
- [ ] logger-spacing.sh passes

---

### Task 4.3: Extend logger-spacing.sh for scripts/ (15 min)

**File**: `scripts/check/logger-spacing.sh`

**Changes**: Add patterns to check scripts/ directory

```bash
# After CLI logger checks, add:

# Check script logger (scripts/) for log.* patterns
if grep -rn 'log\.\(info\|error\|success\|warn\|dim\|bold\).*\\n' scripts/ --include="*.ts" --exclude=logger.ts 2>/dev/null; then
  echo "ERROR: Found log calls with manual \\n newlines in scripts/"
  echo "Use log.blank() instead of \\n"
  ERRORS=$((ERRORS + 1))
fi

if grep -rn "log\.\(info\|error\|success\|warn\|dim\|bold\)(['\"]  " scripts/ --include="*.ts" --exclude=logger.ts 2>/dev/null; then
  echo "ERROR: Found log calls with hardcoded 2+ spaces in scripts/"
  echo "Use log.dim() for indented output"
  ERRORS=$((ERRORS + 1))
fi
```

**Testing**:

- Run on verification scripts (should pass after Task 4.2)
- Add test violation (should fail)

**Acceptance Criteria**:

- [ ] Script checks scripts/ directory
- [ ] Detects manual \n in log calls
- [ ] Detects hardcoded spacing
- [ ] Script passes after Task 4.2

---

### Task 4.4: Document DiagnosticCollector system (15 min)

**Create**: `docs/architecture/diagnostic-system.md`

**Content**: Create markdown file with sections for:

- Overview: Explain DiagnosticCollector system
- Architecture: Document the diagnostic flow
- Usage: Show examples in library code and classes
- Diagnostic Codes: List all codes and their meanings
- Testing: Explain how to test diagnostics

**Acceptance Criteria**:

- [ ] Documentation created
- [ ] Usage examples provided
- [ ] Architecture explained
- [ ] Clear for contributors

---

### Task 4.5: Update CONTRIBUTING.md (15 min)

**File**: `CONTRIBUTING.md`

**Add Section** (after "Code Style Guidelines"):

### Diagnostic Collection Guidelines

IMPORTANT: Library code MUST NOT use console directly

See [docs/architecture/diagnostic-system.md](docs/architecture/diagnostic-system.md) for full details.

**Use DiagnosticCollector instead**:

```typescript
// In functions
function myFunction(
  param: string,
  diagnostics?: DiagnosticCollector
): Result {
  if (invalid) {
    diagnostics?.warn('Invalid param', 'MyFunction', 'MY_001');
  }
}

// In classes
class MyClass {
  constructor(private diagnostics?: DiagnosticCollector) {}

  myMethod() {
    this.diagnostics?.error('Failed', 'MyClass', 'MY_002');
  }
}
```

**Why**:

- Makes library testable (no console spam)
- Allows programmatic usage (consumers control output)
- Structured diagnostics with source tracking
- Follows industry standards (ESLint, TypeScript, Webpack)

**Enforcement**: Pre-commit hooks check for console usage with `scripts/check/logger-usage.sh`

**Acceptance Criteria**:

- [ ] CONTRIBUTING.md updated
- [ ] Links to diagnostic-system.md
- [ ] Code examples provided
- [ ] Enforcement noted

---

## Phase 5: Final Verification & Commit

**Goal**: Verify everything works, commit changes

**Duration**: 30 minutes

**Status**: Ready to Start (after Phase 4)

**Dependencies**: All previous phases complete

### Task 5.1: Final verification checklist (15 min)

**Run All Checks**:

```bash
# 1. Enforcement checks
npm run check:logger-spacing
npm run check:logger-usage

# 2. Full test suite
npm test

# 3. All pre-commit checks
npm run check:all

# 4. Verify no console usage in library
grep -r "console\." src/ --include="*.ts" | \
  grep -v "cli/utils/logger.ts" | \
  grep -v "utils/reporting" | \
  grep -v "^ *\*"
# Should only show JSDoc comments

# 5. Test library usage
cat > test-lib.ts << 'EOF'
import { ClaudeLint } from './src/api/claudelint';

async function test() {
  const linter = new ClaudeLint();
  const results = await linter.validateFiles(['.claudelintrc.json']);
  console.log(`Warnings: ${results[0].warnings.length}`);
  console.log(`Errors: ${results[0].errors.length}`);
}
test();
EOF

npx ts-node test-lib.ts
# Should see NO console output from library, only our console.log

rm test-lib.ts
```

**Acceptance Criteria**:

- [ ] All enforcement checks pass
- [ ] All tests pass (822+ tests)
- [ ] No console usage in library (except allowed)
- [ ] Library usage produces no console output
- [ ] Pre-commit checks pass

---

### Task 5.2: Update changelog and commit (15 min)

**Review Changes**:

```bash
git status
git diff --stat
```

**Expected Files Changed**:

- Created: src/utils/diagnostics/collector.ts
- Created: src/utils/diagnostics/index.ts
- Created: tests/utils/diagnostics/collector.test.ts
- Created: tests/validators/diagnostic-propagation.test.ts
- Created: docs/architecture/diagnostic-system.md
- Modified: src/validators/file-validator.ts
- Modified: src/utils/config/resolver.ts
- Modified: src/utils/workspace/detector.ts
- Modified: src/utils/cache.ts
- Modified: src/api/claudelint.ts
- Modified: scripts/check/logger-usage.sh
- Modified: scripts/check/logger-spacing.sh
- Modified: scripts/verify/tool-names.ts
- Modified: scripts/verify/model-names.ts
- Modified: tests/utils/config-resolver.test.ts
- Modified: CONTRIBUTING.md

**Commit Message**:

```text
refactor: implement DiagnosticCollector for unified diagnostic system

BREAKING CHANGE: Library code no longer prints to console. All warnings
are collected via DiagnosticCollector and returned in ValidationResult.warnings.
CLI behavior is unchanged.

This implements a unified diagnostic collection system inspired by ESLint,
TypeScript compiler, and Webpack. All library code now uses DiagnosticCollector
instead of console.warn/error for non-fatal diagnostics.

Changes:
- Create DiagnosticCollector class for centralized diagnostic collection
- Thread diagnostics through validation pipeline (FileValidator → components)
- Refactor 10 console calls across 4 files to use DiagnosticCollector
- Update ConfigResolver to collect warnings via diagnostics
- Update WorkspaceDetector to collect warnings via diagnostics
- Update CacheManager to collect warnings via diagnostics
- Update ClaudeLint validator error handling (return errors, not console)
- Extend enforcement to check all of src/ directory (not just scripts/)
- Fix verification scripts to follow logger spacing rules
- Add comprehensive tests for diagnostic collection and propagation
- Document diagnostic system in architecture docs

Architecture:
- DiagnosticCollector: Central collection with source tracking and codes
- Optional parameter pattern: diagnostics?: DiagnosticCollector
- Consistent usage: diagnostics?.warn('msg', 'Source', 'CODE')
- Automatic propagation: FileValidator.getResult() includes diagnostics

Files affected:
- src/utils/diagnostics/ (new)
- src/validators/file-validator.ts
- src/utils/config/resolver.ts
- src/utils/workspace/detector.ts
- src/utils/cache.ts
- src/api/claudelint.ts
- scripts/check/ (enforcement extended)
- scripts/verify/ (spacing fixes)

Benefits:
- Zero console usage in library code (testable, controllable)
- Structured diagnostics with source tracking and codes
- Consistent pattern across entire codebase
- Industry-standard approach (ESLint/TypeScript/Webpack)
- Future-extensible for filtering, reporting, and more

Closes Phase 1-5 of Logging Architecture project
```

**Acceptance Criteria**:

- [ ] Commit message follows conventional commits
- [ ] BREAKING CHANGE noted and explained
- [ ] All changes documented
- [ ] Clear architectural rationale

---

## Summary

### Total Effort: ~5 hours

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Foundation | 30 min | Ready |
| Phase 2: Integration | 2 hours | Ready |
| Phase 3: Testing | 1 hour | Ready |
| Phase 4: Enforcement & Docs | 1 hour | Ready |
| Phase 5: Verification | 30 min | Ready |

### Key Metrics

- **Architecture**: 1 new system (DiagnosticCollector)
- **Files to create**: 4 files
- **Files to modify**: 12 files
- **Console calls to remove**: 10 calls
- **Tests to update**: ~10 tests
- **Tests to add**: 2 test files

### Success Criteria

- Zero console usage in library code
- Unified diagnostic collection system
- All diagnostics returned in ValidationResult
- Consistent pattern across codebase
- All tests pass with no console output
- Pre-commit enforcement extended
- Complete documentation

### Breaking Changes

**For Library Consumers Only** (not CLI users):

Library code no longer prints warnings/errors directly. All diagnostics are collected and returned in `ValidationResult.warnings`. CLI output is unchanged - warnings still print via the reporting layer.

### Architecture Benefits

**Present**:

- Clean, testable library code
- Consistent diagnostic handling
- Source tracking for debugging
- Structured diagnostic data

**Future**:

- Diagnostic filtering by code
- Pretty diagnostic reporting
- Performance tracking
- Deprecation warnings
- Custom diagnostic handlers

---

## Comparison: v1 vs v2 Tracker

### v1 Tracker (Abandoned - Ad-Hoc Approach)

**Structure**: Task-oriented per file

- Task 2.1: Fix schema.ts (return warnings in result)
- Task 2.2: Fix resolver.ts (class state with getter)
- Task 2.3: Fix workspace.ts (add to return type)
- Task 2.4: Fix cache.ts (silent failures)
- Task 2.5: Fix claudelint.ts (unknown)

**Problem**: Each file has different approach, no consistency, unmaintainable

### v2 Tracker (Current - Architecture-First)

**Structure**: System-oriented with phases

- Phase 1: Create unified diagnostic system
- Phase 2: Apply consistently across all files
- Phase 3: Test thoroughly
- Phase 4: Enforce and document
- Phase 5: Verify and commit

**Benefit**: One pattern everywhere, maintainable, extensible, industry-standard

---

## Next Steps

1. **Review this tracker** - Ensure approach makes sense
2. **Start Phase 1** - Build the foundation (DiagnosticCollector)
3. **Proceed sequentially** - Each phase builds on previous
4. **Update tracker** - Check off tasks as completed
5. **Commit at end** - One cohesive commit for entire system
