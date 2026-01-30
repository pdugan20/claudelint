# Phase 1 Analysis: Plugin System Usage

**Completed:** 2026-01-30

## Task 1.1: Files That Use PluginLoader

### TypeScript Files (4 files)

#### 1. src/cli/commands/check-all.ts
- **Line 12:** `import { PluginLoader } from '../../utils/plugin-loader';`
- **Lines 150-166:** Plugin loading implementation
  ```typescript
  const pluginLoader = new PluginLoader({
    searchNodeModules: true,
    pluginPrefix: 'claudelint-plugin-',
  });
  const pluginResults = await pluginLoader.loadPlugins(process.cwd());
  ```
- **Action Required:** Remove import and lines 150-166

#### 2. src/utils/plugin-loader.ts
- **Lines 1-256:** Complete implementation of PluginLoader class
- **Exports:**
  - `ValidatorPlugin` interface (line 13)
  - `PluginLoaderOptions` interface (line 25)
  - `PluginLoadResult` interface (line 37)
  - `PluginLoader` class (line 49)
- **Action Required:** Delete entire file

#### 3. tests/utils/plugin-loader.test.ts
- **Lines 1-304:** Complete test suite for PluginLoader
- **Test Coverage:** 95+ test cases
- **Action Required:** Delete entire file

#### 4. src/utils/index.ts
- **Line 6:** `export * from './plugin-loader';`
- **Action Required:** Remove this line

### Markdown Files (2 files)

#### 1. docs/architecture.md
- **Lines 1572-2011:** Complete "Plugin System" section (439 lines)
- **Subsections:**
  - Architecture Overview
  - Plugin Lifecycle
  - Plugin API
  - Plugin Integration Points
  - Plugin Discovery
  - Error Handling and Fallback
  - Security Considerations
  - Plugin Development Guide
  - Example Plugins
  - Plugin Configuration
  - Future Enhancements
- **References ValidatorPlugin interface:** Multiple locations
- **Action Required:** Delete lines 1572-2011, replace with custom rules documentation

#### 2. CHANGELOG.md
- **Line 437:** Mentions "PluginLoader for loading and validation"
- **Context:** Feature announcement
- **Action Required:** Update to reflect removal/replacement

### Summary

**Total Files Affected: 6**
- 4 TypeScript files (3 deletions, 1 modification)
- 2 Markdown files (2 modifications)

**Lines of Code to Remove:**
- TypeScript: ~560 lines (256 + 304 from tests)
- Documentation: ~440 lines

**Exports to Remove:**
- `PluginLoader` class
- `ValidatorPlugin` interface
- `PluginLoaderOptions` interface
- `PluginLoadResult` interface

**No breaking changes for users** - PluginLoader was never used by third parties.

---

## Task 1.2: Files That Reference plugin-development.md

### Direct References (checked via grep)

Searching for: `plugin-development`

#### Result: docs/architecture.md
- **Line 171:** `- See [plugin-development.md](./plugin-development.md) for examples`
- **Context:** Section on "For Plugin Developers"
- **Action Required:** Remove this line, update section to reference custom-rules.md

### Files That Should Reference Custom Rules Instead

