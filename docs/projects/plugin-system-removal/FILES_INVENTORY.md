# Files Inventory: Plugin System

This document inventories all files related to the plugin systems (both third-party and Claude Code).

## Files to DELETE

### Third-Party Plugin System (PluginLoader)
These files are part of the unused third-party plugin system and will be deleted:

1. **src/utils/plugin-loader.ts**
   - Purpose: Loads third-party npm packages (claudelint-plugin-*)
   - Lines: 256
   - Dependencies: ValidatorRegistry
   - Dependents: check-all.ts
   - Status: DELETE

2. **tests/utils/plugin-loader.test.ts**
   - Purpose: Tests for PluginLoader
   - Lines: 304
   - Status: DELETE

3. **docs/plugin-development.md**
   - Purpose: Documents how to create plugins (WRONG INTERFACE)
   - Lines: 690
   - Status: DELETE

4. **docs/plugin-usage.md**
   - Purpose: Documents both PluginLoader AND Claude Code plugin usage
   - Lines: 359
   - Status: NEEDS REVIEW (may keep Claude Code sections)
   - Action: Check if it's only about Claude Code plugin usage, then decide

## Files to KEEP

### Claude Code Plugin Validation System
These files validate plugin.json (Claude Code plugin manifests) and must be kept:

1. **src/validators/plugin.ts**
   - Purpose: Validates plugin.json files for Claude Code plugins
   - Lines: 56
   - Status: KEEP

2. **src/validators/schemas.ts** (partial)
   - Contains: PluginManifestSchema, MarketplaceMetadataSchema
   - Purpose: Zod schemas for plugin.json validation
   - Status: KEEP (these schemas)

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
   - Status: KEEP ALL

4. **tests/validators/plugin.test.ts**
   - Purpose: Tests plugin.json validation
   - Status: KEEP

5. **tests/integration/plugin.integration.test.ts**
   - Purpose: Integration tests for plugin validation
   - Status: KEEP

6. **.claude/skills/validate-plugin/**
   - Purpose: Skill for validating plugin manifests
   - Status: KEEP

7. **plugin.json** (root)
   - Purpose: Claudelint's own Claude Code plugin manifest
   - Status: KEEP

## Files to MODIFY

1. **src/cli/commands/check-all.ts**
   - Current: Imports and uses PluginLoader (lines 12, 149-166)
   - Action: Remove PluginLoader import and usage
   - Add: Custom rule loading (future)

2. **src/utils/index.ts**
   - Current: Exports PluginLoader
   - Action: Remove PluginLoader export
   - Add: Export CustomRuleLoader (future)

3. **README.md**
   - Current: May reference plugin system
   - Action: Remove plugin system references, add custom rules section

4. **docs/** (various)
   - Action: Search for references to plugin-development.md and update

## Files to CREATE

1. **src/utils/custom-rule-loader.ts**
   - Purpose: Load custom rules from .claudelint/rules/
   - Estimated Lines: ~150

2. **tests/utils/custom-rule-loader.test.ts**
   - Purpose: Test custom rule loading
   - Estimated Lines: ~200

3. **docs/custom-rules.md**
   - Purpose: Document custom rules system
   - Estimated Lines: ~400

4. **tests/fixtures/custom-rules/** (directory)
   - Purpose: Test fixtures for custom rules
   - Files: Multiple example rules

## Search Commands for Review

### Find PluginLoader references
```bash
grep -r "PluginLoader" --include="*.ts" --include="*.md" .
```

### Find ValidatorPlugin references
```bash
grep -r "ValidatorPlugin" --include="*.ts" --include="*.md" .
```

### Find plugin-development.md references
```bash
grep -r "plugin-development" --include="*.md" .
```

### Find "third-party plugin" references
```bash
grep -r "third-party plugin" --include="*.md" .
```

## Import/Export Analysis

### Current Exports (to be removed)
```typescript
// src/utils/index.ts
export { PluginLoader, ValidatorPlugin } from './plugin-loader';
```

### Current Imports (to be removed)
```typescript
// src/cli/commands/check-all.ts
import { PluginLoader } from '../../utils/plugin-loader';
```

## Type Definitions Impact

### Types to Remove
- `ValidatorPlugin` interface
- `PluginLoaderOptions` interface
- `PluginLoadResult` interface

### Types to Add
- `CustomRule` type (alias for Rule)
- `CustomRuleLoadResult` interface
- `CustomRuleLoaderOptions` interface

## Dependencies

### External Dependencies
No external npm packages are affected by this change.

### Internal Dependencies

**PluginLoader depends on:**
- ValidatorRegistry (will remain)
- fs, path (standard library)

**PluginLoader is used by:**
- check-all.ts (will be updated)

## Test Coverage

### Current Coverage (to be removed)
- plugin-loader.test.ts: 95 test cases
- Coverage: 100% of plugin-loader.ts

### Expected Coverage (to be added)
- custom-rule-loader.test.ts: ~80 test cases
- Coverage: 100% of custom-rule-loader.ts

## Configuration Impact

### No Changes Required
- `.claudelintrc.json` format unchanged
- Rule configuration unchanged
- Ignore patterns unchanged

### Future Configuration
Possible addition:
```json
{
  "customRulesPath": ".claudelint/rules",
  "enableCustomRules": true
}
```

## Breaking Changes

### API Changes
- `PluginLoader` class removed (not documented as public API)
- `ValidatorPlugin` interface removed (not used by anyone)

### User Impact
- Zero impact (no one uses the plugin system)
- Existing configs work unchanged
- No migration needed

## Risk Analysis

### High Risk
- None identified

### Medium Risk
1. Accidentally deleting plugin.json validation
   - Mitigation: Clear inventory, careful testing

2. Breaking references in docs
   - Mitigation: Comprehensive search and replace

### Low Risk
1. Test coverage temporarily drops
   - Mitigation: Write new tests before deleting old ones

2. Build breaks during transition
   - Mitigation: Small, incremental commits

## Verification Checklist

After deletions:
- [ ] `npm run build` succeeds
- [ ] `npm test` passes (100% coverage)
- [ ] `claudelint check-all` works
- [ ] Plugin validation still works
- [ ] No import errors
- [ ] No broken doc links
- [ ] TypeScript compilation succeeds
