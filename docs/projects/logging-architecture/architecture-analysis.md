# Logging Architecture: Complete Analysis

**Date**: 2026-02-03

## Executive Summary

**Problem**: Library code directly calls `console.warn/error` in 10 places, making it untestable and uncontrollable.

**Root Cause**: No unified diagnostic collection system. Each file handles warnings differently (or not at all).

**Solution**: Implement `DiagnosticCollector` pattern (ESLint/TypeScript/Webpack approach) with consistent threading through the entire validation pipeline.

---

## Complete Console Usage Audit

### Category 1: Library Code (MUST FIX)

**Files**: 4 files, 10 console calls

#### src/api/claudelint.ts (2 calls)

```typescript
// Line 699
console.error(`Validator failed for ${filePath}:`, error);

// Line 801
console.error(`Validator failed for ${effectivePath}:`, error);
```

**Context**: Validator exceptions during validation
**Issue**: Errors printed but validation continues silently
**Fix**: Collect as diagnostic, include in ValidationResult

#### src/utils/cache.ts (3 calls)

```typescript
// Line 122
console.warn('Failed to save cache index:', error);

// Line 224
console.warn('Failed to cache result:', error);

// Line 237
console.error('Failed to clear cache:', error);
```

**Context**: Cache operation failures (non-fatal)
**Issue**: Comment says "silently fail" but actually prints
**Fix**: Collect as diagnostic (or truly silent with optional diagnostics)

#### src/utils/config/resolver.ts (1 call)

```typescript
// Line 242-244 (PARTIALLY MODIFIED)
console.warn(`Warning: Invalid options for rule '${ruleId}'...`);
```

**Context**: Rule options fail schema validation
**Issue**: Warning printed, rule silently disabled
**Fix**: Already modified to use `this.warnings` array, needs integration with DiagnosticCollector

#### src/utils/workspace/detector.ts (4 calls)

```typescript
// Line 153
console.warn('Warning: pnpm-workspace.yaml must have a "packages" array');

// Line 167-169
console.warn(`Warning: Failed to parse pnpm-workspace.yaml: ${error...}`);

// Line 210
console.warn('Warning: package.json workspaces must be an array or { packages: [...] }');

// Line 227-229
console.warn(`Warning: Failed to parse package.json workspaces: ${error...}`);
```

**Context**: Workspace configuration issues (non-fatal)
**Issue**: Warnings printed, workspace detection returns null
**Fix**: Collect as diagnostic

---

### Category 2: Legitimate Output Layers (KEEP)

#### src/cli/utils/logger.ts

**Purpose**: CLI output abstraction
**Usage**: Correct - this IS the output layer for CLI commands
**Methods**: success(), error(), warn(), info(), section(), etc.
**Keep**: Yes

#### src/utils/reporting/reporting.ts

**Purpose**: Report formatting (stylish, JSON, compact)
**Usage**: Correct - this IS the report output layer
**Keep**: Yes

#### src/utils/reporting/progress.ts

**Purpose**: Progress indicators with ora spinners
**Usage**: Correct - this IS the progress output layer
**Keep**: Yes

---

### Category 3: JSDoc Examples Only (NO ACTION)

#### src/api/functions.ts

- All console.log in JSDoc comments
- No actual code usage

#### src/api/message-builder.ts

- All console.log in JSDoc comments
- No actual code usage

---

## Architecture Design: DiagnosticCollector Pattern

### Core Concept

**Industry Standard**: ESLint, TypeScript, Webpack all use a central collector that accumulates diagnostics across the entire operation.

**Key Pattern**:

```typescript
// Create collector at top of pipeline
const diagnostics = new DiagnosticCollector();

// Thread through all components
const config = resolveConfig(options, diagnostics);
const workspace = detectWorkspace(dir, diagnostics);

// Collect at end
const warnings = diagnostics.getWarnings();
```

### Design Principles

1. **Optional Parameter**: `diagnostics?: DiagnosticCollector` for backward compatibility
2. **Single Responsibility**: Collector only collects, doesn't format or output
3. **Structured Data**: Not just strings - includes source, severity, context
4. **Thread Don't Return**: Pass collector down, don't return diagnostics up
5. **Centralized**: One collector per validation operation

