# Logging Architecture: Strict Zero-Console Policy (v1 - SUPERSEDED)

**THIS TRACKER HAS BEEN SUPERSEDED BY [tracker-v2.md](./tracker-v2.md)**

**Reason**: Original approach was ad-hoc and inconsistent. v2 uses proper architecture-first approach with DiagnosticCollector pattern.

**Project Goal**: Eliminate all direct console usage from library code, enforce proper logging patterns across the entire codebase

**Last Updated**: 2026-02-03

**Status**: ABANDONED - See tracker-v2.md instead

---

## Why This Was Abandoned

This tracker took a task-oriented approach:

- Task 2.1: Fix schema.ts (return warnings in result)
- Task 2.2: Fix resolver.ts (class state with getter)
- Task 2.3: Fix workspace.ts (add to return type)
- Task 2.4: Fix cache.ts (silent failures)
- Task 2.5: Fix claudelint.ts (unknown)

**Problem**: Each file would have handled diagnostics differently. No unified pattern. Unmaintainable.

**Solution**: v2 tracker implements DiagnosticCollector pattern consistently across entire codebase.

**See**: [tracker-v2.md](./tracker-v2.md) for correct approach

---

## Original Content (For Reference Only)

### Overview

**Problem**: Console usage is inconsistent across the codebase. Library code (`src/utils/`, `src/api/`) directly calls `console.warn/error`, which:

- Makes the library untestable (console spam in tests)
- Prevents programmatic usage (consumers can't suppress output)
- Violates industry standards (ESLint, TypeScript, Prettier are silent libraries)

**Solution**: Implement strict zero-console policy where only designated output layers can use console directly.

**Scope**:

- 5 files with 11 console calls to refactor
- 2 enforcement scripts to extend
- 2 verification scripts to fix
- ~9 tests to update
- Documentation of new policy

**Estimated Effort**: 4-5 hours total

---

## Phase 1: Audit & Planning (COMPLETE)

**Status**: COMPLETE
**Duration**: 1 hour

### Tasks

- [x] **Task 1.1**: Comprehensive codebase audit
  - Found 11 console calls in library code across 5 files
  - Identified ValidationResult already has `warnings` array
  - Confirmed no API breaking changes needed

- [x] **Task 1.2**: Industry research
  - Researched ESLint, Prettier, TypeScript patterns
  - Confirmed zero-console is industry standard for libraries
  - Documented loglevel, typescript-logging patterns

- [x] **Task 1.3**: Create implementation plan
  - Document all files requiring changes
  - Estimate effort per task
  - Create this tracker

---

## Phase 2: Library Code Refactoring (IN PROGRESS)

**Status**: Ready to Start
**Duration**: 2 hours
**Dependencies**: Phase 1 complete

### Files to Refactor (5 files, 11 console calls)

#### Task 2.1: Refactor `src/utils/formats/schema.ts` (15 min)

**Console Usage**: 1 `console.warn` call

**Location**: Line 25-29

```typescript
console.warn(
  `Warning: Schema-generated rule "${id}" not found in registry. ` +
  `This usually means the rule file exists but isn't registered properly.`
);
```

**Strategy**: Return warning in ValidationResult

**Changes**:

```typescript
// Add warnings parameter to function signature
export function formatSchemaError(error: ZodError, warnings: ValidationWarning[] = []): ValidationError[] {

  // Instead of console.warn, push to warnings array
  warnings.push({
    message: `Schema-generated rule "${id}" not found in registry. This usually means the rule file exists but isn't registered properly.`,
    severity: 'warning',
    ruleId: id as RuleId
  });
}
```

**Testing**:

- Verify warning appears in ValidationResult.warnings
- Confirm no console output during tests

**Acceptance Criteria**:

- [x] console.warn removed
- [x] Warning returned in function result
- [x] Tests pass (822 passed, 2 skipped)
- [x] No console output in test runs

**Completed**: 2026-02-03

---

#### Task 2.2: Refactor `src/utils/config/resolver.ts` (15 min)

**Console Usage**: 1 `console.warn` call

**Location**: Line 242-249

```typescript
console.warn(
  `Warning: Rule "${ruleId}" has invalid options. ` +
  `Schema validation failed: ${validationError.message}. ` +
  `The rule will be disabled.`
);
```

**Strategy**: Return warning in config resolution result

**Changes**:

```typescript
// Return warnings from resolveConfig
export function resolveConfig(options: ResolveConfigOptions): {
  config: ClaudeLintConfig | null;
  configPath: string | null;
  warnings: Array<{ message: string; ruleId?: string }>;
} {
  const warnings: Array<{ message: string; ruleId?: string }> = [];

  // Instead of console.warn
  warnings.push({
    message: `Rule "${ruleId}" has invalid options. Schema validation failed: ${validationError.message}. The rule will be disabled.`,
    ruleId
  });

  return { config, configPath, warnings };
}
```

**Testing**:

- Test invalid rule options scenario
- Verify warning in return value
- Confirm rule is disabled silently

**Acceptance Criteria**:

- [ ] console.warn removed
- [ ] Warnings returned in resolveConfig result
- [ ] ClaudeLint class propagates warnings to ValidationResult
- [ ] Tests updated to check warnings array
- [ ] No console output in test runs

---

#### Task 2.3: Refactor `src/utils/workspace/detector.ts` (30 min)

**Console Usage**: 4 `console.warn` calls

**Locations**:

- Line 153: pnpm-workspace.yaml missing "packages" array
- Line 167-175: pnpm-workspace.yaml parse error
- Line 210: package.json workspaces invalid format
- Line 227-235: package.json parse error

**Strategy**: Return warnings in workspace detection result

**Changes**:

```typescript
export interface WorkspaceInfo {
  isWorkspace: boolean;
  workspaceRoot?: string;
  packages?: string[];
  warnings: string[];  // NEW
}

