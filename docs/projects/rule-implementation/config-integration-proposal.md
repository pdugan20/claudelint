# Configuration Integration Proposal

**Status**: Draft for Review
**Date**: 2026-01-28
**Author**: Claude (based on user request)

## Executive Summary

claudelint has a complete configuration infrastructure (.claudelintrc.json, config loading, validation) but validators don't use it. This proposal designs the integration layer to make rules respect configured severity levels, enable/disable states, and rule-specific options - following ESLint's proven architecture.

## Problem Statement

### Current State

**What Works:**
- `.claudelintrc.json` file loading and parsing
- Config validation (`validate-config`, `print-config` commands)
- Rule registry with metadata
- Inline disable comments (`claudelint-disable`)

**What Doesn't Work:**
- Rules set to `"off"` still run and report violations
- Severity overrides (`"error"` → `"warn"`) are ignored
- Rule options are never passed to validators
- File-specific overrides don't apply

### Impact

Users expect this to work:

```json
{
  "rules": {
    "size-warning": "off",
    "size-error": {
      "severity": "warn",
      "options": { "maxSize": 60000 }
    }
  }
}
```

But validators hardcode severity and never check if rules are disabled.

## How ESLint Does It

Based on research from [ESLint Custom Rules](https://eslint.org/docs/latest/extend/custom-rules) and [Configure Rules](https://eslint.org/docs/latest/use/configure/rules) documentation:

### 1. Rule Configuration Format

```javascript
// ESLint config format
{
  rules: {
    "rule-name": "off" | "warn" | "error",
    "rule-with-options": ["error", { option1: value }],
    "another-rule": ["warn", "option1", { option2: value }]
  }
}
```

### 2. How Rules Access Options

Rules receive a `context` object with `context.options` array:

```javascript
// In rule implementation
module.exports = {
  meta: {
    schema: [
      { type: "string", enum: ["always", "never"] },
      { type: "object", properties: { ... } }
    ]
  },
  create(context) {
    const mode = context.options[0] || "always"; // Default
    const opts = context.options[1] || {};

    // Rule logic uses mode and opts
  }
};
```

**Key insights:**
- **Rules never see their own severity** - The linter engine filters violations based on config
- **Options array excludes severity** - `["error", "opt1", "opt2"]` becomes `["opt1", "opt2"]`
- **Rules provide defaults** - Handle missing options gracefully
- **Schema validation** - Options validated against JSON Schema before passed to rule

### 3. Filtering Pipeline

```text
1. Rule runs → generates violations
2. Linter checks config → filters by severity
   - "off" → discard all violations
   - "warn"/"error" → keep with appropriate severity
3. Output formatter receives filtered violations
```

### 4. File-Specific Overrides

```javascript
{
  overrides: [
    {
      files: ["*.test.js"],
      rules: {
        "no-console": "off"
      }
    }
  ]
}
```

Resolved at lint-time by matching file paths against patterns.

## Proposed Architecture for claudelint

### Design Principles

1. **Separation of Concerns**: Validators generate violations, separate layer applies config
2. **Backward Compatible**: Existing validators continue working unchanged
3. **ESLint-Compatible**: Familiar patterns for users coming from ESLint
4. **Rule Options**: Enable per-rule configuration with type safety
5. **Performance**: Minimal overhead, skip disabled rules entirely

### Architecture Diagram

```text
┌─────────────────────────────────────────────────────────┐
│ CLI / API Entry Point                                   │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ ConfigResolver                                          │
│ - Load .claudelintrc.json                              │
│ - Resolve file-specific overrides                      │
│ - Build effective config for each file                 │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ ValidationCoordinator (NEW)                             │
│ - Instantiate validators with rule context            │
│ - Pass options to validators                           │
│ - Collect raw violations                               │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ BaseValidator (ENHANCED)                                │
│ - Access options via this.getRuleOptions()             │
│ - Check if rule enabled via this.isRuleEnabled()       │
│ - Report violations (as before)                        │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ ViolationFilter (NEW)                                   │
│ - Apply severity overrides                             │
│ - Filter disabled rules                                │
│ - Apply inline disable comments                        │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ OutputFormatter                                         │
└─────────────────────────────────────────────────────────┘
```

## Implementation Plan

### Phase 1: Core Infrastructure (2-3 hours)

#### 1.1 Enhance RuleMetadata with Options Schema

```typescript
// src/utils/rule-registry.ts
export interface RuleMetadata {
  id: RuleId;
  name: string;
  description: string;
  category: string;
  severity: 'error' | 'warning';
  fixable: boolean;
  deprecated: boolean;
  replacedBy?: string[];
  since: string;
  docUrl?: string;

  // NEW: Options schema (Zod)
  schema?: z.ZodType<any>;
  defaultOptions?: Record<string, unknown>;
}
```

#### 1.2 Create RuleContext Interface

```typescript
// src/utils/rule-context.ts
import { RuleId } from '../rules/rule-ids';
import { RuleConfig } from './config';

/**
 * Context passed to validators for rule execution
 * Similar to ESLint's context object
 */
export interface RuleContext {
  /** Rule ID being evaluated */
  ruleId: RuleId;

  /** Configured options for this rule (excludes severity) */
  options: unknown[];

  /** Effective severity for this rule in current file */
  severity: 'off' | 'warn' | 'error';

  /** File being validated */
  filePath?: string;
}

/**
 * Resolved rule configuration for a specific file
 */
export interface ResolvedRuleConfig {
  ruleId: RuleId;
  severity: 'off' | 'warn' | 'error';
  options: unknown[];
}
```

#### 1.3 Create ConfigResolver

```typescript
// src/utils/config-resolver.ts
import { ClaudeLintConfig, RuleConfig } from './config';
import { RuleId } from '../rules/rule-ids';
import { RuleRegistry } from './rule-registry';
import minimatch from 'minimatch';

export class ConfigResolver {
  constructor(private config: ClaudeLintConfig) {}

  /**
   * Resolve effective configuration for a specific file
   */
  resolveForFile(filePath: string): Map<RuleId, ResolvedRuleConfig> {
    const resolved = new Map<RuleId, ResolvedRuleConfig>();

    // Start with base rules
    const baseRules = this.config.rules || {};

    // Apply overrides for this file
    const overrides = this.config.overrides || [];
    const matchingOverrides = overrides.filter(override =>
      override.files.some(pattern => minimatch(filePath, pattern))
    );

    // Merge in priority order: base → overrides
    const effectiveRules = { ...baseRules };
    for (const override of matchingOverrides) {
      Object.assign(effectiveRules, override.rules);
    }

    // Normalize to ResolvedRuleConfig
    for (const [ruleId, config] of Object.entries(effectiveRules)) {
      const normalized = this.normalizeRuleConfig(ruleId as RuleId, config);
      resolved.set(ruleId as RuleId, normalized);
    }

    return resolved;
  }

  /**
   * Normalize rule config to standard format
   */
  private normalizeRuleConfig(
    ruleId: RuleId,
    config: RuleConfig | 'off' | 'warn' | 'error'
  ): ResolvedRuleConfig {
    // String format: "off" | "warn" | "error"
    if (typeof config === 'string') {
      return {
        ruleId,
        severity: config,
        options: []
      };
    }

    // Object format: { severity, options }
    const rule = RuleRegistry.get(ruleId);
    const options = config.options || {};

    // Validate options against schema if available
    if (rule?.schema) {
      try {
        rule.schema.parse(options);
      } catch (error) {
        throw new Error(
          `Invalid options for rule '${ruleId}': ${error}`
        );
      }
    }

    return {
      ruleId,
      severity: config.severity,
      options: [options] // Wrap in array like ESLint
    };
  }

  /**
   * Check if a rule is enabled for a file
   */
  isRuleEnabled(ruleId: RuleId, filePath: string): boolean {
    const config = this.resolveForFile(filePath).get(ruleId);
    if (!config) {
      // Not configured = use default from registry
      const rule = RuleRegistry.get(ruleId);
      return rule !== undefined;
    }
    return config.severity !== 'off';
  }

  /**
   * Get options for a rule in a specific file
   */
  getRuleOptions(ruleId: RuleId, filePath: string): unknown[] {
    const config = this.resolveForFile(filePath).get(ruleId);
    if (!config) {
      // Use default options from registry
      const rule = RuleRegistry.get(ruleId);
      return rule?.defaultOptions ? [rule.defaultOptions] : [];
    }
    return config.options;
  }
}
```

### Phase 2: Enhance BaseValidator (1-2 hours)

```typescript
// src/validators/base.ts (additions)
export abstract class BaseValidator {
  protected options: BaseValidatorOptions;
  protected errors: ValidationError[] = [];
  protected warnings: ValidationWarning[] = [];
  protected disabledRules: Map<string, DisabledRule[]> = new Map();

  // NEW: Config resolver
  protected configResolver?: ConfigResolver;

  // NEW: Current file context
  protected currentFile?: string;

  constructor(options: BaseValidatorOptions = {}) {
    this.options = options;

    // Initialize config resolver if config provided
    if (options.config) {
      this.configResolver = new ConfigResolver(options.config);
    }
  }

  /**
   * Check if a rule is enabled for the current file
   */
  protected isRuleEnabled(ruleId: RuleId): boolean {
    // If no config, rule is enabled (default behavior)
    if (!this.configResolver || !this.currentFile) {
      return true;
    }

    return this.configResolver.isRuleEnabled(ruleId, this.currentFile);
  }

  /**
   * Get options for a specific rule
   */
  protected getRuleOptions<T = Record<string, unknown>>(
    ruleId: RuleId
  ): T | undefined {
    if (!this.configResolver || !this.currentFile) {
      // Return default options from registry
      const rule = RuleRegistry.get(ruleId);
      return rule?.defaultOptions as T;
    }

    const options = this.configResolver.getRuleOptions(
      ruleId,
      this.currentFile
    );

    return options[0] as T;
  }

  /**
   * Report error with config awareness
   */
  protected reportError(
    message: string,
    file?: string,
    line?: number,
    ruleId?: RuleId,
    options?: { fix?: string; explanation?: string; howToFix?: string; autoFix?: AutoFix }
  ): void {
    // Check inline disable comments (existing)
    if (this.isRuleDisabled(file, line, ruleId)) {
      return;
    }

    // NEW: Check if rule is enabled in config
    if (ruleId && !this.isRuleEnabled(ruleId)) {
      return;
    }

    this.errors.push({
      message,
      file,
      line,
      severity: 'error',
      ruleId,
      fix: options?.fix,
      explanation: options?.explanation,
      howToFix: options?.howToFix,
      autoFix: options?.autoFix,
    });
  }

  /**
   * Report warning with config awareness
   */
  protected reportWarning(
    message: string,
    file?: string,
    line?: number,
    ruleId?: RuleId,
    options?: { fix?: string; explanation?: string; howToFix?: string; autoFix?: AutoFix }
  ): void {
    // Check inline disable comments (existing)
    if (this.isRuleDisabled(file, line, ruleId)) {
      return;
    }

    // NEW: Check if rule is enabled in config
    if (ruleId && !this.isRuleEnabled(ruleId)) {
      return;
    }

    this.warnings.push({
      message,
      file,
      line,
      severity: 'warning',
      ruleId,
      fix: options?.fix,
      explanation: options?.explanation,
      howToFix: options?.howToFix,
      autoFix: options?.autoFix,
    });
  }

  /**
   * Set current file context for config resolution
   */
  protected setCurrentFile(filePath: string): void {
    this.currentFile = filePath;
  }
}
```

### Phase 3: Update Validators to Use Options (Incremental)

Example: size-error rule with configurable threshold

```typescript
// src/validators/claude-md.ts (example)
interface SizeErrorOptions {
  maxSize?: number; // Default: 50000
}

async validate(): Promise<ValidationResult> {
  const files = await this.findClaudeMdFiles();

  for (const file of files) {
    // Set context for config resolution
    this.setCurrentFile(file);

    // Get rule options
    const options = this.getRuleOptions<SizeErrorOptions>('size-error');
    const maxSize = options?.maxSize || 50000;

    const content = await readFileContent(file);
    const size = Buffer.byteLength(content, 'utf-8');

    if (size > maxSize) {
      this.reportError(
        `File size (${size} bytes) exceeds limit (${maxSize} bytes)`,
        file,
        undefined,
        'size-error'
      );
    }
  }

  return this.getResult();
}
```

Register rule with schema:

```typescript
// During initialization
RuleRegistry.register({
  id: 'size-error',
  name: 'File Size Error',
  description: 'CLAUDE.md files must not exceed size limit',
  category: 'CLAUDE.md',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
  schema: z.object({
    maxSize: z.number().positive().optional().describe('Maximum file size in bytes')
  }),
  defaultOptions: {
    maxSize: 50000
  }
});
```

### Phase 4: Apply Severity Overrides (1 hour)

```typescript
// src/utils/violation-filter.ts
export class ViolationFilter {
  constructor(private configResolver: ConfigResolver) {}

  /**
   * Apply severity overrides from config
   */
  applySeverityOverrides(
    violations: Array<ValidationError | ValidationWarning>,
    filePath: string
  ): Array<ValidationError | ValidationWarning> {
    const fileConfig = this.configResolver.resolveForFile(filePath);

    return violations.map(violation => {
      if (!violation.ruleId) return violation;

      const config = fileConfig.get(violation.ruleId);
      if (!config) return violation;

      // Override severity
      if (config.severity === 'warn' && violation.severity === 'error') {
        return { ...violation, severity: 'warning' };
      }
      if (config.severity === 'error' && violation.severity === 'warning') {
        return { ...violation, severity: 'error' };
      }

      return violation;
    });
  }

  /**
   * Filter violations based on config
   */
  filterViolations(
    violations: Array<ValidationError | ValidationWarning>,
    filePath: string
  ): Array<ValidationError | ValidationWarning> {
    const fileConfig = this.configResolver.resolveForFile(filePath);

    return violations.filter(violation => {
      if (!violation.ruleId) return true; // Keep violations without rule IDs

      const config = fileConfig.get(violation.ruleId);
      if (!config) return true; // Not configured = enabled

      // Filter out "off" rules
      return config.severity !== 'off';
    });
  }
}
```

## Migration Path

### Backward Compatibility

**No Breaking Changes Required:**
- Validators without config continue working
- Rules default to registry metadata if not configured
- Existing CLI and API stay compatible

**Opt-In Enhancement:**
- Users add `.claudelintrc.json` to customize
- Validators gradually add options support
- Old behavior preserved when no config present

### Phased Rollout

**Phase 1**: Infrastructure (this proposal)
- Add ConfigResolver
- Enhance BaseValidator
- Document config format

**Phase 2**: Core Rules (1-2 days)
- Add options to size-error, size-warning
- Add options to import rules
- Test with real configs

**Phase 3**: Remaining Rules (1-2 weeks)
- Add options to Skills rules
- Add options to Settings rules
- Update all rule documentation

**Phase 4**: Polish (2-3 days)
- Performance optimization
- Error messages
- User guide

## Rule Option Examples

### Example 1: size-error with custom threshold

```json
{
  "rules": {
    "size-error": {
      "severity": "error",
      "options": {
        "maxSize": 60000
      }
    }
  }
}
```

### Example 2: skill-missing-shebang with ignore patterns

```json
{
  "rules": {
    "skill-missing-shebang": {
      "severity": "warn",
      "options": {
        "ignorePatterns": ["*.py", "*.js"]
      }
    }
  }
}
```

### Example 3: import-circular with max depth

```json
{
  "rules": {
    "import-circular": {
      "severity": "error",
      "options": {
        "maxDepth": 5,
        "allowSelfReference": false
      }
    }
  }
}
```

## Testing Strategy

### Unit Tests

```typescript
describe('ConfigResolver', () => {
  it('resolves base rules', () => {
    const resolver = new ConfigResolver({
      rules: { 'size-error': 'error' }
    });

    expect(resolver.isRuleEnabled('size-error', 'test.md')).toBe(true);
  });

  it('applies file overrides', () => {
    const resolver = new ConfigResolver({
      rules: { 'size-error': 'error' },
      overrides: [
        {
          files: ['*.test.md'],
          rules: { 'size-error': 'off' }
        }
      ]
    });

    expect(resolver.isRuleEnabled('size-error', 'foo.test.md')).toBe(false);
    expect(resolver.isRuleEnabled('size-error', 'foo.md')).toBe(true);
  });

  it('parses rule options', () => {
    const resolver = new ConfigResolver({
      rules: {
        'size-error': {
          severity: 'error',
          options: { maxSize: 60000 }
        }
      }
    });

    const options = resolver.getRuleOptions('size-error', 'test.md');
    expect(options[0]).toEqual({ maxSize: 60000 });
  });
});
```

### Integration Tests

```typescript
describe('Config Integration', () => {
  it('disables rules via config', async () => {
    const validator = new ClaudeMdValidator({
      config: {
        rules: { 'size-error': 'off' }
      }
    });

    // Create large file that would normally fail
    await createFile('CLAUDE.md', 'x'.repeat(100000));

    const result = await validator.validate();
    expect(result.errors).toHaveLength(0); // Rule disabled
  });

  it('applies severity overrides', async () => {
    const validator = new ClaudeMdValidator({
      config: {
        rules: { 'size-error': 'warn' } // Override to warning
      }
    });

    await createFile('CLAUDE.md', 'x'.repeat(100000));

    const result = await validator.validate();
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(1); // Error → Warning
  });

  it('uses custom options', async () => {
    const validator = new ClaudeMdValidator({
      config: {
        rules: {
          'size-error': {
            severity: 'error',
            options: { maxSize: 60000 }
          }
        }
      }
    });

    // File between default (50KB) and custom (60KB)
    await createFile('CLAUDE.md', 'x'.repeat(55000));

    const result = await validator.validate();
    expect(result.errors).toHaveLength(0); // Custom threshold allows it
  });
});
```

## Performance Considerations

### Skip Disabled Rules Early

```typescript
// Before running expensive validation
if (!this.isRuleEnabled('expensive-rule')) {
  return; // Skip entirely
}
```

### Cache Config Resolution

```typescript
// ConfigResolver caches resolved configs per file
private cache = new Map<string, Map<RuleId, ResolvedRuleConfig>>();

resolveForFile(filePath: string): Map<RuleId, ResolvedRuleConfig> {
  if (this.cache.has(filePath)) {
    return this.cache.get(filePath)!;
  }

  const resolved = this.computeResolvedConfig(filePath);
  this.cache.set(filePath, resolved);
  return resolved;
}
```

### Batch Validation

No change needed - validators already process multiple files efficiently.

## Documentation Updates

### User Guide: Configuration

Add section to `docs/configuration.md`:

```markdown
## Rule Options

Many rules support custom options to adjust their behavior:

### size-error

Control maximum file size:

{
  "rules": {
    "size-error": {
      "severity": "error",
      "options": {
        "maxSize": 60000  // 60KB instead of default 50KB
      }
    }
  }
}

### skill-missing-shebang

Ignore specific file types:

{
  "rules": {
    "skill-missing-shebang": {
      "severity": "warn",
      "options": {
        "ignorePatterns": ["*.py", "*.js", "*.ts"]
      }
    }
  }
}
```

### Rule Documentation

Update rule docs template:

```markdown
## Options

This rule supports the following options:

- `maxSize` (number): Maximum file size in bytes. Default: `50000`
- `reportZeroSize` (boolean): Report empty files. Default: `false`

### Example Configuration

{
  "rules": {
    "size-error": {
      "severity": "error",
      "options": {
        "maxSize": 60000,
        "reportZeroSize": true
      }
    }
  }
}
```

## Open Questions

1. **Should we support ESLint's array shorthand?**
   ```json
   "rule": ["error", { option: value }]
   ```
   vs claudelint's object format:
   ```json
   "rule": { "severity": "error", "options": { option: value } }
   ```

   **Recommendation**: Support both for flexibility

2. **How to handle rules without schemas?**
   - Skip validation, pass through as-is
   - Warn users that options aren't validated
   - **Recommendation**: Allow but log warning in verbose mode

3. **Performance impact of config resolution per file?**
   - Cache resolved configs (implemented above)
   - Profile with large projects
   - **Recommendation**: Monitor and optimize if needed

4. **Should severity overrides apply retroactively?**
   Example: Rule reports error, config says "warn"
   - Transform errors → warnings (proposed above)
   - Or keep original severity
   - **Recommendation**: Transform (matches user expectations)

## Success Metrics

**Must Have:**
- [ ] Rules respect "off" setting
- [ ] Severity overrides work (error → warn, warn → error)
- [ ] File overrides apply correctly
- [ ] At least 5 rules support options
- [ ] Zero breaking changes to existing code
- [ ] All existing tests pass

**Nice to Have:**
- [ ] 20+ rules support options
- [ ] Performance within 10% of baseline
- [ ] Config validation catches all option errors
- [ ] Documentation covers all configurable rules

## Timeline

**Week 1: Core Infrastructure**
- Day 1-2: Implement ConfigResolver and RuleContext
- Day 3: Enhance BaseValidator
- Day 4-5: Testing and bug fixes

**Week 2: Rule Updates**
- Day 1-2: Add options to CLAUDE.md rules
- Day 3-4: Add options to Skills rules
- Day 5: Add options to other validators

**Week 3: Polish**
- Day 1-2: Documentation
- Day 3: Performance optimization
- Day 4-5: User testing and feedback

## References

- [ESLint Custom Rules](https://eslint.org/docs/latest/extend/custom-rules)
- [ESLint Configure Rules](https://eslint.org/docs/latest/use/configure/rules)
- [ESLint Rule Context API](https://eslint.org/docs/latest/extend/custom-rules)

## Appendix A: Full Example

Complete example of a rule with options:

```typescript
// 1. Define options interface
interface ImportCircularOptions {
  maxDepth?: number;
  allowSelfReference?: boolean;
  ignorePatterns?: string[];
}

// 2. Register rule with schema
RuleRegistry.register({
  id: 'import-circular',
  name: 'Circular Import Detection',
  description: 'Detects circular import dependencies',
  category: 'CLAUDE.md',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
  schema: z.object({
    maxDepth: z.number().positive().optional(),
    allowSelfReference: z.boolean().optional(),
    ignorePatterns: z.array(z.string()).optional()
  }),
  defaultOptions: {
    maxDepth: 10,
    allowSelfReference: false,
    ignorePatterns: []
  }
});

// 3. Use in validator
async checkCircularImports(file: string): Promise<void> {
  this.setCurrentFile(file);

  // Get options with type safety
  const options = this.getRuleOptions<ImportCircularOptions>('import-circular');
  const maxDepth = options?.maxDepth || 10;
  const allowSelfReference = options?.allowSelfReference || false;
  const ignorePatterns = options?.ignorePatterns || [];

  // Skip if file matches ignore pattern
  if (ignorePatterns.some(p => minimatch(file, p))) {
    return;
  }

  // Detect circular imports using options
  const cycle = this.detectCycle(file, maxDepth, allowSelfReference);

  if (cycle) {
    this.reportError(
      `Circular import detected: ${cycle.join(' → ')}`,
      file,
      undefined,
      'import-circular'
    );
  }
}
```

```json
// 4. Configure in .claudelintrc.json
{
  "rules": {
    "import-circular": {
      "severity": "error",
      "options": {
        "maxDepth": 5,
        "allowSelfReference": true,
        "ignorePatterns": ["*.test.md"]
      }
    }
  }
}
```