---

## Proposed Architecture

### 1. DiagnosticCollector (Core)

**Location**: `src/utils/diagnostics/collector.ts`

```typescript
export interface Diagnostic {
  message: string;
  source: string;        // 'ConfigResolver', 'WorkspaceDetector', etc.
  severity: 'info' | 'warning' | 'error';
  code?: string;         // 'CACHE_001', 'CONFIG_INVALID_OPTIONS', etc.
  context?: Record<string, unknown>; // Additional data for debugging
}

export class DiagnosticCollector {
  private diagnostics: Diagnostic[] = [];

  /**
   * Add a diagnostic
   */
  add(diagnostic: Diagnostic): void {
    this.diagnostics.push(diagnostic);
  }

  /**
   * Convenience method for warnings
   */
  warn(message: string, source: string, code?: string): void {
    this.add({ message, source, severity: 'warning', code });
  }

  /**
   * Convenience method for errors
   */
  error(message: string, source: string, code?: string): void {
    this.add({ message, source, severity: 'error', code });
  }

  /**
   * Convenience method for info
   */
  info(message: string, source: string, code?: string): void {
    this.add({ message, source, severity: 'info', code });
  }

  /**
   * Get all diagnostics
   */
  getAll(): Diagnostic[] {
    return [...this.diagnostics];
  }

  /**
   * Get diagnostics by severity
   */
  getWarnings(): Diagnostic[] {
    return this.diagnostics.filter(d => d.severity === 'warning');
  }

  getErrors(): Diagnostic[] {
    return this.diagnostics.filter(d => d.severity === 'error');
  }

  /**
   * Clear all diagnostics
   */
  clear(): void {
    this.diagnostics = [];
  }

  /**
   * Check if any diagnostics were collected
   */
  hasWarnings(): boolean {
    return this.diagnostics.some(d => d.severity === 'warning');
  }

  hasErrors(): boolean {
    return this.diagnostics.some(d => d.severity === 'error');
  }
}
```

### 2. Threading Pattern

**FileValidator** (top of pipeline):

```typescript
export abstract class FileValidator {
  protected diagnostics = new DiagnosticCollector();

  protected getResult(): ValidationResult {
    // Convert diagnostics to warnings
    const diagnosticWarnings = this.diagnostics.getWarnings().map(d => ({
      message: `[${d.source}] ${d.message}`,
      severity: 'warning' as const,
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

**ConfigResolver**:

```typescript
export class ConfigResolver {
  constructor(
    private config: ClaudeLintConfig,
    private diagnostics?: DiagnosticCollector
  ) {}

  private normalizeRuleConfig(...) {
    if (invalid) {
      this.diagnostics?.warn(
        `Invalid options for rule '${ruleId}': ${error}. Rule will be disabled.`,
        'ConfigResolver',
        'CONFIG_INVALID_OPTIONS'
      );
      return null;
    }
  }
}
```

**WorkspaceDetector**:

```typescript
export async function detectWorkspace(
  startDir: string,
  diagnostics?: DiagnosticCollector
): Promise<WorkspaceInfo | null> {
  if (invalidYaml) {
    diagnostics?.warn(
      'pnpm-workspace.yaml must have a "packages" array',
      'WorkspaceDetector',
      'WORKSPACE_INVALID_YAML'
    );
    return null;
  }
}
```

**CacheManager**:

```typescript
export class CacheManager {
  constructor(
    private cacheDir: string,
    private diagnostics?: DiagnosticCollector
  ) {}