export async function detectWorkspace(startDir: string): Promise<WorkspaceInfo> {
  const warnings: string[] = [];

  // Replace all console.warn calls with:
  warnings.push('Warning: pnpm-workspace.yaml must have a "packages" array');
  warnings.push(`Warning: Failed to parse pnpm-workspace.yaml: ${error.message}`);
  // etc.

  return {
    isWorkspace,
    workspaceRoot,
    packages,
    warnings
  };
}
```

**Testing**:

- Test missing packages array
- Test invalid YAML
- Test invalid package.json workspaces
- Verify warnings in return value

**Acceptance Criteria**:

- [ ] All 4 console.warn calls removed
- [ ] WorkspaceInfo interface includes warnings array
- [ ] All warning scenarios return warnings
- [ ] Tests check warnings array
- [ ] No console output in test runs

---

#### Task 2.4: Refactor `src/utils/cache.ts` (20 min)

**Console Usage**: 3 `console.warn/error` calls

**Locations**:

- Line 122: `console.warn('Failed to save cache index:', error)`
- Line 224: `console.warn('Failed to cache result:', error)`
- Line 237: `console.error('Failed to clear cache:', error)`

**Strategy**: Silent failures (cache is optional), optionally return warnings

**Analysis**: Cache operations are non-fatal - the linter works fine without cache. These warnings provide no actionable value to library consumers.

**Changes**:

```typescript
// Option 1: Just remove console calls (cache fails silently)
// Option 2: Add optional onWarning callback to CacheManager constructor

export class CacheManager {
  constructor(
    private cacheDir: string,
    private onWarning?: (message: string) => void
  ) {}

  private warn(message: string) {
    if (this.onWarning) {
      this.onWarning(message);
    }
  }