After deletion of plugin-development.md, these files will need updates:
1. **README.md** - Replace plugin references with custom rules
2. **docs/architecture.md** - Update "For Plugin Developers" section
3. **Any other docs/** files referencing plugins

---

## Task 1.3: Plugin-Related Exports Inventory

### Current Exports (src/utils/index.ts)

```typescript
export * from './plugin-loader';  // LINE 6 - TO BE REMOVED
```

This line exports:
- `PluginLoader` class
- `ValidatorPlugin` interface
- `PluginLoaderOptions` interface
- `PluginLoadResult` interface

### Exports Used Externally

**Analysis:** None

- No npm packages depend on @pdugan20/claudelint's plugin system
- PluginLoader was never documented as a public API
- No third-party plugins exist using this interface

### New Exports to Add (Future)

```typescript
export * from './custom-rule-loader';  // TO BE ADDED
```

Will export:
- `CustomRuleLoader` class
- `CustomRule` type (alias for Rule)
- `CustomRuleLoadResult` interface

---

## Task 1.4: Verify plugin.json Validation is Separate

### Plugin Validation System (KEEP - Different System)

#### Purpose
Validates Claude Code plugin manifests (plugin.json files). This is **NOT** the third-party extension system.

#### Files to KEEP
1. **src/validators/plugin.ts** (56 lines)
   - Purpose: Validates plugin.json for Claude Code plugins
   - Uses: PluginManifestSchema from schemas.ts
   - Auto-executes: All 12 plugin/* rules

2. **src/validators/schemas.ts** (partial)
   - Contains: `PluginManifestSchema`, `MarketplaceMetadataSchema`
   - Used by: plugin.ts validator

3. **src/rules/plugin/** (12 rule files)
   - plugin-name-required.ts
   - plugin-version-required.ts
   - plugin-description-required.ts
   - plugin-invalid-version.ts
   - plugin-invalid-manifest.ts
   - plugin-json-wrong-location.ts
   - plugin-components-wrong-location.ts
   - plugin-marketplace-files-not-found.ts
   - plugin-missing-file.ts
   - plugin-dependency-invalid-version.ts
   - plugin-circular-dependency.ts
   - commands-in-plugin-deprecated.ts

4. **tests/validators/plugin.test.ts**
   - Tests for plugin.json validation

5. **tests/integration/plugin.integration.test.ts**
   - Integration tests

6. **.claude/skills/validate-plugin/**
   - Skill for validating plugin manifests

7. **plugin.json** (root)
   - Claudelint's own plugin manifest

### Verification: Systems Are Separate [x]

| Feature | Third-Party Plugin System (DELETE) | Plugin Validation (KEEP) |
|---------|-----------------------------------|------------------------|
| Purpose | Load npm packages to extend claudelint | Validate Claude Code plugin.json files |
| File | src/utils/plugin-loader.ts | src/validators/plugin.ts |
| Interface | ValidatorPlugin | PluginManifestSchema (Zod) |
| Usage | None (unused) | Active (validates claudelint itself) |
| Rules | N/A | 12 rules in src/rules/plugin/ |
| Tests | tests/utils/plugin-loader.test.ts | tests/validators/plugin.test.ts |

**Confirmation:** These are completely separate systems. Deleting PluginLoader will NOT affect plugin.json validation.

---

## Task 1.5: Custom Rules Architecture Design

### Design Overview

Replace third-party plugin system (PluginLoader) with a simpler custom rules directory.

### Directory Structure

```
.claudelint/
├── rules/
│   ├── my-custom-rule.ts          # Custom rule 1
│   ├── another-rule.ts            # Custom rule 2
│   └── team-standards/            # Organized by subdirectory
│       ├── naming-conventions.ts
│       └── security-checks.ts
└── rules.d.ts                     # TypeScript definitions (optional)
```

### Custom Rule File Format

```typescript
// .claudelint/rules/my-custom-rule.ts
import type { Rule } from '@pdugan20/claudelint';

export const rule: Rule = {
  meta: {
    id: 'my-custom-rule',
    name: 'My Custom Rule',
    description: 'Validates custom requirement',
    category: 'Custom',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
  },
  validate: async (context) => {
    const { filePath, fileContent } = context;

    // Validation logic
    if (fileContent.includes('FORBIDDEN')) {
      context.report({
        message: 'File contains forbidden content',
        line: 1,
        fix: 'Remove the FORBIDDEN keyword',
      });
    }
  },
};
```

### CustomRuleLoader Implementation

```typescript
// src/utils/custom-rule-loader.ts

export interface CustomRuleLoadResult {
  filePath: string;
  rule?: Rule;
  success: boolean;
  error?: string;
}

export interface CustomRuleLoaderOptions {
  customRulesPath?: string;  // Default: .claudelint/rules
  enableCustomRules?: boolean;  // Default: true
}

export class CustomRuleLoader {
  private options: Required<CustomRuleLoaderOptions>;
  private loadedRules = new Map<string, Rule>();

  constructor(options: CustomRuleLoaderOptions = {}) {
    this.options = {
      customRulesPath: options.customRulesPath || '.claudelint/rules',
      enableCustomRules: options.enableCustomRules ?? true,
    };
  }

  /**
   * Load all custom rules from the configured directory
   */
  async loadCustomRules(basePath: string): Promise<CustomRuleLoadResult[]> {
    const results: CustomRuleLoadResult[] = [];

    if (!this.options.enableCustomRules) {
      return results;
    }

    const rulesDir = resolve(basePath, this.options.customRulesPath);

    if (!existsSync(rulesDir)) {
      return results;
    }

    // Find all .ts and .js files (not .d.ts, not .test.ts)
    const ruleFiles = this.findRuleFiles(rulesDir);

    for (const file of ruleFiles) {
      results.push(await this.loadRule(file));
    }

    return results;
  }

  /**
   * Load a single custom rule file
   */
  private async loadRule(filePath: string): Promise<CustomRuleLoadResult> {
    try {
      // Import the rule file
      const ruleModule = require(filePath);

      // Validate exports 'rule'
      if (!ruleModule.rule) {
        return {
          filePath,
          success: false,
          error: 'File must export a named "rule" object',
        };
      }

      const rule = ruleModule.rule;

      // Validate implements Rule interface
      if (!this.isValidRule(rule)) {
        return {
          filePath,
          success: false,
          error: 'Rule does not implement Rule interface',
        };
      }

      // Check for ID conflicts
      if (this.loadedRules.has(rule.meta.id)) {
        return {
          filePath,
          success: false,
          error: `Rule ID "${rule.meta.id}" conflicts with existing rule`,
        };
      }

      // Register rule
      this.loadedRules.set(rule.meta.id, rule);
      RuleRegistry.register({
        ...rule.meta,
        source: 'custom',
      });

      return {
        filePath,
        rule,
        success: true,
      };
    } catch (error) {
      return {
        filePath,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Find all rule files in directory (recursive)
   */
  private findRuleFiles(directory: string): string[] {
    const files: string[] = [];

    const entries = readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(directory, entry.name);

      if (entry.isDirectory()) {
        // Recurse into subdirectories
        files.push(...this.findRuleFiles(fullPath));
      } else if (entry.isFile()) {
        // Include .ts and .js files, exclude .d.ts, .test.ts, .spec.ts
        if (
          (entry.name.endsWith('.ts') || entry.name.endsWith('.js')) &&
          !entry.name.endsWith('.d.ts') &&
          !entry.name.endsWith('.test.ts') &&
          !entry.name.endsWith('.spec.ts')
        ) {
          files.push(fullPath);
        }
      }
    }

    return files;
  }

  /**
   * Validate rule implements Rule interface
   */
  private isValidRule(rule: unknown): rule is Rule {
    if (!rule || typeof rule !== 'object') {
      return false;
    }

    const r = rule as Record<string, unknown>;

    return (
      typeof r.meta === 'object' &&
      typeof r.validate === 'function'
    );
  }

  /**
   * Get loaded rules
   */
  getLoadedRules(): Rule[] {
    return Array.from(this.loadedRules.values());
  }

  /**
   * Clear loaded rules (for testing)
   */
  clear(): void {
    this.loadedRules.clear();
  }
}
```

### Integration Points

#### 1. CLI Integration (check-all.ts)

Replace PluginLoader usage:

```typescript
// BEFORE (lines 150-166):
const pluginLoader = new PluginLoader({ ... });
const pluginResults = await pluginLoader.loadPlugins(process.cwd());

// AFTER:
const customRuleLoader = new CustomRuleLoader({
  customRulesPath: '.claudelint/rules',
  enableCustomRules: true,
});
const customRuleResults = await customRuleLoader.loadCustomRules(process.cwd());

if (options.verbose && customRuleResults.length > 0) {
  const successful = customRuleResults.filter(r => r.success);
  const failed = customRuleResults.filter(r => !r.success);

  logger.success(`Loaded ${successful.length} custom rule(s)`);

  if (failed.length > 0) {
    logger.warn(`Failed to load ${failed.length} custom rule(s):`);
    for (const failure of failed) {
      logger.detail(`- ${failure.filePath}: ${failure.error}`);
    }
  }
}
```

#### 2. Rule Registry Integration

Custom rules register automatically via `RuleRegistry.register()` in the loader.

#### 3. Configuration Integration

Use existing .claudelintrc.json format:

```json
{
  "rules": {
    "my-custom-rule": "error",
    "another-rule": ["warn", { "option": "value" }]
  },
  "customRules": {
    "enabled": true,
    "path": ".claudelint/rules"
  }
}
```

### Benefits Over Plugin System

| Feature | Plugin System (Old) | Custom Rules (New) |
|---------|-------------------|-------------------|
| Complexity | High (validators, registration) | Low (just rules) |
| Distribution | npm package required | Local files |
| Setup | Create package, publish | Create file |
| Learning Curve | Steep | Gentle |
| Type Safety | Yes | Yes |
| Testing | Complex | Simple |
| Documentation | Wrong (fixed now) | Accurate |
| Actual Usage | 0 plugins | Future use |

### Migration Path

No migration needed - no third-party plugins exist.

If someone did create a plugin:
1. Extract rule definitions from plugin
2. Copy rules to `.claudelint/rules/`
3. Remove npm package

### Testing Strategy

```typescript
// tests/utils/custom-rule-loader.test.ts
describe('CustomRuleLoader', () => {
  it('loads valid custom rule', async () => {
    const loader = new CustomRuleLoader();
    const results = await loader.loadCustomRules('./fixtures/custom-rules');

    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(true);
    expect(results[0].rule?.meta.id).toBe('test-rule');
  });

  it('rejects invalid rule', async () => {
    // Test missing 'rule' export
    // Test invalid interface
    // Test ID conflicts
  });

  it('discovers rules recursively', async () => {
    // Test subdirectory discovery
  });

  it('skips .d.ts and .test.ts files', async () => {
    // Test file filtering
  });
});
```

### Documentation

Create `docs/custom-rules.md` with:
1. Quick start
2. Rule structure
3. File organization
4. Configuration
5. Testing
6. Best practices
7. Examples
8. Troubleshooting

---

## Phase 1 Completion Summary

[x] **Task 1.1:** Documented all files using PluginLoader (6 files)
[x] **Task 1.2:** Documented plugin-development.md references (1 file)
[x] **Task 1.3:** Created plugin-related exports inventory
[x] **Task 1.4:** Verified plugin.json validation is separate system
[x] **Task 1.5:** Designed custom rules architecture

**Ready for Phase 2:** Delete Plugin System Infrastructure