  private async saveCacheIndex() {
    try {
      // ...
    } catch (error) {
      this.diagnostics?.warn(
        `Failed to save cache index: ${error.message}`,
        'CacheManager',
        'CACHE_SAVE_FAILED'
      );
    }
  }
}
```

### 3. Usage in Validators

```typescript
// FileValidator creates collector
class SkillsValidator extends FileValidator {
  async validate(): Promise<ValidationResult> {
    // ConfigResolver gets the collector
    if (this.options.config) {
      this.configResolver = new ConfigResolver(
        this.options.config,
        this.diagnostics  // Pass it down
      );
    }

    // Workspace detection gets it
    const workspace = await detectWorkspace(
      this.workingDir,
      this.diagnostics  // Pass it down
    );

    // Cache gets it
    this.cache = new CacheManager(
      cacheDir,
      this.diagnostics  // Pass it down
    );

    // getResult() collects everything
    return this.getResult();
  }
}
```

---

## Migration Strategy

### Phase 1: Foundation (30 min)

1. Create DiagnosticCollector class
2. Add to FileValidator
3. Update getResult() to collect diagnostics

### Phase 2: Integration (2 hours)

1. Update ConfigResolver to accept diagnostics
2. Update WorkspaceDetector to accept diagnostics
3. Update CacheManager to accept diagnostics
4. Update ClaudeLint API error handling

### Phase 3: Testing (1 hour)

1. Update tests to check diagnostics
2. Add integration tests for diagnostic collection
3. Verify no console output in tests

### Phase 4: Enforcement (30 min)

1. Extend logger-usage.sh to check all of src/
2. Extend logger-spacing.sh to check scripts/
3. Document policy

---

## Future Enhancements

### 1. Diagnostic Filtering

```typescript
const collector = new DiagnosticCollector({
  filter: (d) => d.code !== 'CACHE_SAVE_FAILED'
});
```

### 2. Diagnostic Reporting

```typescript
// Pretty print diagnostics
console.log(formatDiagnostics(collector.getAll()));
```

### 3. Diagnostic Codes

```typescript
// Structured codes for filtering/documentation
enum DiagnosticCode {
  CONFIG_INVALID_OPTIONS = 'CONFIG_001',
  WORKSPACE_INVALID_YAML = 'WORKSPACE_001',
  CACHE_SAVE_FAILED = 'CACHE_001',
  // ...
}
```

### 4. Performance Diagnostics

```typescript
diagnostics.info('Validation took 2.5s', 'Performance', 'PERF_SLOW');
```

### 5. Deprecation Warnings

```typescript
diagnostics.warn('Rule X is deprecated', 'Deprecation', 'DEPRECATION_X');
```

---

## Benefits of This Approach

### Present Benefits

**Consistent pattern** - One way to handle diagnostics everywhere
**Testable** - Can assert on collected diagnostics
**Silent library** - No console usage in library code
**Backward compatible** - Optional diagnostics parameter
**Industry standard** - Matches ESLint/TypeScript/Webpack

### Future Benefits

**Extensible** - Easy to add new diagnostic types
**Filterable** - Users can suppress specific diagnostics
**Structured** - Rich diagnostic data with codes and context
**Reportable** - Can pretty-print diagnostics separately
**Debuggable** - Source tracking makes debugging easier

---

## Comparison with Original Approach

### Original Approach (Ad-Hoc)

- Different pattern per file
- Inconsistent
- Not extensible
- Hard to test
- Mixed concerns (collecting vs formatting)

Example inconsistencies:

- schema.ts: Returns warnings in result
- resolver.ts: Stores warnings as class state
- workspace.ts: Would add warnings to return type
- cache.ts: Would be silent failures
- claudelint.ts: Unknown approach

### DiagnosticCollector Approach (Unified)

- Same pattern everywhere
- Consistent
- Extensible
- Testable
- Separation of concerns

Example consistency:

- ALL: `diagnostics?.warn(message, source, code)`
- ALL: Optional parameter
- ALL: Collected by FileValidator
- ALL: Included in ValidationResult

---

## Why This Failed Initially

**Root Cause**: Started with tasks before system design

**Mistakes**:

1. Treated 10 console calls as "simple refactoring"
2. Didn't recognize it as an architecture problem
3. Jumped to implementation without unified pattern
4. Followed task-oriented tracker instead of system-oriented design

**Lesson**: Always design the system first, then implement consistently.

---

## Recommendation

**Proceed with DiagnosticCollector pattern**:

- Industry-proven approach
- Scalable and maintainable
- Future-proof
- Testable and debuggable
- Consistent across entire codebase

**Do NOT** proceed with original ad-hoc approach:

- Creates technical debt
- Unmaintainable
- Not extensible
- Inconsistent
- Will need refactoring later anyway