  // Replace console.warn with:
  this.warn(`Failed to save cache index: ${error.message}`);
}
```

**Decision**: Use Option 1 (silent failures) unless we find a use case for Option 2.

**Testing**:

- Test cache write failures
- Test cache read failures
- Test cache clear failures
- Confirm silent operation

**Acceptance Criteria**:

- [ ] All 3 console calls removed
- [ ] Cache operations fail silently
- [ ] Tests don't expect console output
- [ ] No console output in test runs

---

#### Task 2.5: Refactor `src/api/claudelint.ts` (20 min)

**Console Usage**: 2 `console.error` calls

**Locations**:

- Line 699: `console.error('Validator failed for ${filePath}:', error)`
- Line 801: `console.error('Validator failed for ${effectivePath}:', error)`

**Strategy**: Return errors in ValidationResult

**Changes**:

```typescript
// In validateFiles method (line 699)
try {
  result = await validator.validate();
} catch (error) {
  // Instead of console.error, return error in result
  results.push({
    filePath,
    valid: false,
    errors: [{
      message: `Validator failed: ${error instanceof Error ? error.message : String(error)}`,
      file: filePath,
      severity: 'error'
    }],
    warnings: []
  });
  continue; // Skip to next file
}

// Similarly for line 801 in validateFile method
```

**Testing**:

- Test validator throwing errors
- Verify errors in ValidationResult
- Confirm no console output

**Acceptance Criteria**:

- [ ] Both console.error calls removed
- [ ] Validator failures return as errors in ValidationResult
- [ ] Tests updated to check error in results
- [ ] No console output in test runs

---

## Phase 3: Enforcement & Verification Scripts (IN PROGRESS)

**Status**: Ready to Start
**Duration**: 1 hour
**Dependencies**: Phase 2 complete

### Task 3.1: Extend `scripts/check/logger-usage.sh` (20 min)

**Goal**: Check ALL directories for console usage, not just `scripts/`

**Current**: Only checks `scripts/` directory

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
EXCLUDE_PATTERN=$(printf -- "--exclude=%s " "${ALLOWED_FILES[@]}")

# Check src/ directory (exclude logger implementations)
if grep -rn "console\." src/ --include="*.ts" $EXCLUDE_PATTERN 2>/dev/null; then
  echo ""
  echo "ERROR: Found console usage in src/"
  echo "Library code must not use console directly"
  echo "Return errors/warnings in ValidationResult instead"
  ERRORS=$((ERRORS + 1))
fi

# Check scripts/ directory (exclude logger.ts)
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
  echo "Fixes:"
  echo "  - Library code: Return warnings/errors in ValidationResult"
  echo "  - Scripts: Use log.* from scripts/util/logger.ts"
  exit 1
fi
```

**Testing**:

- Run script and verify it catches our refactored files (should pass)
- Add test console.log to library file, verify it fails
- Verify allowed files still pass

**Acceptance Criteria**:

- [ ] Script checks src/ directory
- [ ] Script checks scripts/ directory
- [ ] Allowlist for logger implementation files
- [ ] Clear error messages
- [ ] Script passes on clean codebase

---

### Task 3.2: Extend `scripts/check/logger-spacing.sh` (20 min)

**Goal**: Check scripts/ for manual `\n` and spacing in log calls

**Current**: Only checks `src/cli/` for logger.* patterns, doesn't check scripts/ at all

**Changes**: Add patterns for scripts/ checking log.* methods

```bash
# Add after existing CLI logger checks:

# Check script logger (scripts/) for log.* patterns
# Pattern 5: log.method('  ...')
if grep -rn "log\.\(info\|error\|success\|warn\|dim\|bold\)(['\"]  " scripts/ --include="*.ts" --exclude=logger.ts; then
  echo "ERROR: Found log calls with hardcoded 2+ spaces in scripts/"
  echo "Use log.dim() for indented output instead of log.info('  ...')"
  ERRORS=$((ERRORS + 1))
fi

# Pattern 6: Manual \n in log calls
if grep -rn 'log\.\(info\|error\|success\|warn\|dim\|bold\|section\|pass\|fail\).*\\n' scripts/ --include="*.ts" --exclude=logger.ts; then
  echo "ERROR: Found log calls with manual \\n newlines in scripts/"
  echo "Use log.blank() instead of \\n"
  ERRORS=$((ERRORS + 1))
fi

# Update help text:
echo "  Script logger (scripts/):"
echo "    - Use log.dim() for indented output (not '  ...')"
echo "    - Use log.blank() for blank lines (not \\n)"
```

**Testing**:

- Run script on current codebase (will fail on verification scripts)
- Fix verification scripts (Task 3.3)
- Re-run and verify pass

**Acceptance Criteria**:

