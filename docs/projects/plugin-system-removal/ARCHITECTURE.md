# Architecture: Custom Rules System

## Overview

This document describes the new custom rules loading system that replaces the third-party plugin system.

## Current State (To Be Removed)

### PluginLoader System
```typescript
// Third-party plugin system (COMPLEX)
interface ValidatorPlugin {
  name: string;
  version: string;
  register: (registry: typeof ValidatorRegistry) => void;
}

// Plugin author must:
// 1. Create npm package: claudelint-plugin-*
// 2. Implement ValidatorPlugin interface
// 3. Register validators via callback
// 4. Publish to npm
```

**Problems:**
- Too complex for simple rule additions
- Requires understanding of validator architecture
- Requires npm package creation
- Documentation was wrong (documented non-existent interface)
- No one actually uses it

## New State (To Be Implemented)

### Custom Rules Directory
```typescript
// Simple custom rules (EASY)
// File: .claudelint/rules/my-custom-rule.ts

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
    // Simple validation logic
    if (context.fileContent.includes('FORBIDDEN')) {
      context.report({
        message: 'File contains forbidden content',
        line: 1,
      });
    }
  },
};
```

**Benefits:**
- Same format as built-in rules
- No npm package needed
- No complex registration
- Works with existing infrastructure
- Easy to test and debug

## Directory Structure

```
.claudelint/
├── rules/
│   ├── my-custom-rule.ts       # Custom rule 1
│   ├── another-rule.ts         # Custom rule 2
│   └── team-standards.ts       # Custom rule 3
└── rules.d.ts                  # TypeScript definitions (optional)
```

## Custom Rule Loader Design

### File Discovery
```typescript
class CustomRuleLoader {
  /**
   * Discovers custom rules from .claudelint/rules/
   *
   * - Searches for .ts and .js files
   * - Ignores .d.ts declaration files
   * - Ignores test files (*.test.ts, *.spec.ts)
   * - Auto-registers discovered rules
   */
  async loadCustomRules(basePath: string): Promise<LoadResult[]>
}
```

### Rule Validation
Custom rules must:
1. Export a `rule` named export
2. Implement the `Rule` interface
3. Have unique rule ID (no conflicts with built-in rules)
4. Have valid metadata (id, name, description, etc.)

### Error Handling
- Invalid rules are logged but don't fail validation
- Syntax errors show helpful error messages
- Duplicate rule IDs are detected and rejected

### Integration Points

#### 1. Rule Registry
```typescript
// src/utils/rule-registry.ts
// Add custom rules after loading built-in rules

import { loadCustomRules } from './custom-rule-loader';

export function initializeRules(basePath: string) {
  // Load built-in rules (existing)
  loadBuiltInRules();

  // Load custom rules (new)
  const customRules = await loadCustomRules(basePath);
  customRules.forEach(rule => RuleRegistry.register(rule));
}
```

#### 2. CLI Commands
```typescript
// src/cli/commands/check-all.ts
// Load custom rules before running validators

await initializeRules(process.cwd());
```

#### 3. Configuration
```json
// .claudelintrc.json
// Custom rules use same config as built-in rules
{
  "rules": {
    "my-custom-rule": "error",
    "another-rule": ["warn", { "option": "value" }]
  }
}
```

## Rule Categories

Custom rules can use existing categories or define new ones:

**Built-in Categories:**
- ClaudeMd
- Skills
- Settings
- Hooks
- MCP
- Plugin

**Custom Categories:**
- Custom (default for custom rules)
- Team (team-specific standards)
- Project (project-specific rules)

## TypeScript Support

### Type Definitions
Users can import types from the package:

```typescript
import type { Rule, RuleContext, RuleMetadata } from '@pdugan20/claudelint';
```

### Compilation
- TypeScript custom rules are compiled on-the-fly (using ts-node or similar)
- Or users can pre-compile to .js
- Both .ts and .js are supported

## Testing Custom Rules

### Unit Testing
Users can test their custom rules:

```typescript
import { rule } from '../.claudelint/rules/my-custom-rule';

describe('my-custom-rule', () => {
  it('should detect forbidden content', async () => {
    const violations: RuleViolation[] = [];
    const context = {
      filePath: 'test.txt',
      fileContent: 'FORBIDDEN content',
      config: {},
      report: (v) => violations.push(v),
    };

    await rule.validate(context);

    expect(violations).toHaveLength(1);
  });
});
```

### Integration Testing
```bash
# Test with actual claudelint
claudelint check-all --verbose
```

## Migration Path

### For Users (None)
- No breaking changes for users
- Existing configs work unchanged
- Plugin validation still works

### For Plugin Authors (Theoretical)
Since no one actually created third-party plugins:
- No migration needed
- If someone did, they can convert to custom rules (much simpler)

## Documentation Structure

### docs/custom-rules.md
1. Overview
2. Quick Start
3. Rule Structure
4. File Organization
5. Configuration
6. Testing
7. Best Practices
8. Examples
9. Troubleshooting

### README.md Updates
- Remove plugin system references
- Add "Custom Rules" section
- Link to custom-rules.md

## Performance Considerations

- Custom rules loaded once at startup
- Same performance as built-in rules
- No npm resolution overhead
- Minimal impact on validation time

## Security Considerations

- Custom rules run in same process (trusted code)
- Users should review custom rules from third parties
- No sandboxing (same as ESLint plugins)

## Backwards Compatibility

### Breaking Changes
- `PluginLoader` class removed (was not in public API)
- `docs/plugin-development.md` removed (was incorrect)
- No breaking changes for actual users (no one used plugin system)

### Non-Breaking
- Plugin validation unchanged
- All existing rules work
- Configuration format unchanged
- CLI commands unchanged

## Future Enhancements

Possible future additions:
1. Custom rule templates/scaffolding
2. Custom rule validation/linting
3. Custom rule marketplace/sharing
4. Hot-reload during development

## Comparison Table

| Feature | Old (PluginLoader) | New (Custom Rules) |
|---------|-------------------|-------------------|
| Complexity | High (validators) | Low (rules) |
| Setup | npm package | Local file |
| Distribution | npm publish | Git/copy file |
| Learning Curve | Steep | Gentle |
| Type Safety | Yes | Yes |
| Testing | Complex | Simple |
| Documentation | Wrong | Accurate |
| Real Usage | 0 plugins | Future use |

## Decision Log

### Decision 1: Use .claudelint/rules/ directory
**Rationale:** Keeps custom rules separate from built-in rules, follows convention of dot-prefixed config directories.

**Alternatives Considered:**
- `.claudelint-rules/` - Too similar to `.claudelintrc`
- `rules/` - Conflicts with src/rules/
- `custom-rules/` - Too verbose

**Decision:** Use `.claudelint/rules/`

### Decision 2: Auto-discover rule files
**Rationale:** Simplest for users, no registration required.

**Alternatives Considered:**
- Explicit registration in config
- Single index file with imports

**Decision:** Auto-discover .ts and .js files

### Decision 3: Keep plugin.json validation
**Rationale:** Different system (validates Claude Code plugins), still needed.

**Alternatives Considered:**
- Remove everything plugin-related
- Rename to avoid confusion

**Decision:** Keep as-is, clarify in docs

## Success Metrics

- [ ] Custom rules system implemented
- [ ] 100% test coverage maintained
- [ ] Documentation complete and accurate
- [ ] Zero breaking changes for users
- [ ] Simpler than old plugin system
- [ ] Working examples provided