- [ ] Script checks scripts/ directory for spacing violations
- [ ] Script checks scripts/ directory for manual newlines
- [ ] Clear error messages with examples
- [ ] Script passes after Task 3.3 complete

---

### Task 3.3: Fix `scripts/verify/tool-names.ts` and `model-names.ts` (20 min)

**Goal**: Remove manual `\n` and spacing violations we just committed

**Violations Found**:

- Manual `\n` in log.info() calls
- Hardcoded spacing like `log.info('  1. ...')`
- Should use log.blank() and log.dim() instead

**Changes for both files**:

```typescript
// BEFORE
log.info('Querying Claude Code CLI for available tools...\n');
log.info('\nManual verification fallback:');
log.dim('   Install Claude Code from: https://code.claude.com/');
log.info('  1. Review the drift above');

// AFTER
log.info('Querying Claude Code CLI for available tools...');
log.blank();
log.blank();
log.info('Manual verification fallback:');
log.dim('Install Claude Code from: https://code.claude.com/');
log.blank();
log.info('To fix:');
log.dim('1. Review the drift above');
```

**Pattern Changes**:

- `log.info('...\n')` → `log.info('...')` + `log.blank()`
- `log.info('\n...')` → `log.blank()` + `log.info('...')`
- `log.dim('   ...')` → `log.dim('...')` (remove leading spaces)
- `log.info('  1. ...')` → `log.dim('1. ...')` (use dim for indented items)

**Testing**:

- Run verification scripts, ensure output looks good
- Run `npm run verify:constants`
- Run `scripts/check/logger-spacing.sh` (should pass)

**Acceptance Criteria**:

- [ ] tool-names.ts: No manual \n or spacing
- [ ] model-names.ts: No manual \n or spacing
- [ ] Scripts still produce correct output
- [ ] logger-spacing.sh passes

---

## Phase 4: Test Updates (IN PROGRESS)

**Status**: Ready to Start
**Duration**: 1 hour
**Dependencies**: Phase 2 complete

### Task 4.1: Update tests that check console output (30 min)

**Scope**: ~9 tests that may check for console.warn output

**Files to Check**:

- `tests/utils/config-resolver.test.ts` (lines 367-368, 392-393)
- `tests/utils/workspace/*.test.ts` (if exists)
- `tests/utils/cache.test.ts` (if exists)
- `tests/api/claudelint.test.ts` (validator error cases)

**Strategy**:

1. Remove console.warn/error mocking
2. Check warnings/errors in ValidationResult instead
3. Use suppressConsole test utility if needed

**Example Changes**:

```typescript
// BEFORE
const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
await resolveConfig({ startDir: './test' });
expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('invalid options'));
warnSpy.mockRestore();

// AFTER
const result = await resolveConfig({ startDir: './test' });
expect(result.warnings).toContainEqual(
  expect.objectContaining({ message: expect.stringContaining('invalid options') })
);
```

**Testing**:

- Run full test suite: `npm test`
- Verify no console output during tests (except from reporters)
- Check test coverage maintained

**Acceptance Criteria**:

- [ ] All tests pass
- [ ] No console mocking in tests (except for negative tests)
- [ ] Tests check warnings/errors in results instead
- [ ] Test coverage maintained or improved
- [ ] No console spam during test runs

---

### Task 4.2: Add integration tests for warning propagation (30 min)

**Goal**: Ensure warnings from library code reach ValidationResult

**Test Cases**:

```typescript
describe('Warning Propagation', () => {
  it('should return workspace warnings in validation result', async () => {
    // Create invalid pnpm-workspace.yaml
    // Run validation
    // Check result.warnings includes workspace warning
  });

  it('should return config warnings in validation result', async () => {
    // Create config with invalid rule options
    // Run validation
    // Check result.warnings includes config warning
  });

  it('should handle validator errors gracefully', async () => {
    // Force validator to throw error
    // Run validation
    // Check result.errors includes validator error
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

**Location**: `tests/validators/warning-propagation.test.ts`

**Testing**:

- Run new tests: `npm test tests/validators/warning-propagation.test.ts`
- Verify all pass
- Check coverage report

**Acceptance Criteria**:

- [ ] Integration tests cover all warning sources
- [ ] Tests verify no console output
- [ ] All tests pass
- [ ] Added to CI test suite

---

## Phase 5: Documentation (IN PROGRESS)

**Status**: Ready to Start
**Duration**: 30 minutes
**Dependencies**: Phases 2-4 complete

### Task 5.1: Document logging policy (15 min)

**Create**: `docs/architecture/logging-policy.md`

**Content**:

```markdown
# Logging Policy

## Strict Zero-Console Policy

Library code MUST NOT use console.log/warn/error directly.

### Allowed Console Usage

Console usage is ONLY allowed in these files:
- `src/cli/utils/logger.ts` - CLI logger implementation
- `src/utils/reporting/reporting.ts` - Report formatting layer
- `src/utils/reporting/progress.ts` - Progress indicator layer
- `scripts/util/logger.ts` - Script logger implementation

### Library Code (src/utils/, src/api/, src/validators/)

**Rule**: Never use console directly

**Instead**:
- Return warnings in ValidationResult.warnings array
- Return errors in ValidationResult.errors array
- Silent failures for optional operations (e.g., cache)

**Example**:
[Include before/after examples]

### CLI Code (src/cli/)

**Rule**: Use logger from src/cli/utils/logger.ts

**Methods**:
- logger.success() - green text
- logger.error() - red text
- logger.warn() - yellow text
[etc.]

### Scripts (scripts/)

**Rule**: Use log from scripts/util/logger.ts

**Methods**:
- log.success() - green text
[etc.]

### Enforcement

Pre-commit hooks check:
- `scripts/check/logger-usage.sh` - No direct console usage
- `scripts/check/logger-spacing.sh` - No manual \n or spacing

### Why This Policy?

1. **Testability**: No console spam in test output
2. **Library usage**: Consumers can suppress or handle warnings
3. **Industry standard**: ESLint, TypeScript, Prettier are silent libraries
4. **Clean API**: Warnings/errors in results, not side effects
```

**Acceptance Criteria**:

- [ ] Documentation created
- [ ] Policy clearly explained
- [ ] Examples provided
- [ ] Enforcement documented

---

### Task 5.2: Update CONTRIBUTING.md (15 min)

**Changes**: Add logging policy section to CONTRIBUTING.md

**Section to Add** (after line ~90, "Code Style Guidelines"):

```markdown
### Logging Guidelines

**IMPORTANT: Library code MUST NOT use console directly**

See [docs/architecture/logging-policy.md](docs/architecture/logging-policy.md) for full details.

**Quick rules**:
- Library code (`src/utils/`, `src/api/`, `src/validators/`): Return warnings/errors in ValidationResult
- CLI code (`src/cli/`): Use `logger` from `src/cli/utils/logger.ts`
- Scripts (`scripts/`): Use `log` from `scripts/util/logger.ts`

**Pre-commit checks enforce this**:
- `scripts/check/logger-usage.sh` - Detects direct console usage
- `scripts/check/logger-spacing.sh` - Detects manual \n or spacing

**Why**:
- Makes library testable (no console spam)
- Allows programmatic usage (consumers control output)
- Follows industry standards (ESLint, TypeScript, Prettier)
```

**Acceptance Criteria**:

- [ ] CONTRIBUTING.md updated
- [ ] Links to logging-policy.md
- [ ] Pre-commit checks mentioned
- [ ] Clear rules stated

---

## Phase 6: Verification & Cleanup (FINAL)

**Status**: Ready to Start
**Duration**: 30 minutes
**Dependencies**: All previous phases complete

### Task 6.1: Final verification (15 min)

**Checklist**:

```bash
# 1. Run all enforcement checks
npm run check:logger-spacing
npm run check:logger-usage

# 2. Run full test suite
npm test

# 3. Run all pre-commit checks
npm run check:all

# 4. Test library usage (no console output)
cat > test-library.ts << 'EOF'
import { ClaudeLint } from './src/api/claudelint';

const linter = new ClaudeLint();
const results = await linter.validateFiles(['test-file.ts']);
console.log(`Found ${results[0].warnings.length} warnings`);
console.log(`Found ${results[0].errors.length} errors`);
EOF

ts-node test-library.ts  # Should see NO console output from library

# 5. Verify verification scripts work
npm run verify:constants

# 6. Check for any remaining console usage
grep -r "console\." src/ --include="*.ts" | grep -v "reporting/" | grep -v "logger.ts"
# Should only show JSDoc comments, no actual code
```

**Acceptance Criteria**:

- [ ] All checks pass
- [ ] All tests pass
- [ ] No console output from library usage
- [ ] Verification scripts work correctly
- [ ] No unexpected console usage found

---

### Task 6.2: Update changelog and commit (15 min)

**Commit Message**:

```text
refactor: implement strict zero-console policy for library code

BREAKING CHANGE: Library code no longer prints warnings directly to console.
Warnings are now returned in ValidationResult.warnings array.

This change makes the library properly testable and allows programmatic
consumers to control output. CLI behavior is unchanged.

Changes:
- Refactor 5 files to remove 11 console.warn/error calls
- Return warnings in ValidationResult instead of printing
- Silent failures for optional operations (cache)
- Extend enforcement checks to cover all of src/ and scripts/
- Fix verification scripts to use proper logger methods
- Update tests to check warnings array instead of console output
- Document logging policy in docs/architecture/

Affects:
- src/utils/formats/schema.ts
- src/utils/config/resolver.ts
- src/utils/workspace/detector.ts
- src/utils/cache.ts
- src/api/claudelint.ts
- scripts/check/logger-usage.sh
- scripts/check/logger-spacing.sh
- scripts/verify/tool-names.ts
- scripts/verify/model-names.ts

Closes #XXX (Logging Architecture Cleanup)
```

**Changelog Entry** (add to CHANGELOG.md):

```markdown
## [Unreleased]

### Changed

- **BREAKING**: Library code no longer prints warnings to console. Warnings are now returned in `ValidationResult.warnings` array. CLI output is unchanged. This makes the library testable and allows programmatic consumers to control output.

### Fixed

- Cache operations now fail silently instead of printing warnings
- Config resolution warnings now returned in result instead of printed
- Workspace detection warnings now returned in result instead of printed
- Validator errors now returned in result instead of printed

### Internal

- Implemented strict zero-console policy for library code
- Extended pre-commit checks to enforce logging policy across entire codebase
- Fixed verification scripts to use proper logger methods (no manual \n or spacing)
- Added comprehensive logging policy documentation
```

**Acceptance Criteria**:

- [ ] Commit message follows conventional commits
- [ ] BREAKING CHANGE noted
- [ ] All changes listed
- [ ] CHANGELOG.md updated
- [ ] Changes pushed to branch

---

## Summary

### Total Effort: ~5 hours

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1: Audit & Planning | 1 hour | 3 tasks |
| Phase 2: Library Refactoring | 2 hours | 5 tasks |
| Phase 3: Enforcement Scripts | 1 hour | 3 tasks |
| Phase 4: Test Updates | 1 hour | 2 tasks |
| Phase 5: Documentation | 30 min | 2 tasks |
| Phase 6: Verification | 30 min | 2 tasks |

### Key Metrics

- **Files to modify**: 13 files
- **Console calls to remove**: 11 calls
- **Tests to update**: ~9 tests
- **New tests to add**: 1 integration test file
- **Documentation**: 2 files (new + update)

### Success Criteria

- Zero console usage in library code (except designated output layers)
- All warnings/errors returned in ValidationResult
- All tests pass with no console output
- Pre-commit checks enforce policy
- Documentation complete
- No breaking changes to CLI behavior
- Library is fully testable and controllable

### Breaking Changes

**For Library Consumers Only** (not CLI users):

Library code no longer prints warnings directly. Consumers must check `ValidationResult.warnings` array to see warnings. CLI behavior is unchanged - warnings still print to console via reporting layer.

### Non-Breaking

- CLI output unchanged (warnings still print)
- ValidationResult structure already had warnings array
- Tests already checked ValidationResult
- Cache silent failures are more correct behavior
