# Plugin Development Guide

This guide covers how to create custom claudelint plugins that add new validation rules.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Plugin Structure](#plugin-structure)
- [Creating Rules](#creating-rules)
- [Plugin API Reference](#plugin-api-reference)
- [Testing Your Plugin](#testing-your-plugin)
- [Publishing Your Plugin](#publishing-your-plugin)
- [Best Practices](#best-practices)

## Overview

The claudelint plugin system allows you to extend the tool with custom validation rules. Plugins are npm packages that:

- Follow a naming convention (`claudelint-plugin-*`)
- Export rules following the Rule interface
- Use ESLint-style plugin architecture

**Key Concept:** Plugins export **rules**, not validators. Validators are internal orchestrators that run rules.

## Quick Start

### 1. Create a New Package

```bash
mkdir claudelint-plugin-myplugin
cd claudelint-plugin-myplugin
npm init -y
```

### 2. Install Dependencies

```bash
npm install --save-peer @pdugan20/claudelint
npm install --save-dev @pdugan20/claudelint typescript
```

### 3. Create Plugin Entry Point

Create `src/index.ts`:

```typescript
import type { Rule, ClaudeLintPlugin } from '@pdugan20/claudelint';

// Define a custom rule
const myCustomRule: Rule = {
  meta: {
    id: 'my-custom-rule',
    name: 'My Custom Rule',
    description: 'Validates custom requirement',
    category: 'Skills', // Or your custom category
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
  },

  validate: async (context) => {
    const { filePath, fileContent } = context;

    // Only run on specific files
    if (!filePath.endsWith('.custom')) {
      return;
    }

    // Your validation logic
    if (fileContent.includes('FORBIDDEN')) {
      context.report({
        message: 'File contains forbidden content',
        line: 1,
        fix: 'Remove the FORBIDDEN keyword',
      });
    }
  },
};

// Export plugin with rules
const plugin: ClaudeLintPlugin = {
  name: 'claudelint-plugin-myplugin',
  version: '1.0.0',
  rules: {
    'my-custom-rule': myCustomRule,
  },
};

export default plugin;
```

### 4. Build and Test

```bash
npx tsc
npm link
cd /path/to/test/project
npm link claudelint-plugin-myplugin
claudelint check-all
```

## Plugin Structure

### Required Files

```text
claudelint-plugin-myplugin/
├── package.json          # Package metadata
├── src/
│   ├── index.ts         # Plugin entry point
│   └── rules/           # Individual rule files (optional)
│       ├── rule-one.ts
│       └── rule-two.ts
├── dist/                # Compiled JavaScript
│   └── index.js
├── tsconfig.json        # TypeScript config
└── README.md            # Documentation
```

### package.json Requirements

```json
{
  "name": "claudelint-plugin-myplugin",
  "version": "1.0.0",
  "description": "Custom rules for claudelint",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "keywords": ["claudelint", "claudelint-plugin"],
  "peerDependencies": {
    "@pdugan20/claudelint": ">=1.0.0"
  }
}
```

**Important**: Package name must start with `claudelint-plugin-` for automatic discovery.

## Creating Rules

### Rule Structure

Every rule follows this interface:

```typescript
import type { Rule } from '@pdugan20/claudelint';

export const myRule: Rule = {
  // Metadata
  meta: {
    id: 'rule-id',                    // Unique identifier (kebab-case)
    name: 'Human Readable Name',       // Display name
    description: 'What this rule checks', // Brief description
    category: 'Skills',                // Category (ClaudeMd, Skills, etc.)
    severity: 'error',                 // 'error' or 'warn'
    fixable: false,                    // Can auto-fix?
    deprecated: false,                 // Is deprecated?
    since: '1.0.0',                    // Version introduced
    docUrl: 'https://...',             // Documentation URL (optional)
  },

  // Validation logic
  validate: async (context) => {
    const { filePath, fileContent, config } = context;

    // Your validation logic here
    if (someCondition) {
      context.report({
        message: 'Clear description of the issue',
        line: 42,  // Optional: line number
        fix: 'How to fix the issue',  // Optional
      });
    }
  },
};
```

### File Type Filtering

Most rules should only run on specific file types:

```typescript
validate: async (context) => {
  const { filePath, fileContent } = context;

  // Only validate SKILL.md files
  if (!filePath.endsWith('SKILL.md')) {
    return;
  }

  // Validation logic
}
```

### Parsing File Content

For JSON files:

```typescript
validate: async (context) => {
  const { filePath, fileContent } = context;

  if (!filePath.endsWith('.json')) return;

  let config;
  try {
    config = JSON.parse(fileContent);
  } catch {
    return; // JSON parse errors handled by schema validation
  }

  // Validate parsed config
  if (!config.requiredField) {
    context.report({
      message: 'Missing required field: requiredField',
    });
  }
}
```

For markdown files with frontmatter:

```typescript
import { extractFrontmatter } from '@pdugan20/claudelint/utils';

validate: async (context) => {
  const { filePath, fileContent } = context;

  if (!filePath.endsWith('.md')) return;

  const { frontmatter, body } = extractFrontmatter(fileContent);

  if (!frontmatter?.name) {
    context.report({
      message: 'Frontmatter missing name field',
      line: 1,
    });
  }
}
```

### Reporting Violations

```typescript
// Simple error
context.report({
  message: 'File is invalid',
});

// Error with line number
context.report({
  message: 'Invalid syntax on this line',
  line: 42,
});

// Error with fix suggestion
context.report({
  message: 'Missing required field',
  line: 10,
  fix: 'Add "version": "1.0.0" to frontmatter',
});
```

### Organizing Multiple Rules

For plugins with multiple rules:

```typescript
// src/rules/rule-one.ts
export const ruleOne: Rule = { /* ... */ };

// src/rules/rule-two.ts
export const ruleTwo: Rule = { /* ... */ };

// src/index.ts
import { ruleOne } from './rules/rule-one';
import { ruleTwo } from './rules/rule-two';

const plugin: ClaudeLintPlugin = {
  name: 'claudelint-plugin-myplugin',
  version: '1.0.0',
  rules: {
    'rule-one': ruleOne,
    'rule-two': ruleTwo,
  },
};

export default plugin;
```

## Plugin API Reference

### ClaudeLintPlugin Interface

```typescript
interface ClaudeLintPlugin {
  /** Plugin name (should match package name) */
  name: string;

  /** Plugin version (semver) */
  version: string;

  /** Map of rule IDs to rule implementations */
  rules: Record<string, Rule>;

  /** Optional: Plugin-level configuration */
  configs?: {
    recommended?: ClaudeLintConfig;
    strict?: ClaudeLintConfig;
  };
}
```

### Rule Interface

```typescript
interface Rule {
  meta: RuleMeta;
  validate: (context: RuleContext) => Promise<void>;
}

interface RuleMeta {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'error' | 'warn';
  fixable: boolean;
  deprecated: boolean;
  since: string;
  docUrl?: string;
  replacedBy?: string[];
}

interface RuleContext {
  filePath: string;
  fileContent: string;
  config: ClaudeLintConfig;
  report: (violation: RuleViolation) => void;
}

interface RuleViolation {
  message: string;
  line?: number;
  fix?: string;
}
```

### Preset Configs (Optional)

Plugins can export preset configurations:

```typescript
const plugin: ClaudeLintPlugin = {
  name: 'claudelint-plugin-myplugin',
  version: '1.0.0',
  rules: {
    'rule-one': ruleOne,
    'rule-two': ruleTwo,
  },
  configs: {
    recommended: {
      rules: {
        'myplugin/rule-one': 'error',
        'myplugin/rule-two': 'warn',
      },
    },
    strict: {
      rules: {
        'myplugin/rule-one': 'error',
        'myplugin/rule-two': 'error',
      },
    },
  },
};
```

Users can then extend these configs:

```json
{
  "extends": ["plugin:myplugin/recommended"]
}
```

## Testing Your Plugin

### Unit Tests

Create tests for your rules:

```typescript
import { myRule } from '../src/rules/my-rule';

describe('myRule', () => {
  it('should detect issues', async () => {
    const violations: RuleViolation[] = [];
    const context = {
      filePath: 'test.custom',
      fileContent: 'FORBIDDEN content',
      config: {},
      report: (v: RuleViolation) => violations.push(v),
    };

    await myRule.validate(context);

    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('forbidden');
  });

  it('should pass valid files', async () => {
    const violations: RuleViolation[] = [];
    const context = {
      filePath: 'test.custom',
      fileContent: 'Valid content',
      config: {},
      report: (v: RuleViolation) => violations.push(v),
    };

    await myRule.validate(context);

    expect(violations).toHaveLength(0);
  });
});
```

### Integration Tests

Test with actual claudelint CLI:

```bash
# Link your plugin
npm link

# Create a test project
mkdir test-project
cd test-project
npm link claudelint-plugin-myplugin

# Configure claudelint to use your plugin
echo '{ "plugins": ["myplugin"] }' > .claudelintrc.json

# Run claudelint
claudelint check-all
```

## Publishing Your Plugin

### 1. Prepare for Publication

```bash
# Build
npm run build

# Test
npm test

# Check package contents
npm pack --dry-run
```

### 2. Publish to npm

```bash
npm publish
```

### 3. Document Usage

Include clear usage instructions in your README:

- Installation steps
- Rule descriptions
- Configuration options
- Examples of valid and invalid code

Example README structure:

```markdown
# claudelint-plugin-myplugin

Custom validation rules for claudelint.

## Installation

npm install --save-dev claudelint-plugin-myplugin

## Usage

Add to .claudelintrc.json:

{
  "plugins": ["myplugin"],
  "rules": {
    "myplugin/rule-one": "error",
    "myplugin/rule-two": "warn"
  }
}

## Rules

- `myplugin/rule-one` - Description of rule one
- `myplugin/rule-two` - Description of rule two
```

## Best Practices

### Performance

- **File Filtering**: Return early for irrelevant files
- **Async Operations**: Use async/await for I/O operations
- **Avoid Heavy Processing**: Keep rules focused and fast

```typescript
validate: async (context) => {
  // Early return for irrelevant files
  if (!context.filePath.endsWith('.custom')) {
    return;
  }

  // Fast validation logic
  if (context.fileContent.length > 1000000) {
    context.report({ message: 'File too large' });
  }
}
```

### Error Messages

- **Be Specific**: Clearly describe what's wrong
- **Provide Context**: Include line numbers when possible
- **Suggest Fixes**: Use the `fix` field to help users

```typescript
context.report({
  message: 'Missing required field "version" in frontmatter',
  line: 1,
  fix: 'Add "version: 1.0.0" to the frontmatter',
});
```

### Rule Naming

- Use kebab-case for rule IDs: `my-custom-rule`
- Prefix plugin rules with plugin name: `myplugin/my-rule`
- Be descriptive: `missing-version` not `mv`

### Type Safety

- Use TypeScript for all plugin code
- Leverage the provided type interfaces
- Define clear types for your rule options

### Documentation

- Document each rule thoroughly
- Provide examples of violations
- Explain rationale for each rule
- Include migration guides for breaking changes

### Versioning

Follow semantic versioning:

- **Major**: Breaking changes to rule behavior
- **Minor**: New rules or features
- **Patch**: Bug fixes

## Examples

### Simple Rule

```typescript
const noTodoRule: Rule = {
  meta: {
    id: 'no-todo',
    name: 'No TODO Comments',
    description: 'Disallow TODO comments in production files',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
  },

  validate: async (context) => {
    const { fileContent } = context;
    const lines = fileContent.split('\n');

    lines.forEach((line, index) => {
      if (line.includes('TODO')) {
        context.report({
          message: 'TODO comment found - please resolve before production',
          line: index + 1,
          fix: 'Remove TODO comment or create a tracked issue',
        });
      }
    });
  },
};
```

### Complex Rule with Parsing

```typescript
import { extractFrontmatter } from '@pdugan20/claudelint/utils';

const skillVersionRule: Rule = {
  meta: {
    id: 'skill-version-format',
    name: 'Skill Version Format',
    description: 'Skill version must follow semver',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
  },

  validate: async (context) => {
    const { filePath, fileContent } = context;

    if (!filePath.endsWith('SKILL.md')) return;

    const { frontmatter } = extractFrontmatter(fileContent);
    const version = frontmatter?.version;

    if (!version) {
      context.report({
        message: 'Skill missing version field',
        line: 1,
        fix: 'Add "version: 1.0.0" to frontmatter',
      });
      return;
    }

    const semverRegex = /^\d+\.\d+\.\d+$/;
    if (!semverRegex.test(version)) {
      context.report({
        message: `Invalid version format: ${version}`,
        line: 1,
        fix: 'Use semantic versioning format (e.g., 1.0.0)',
      });
    }
  },
};
```

## Migration from Old Plugin System

If you have a plugin using the old validator-based system:

**Old (Validator-based):**
```typescript
class MyValidator extends BaseValidator {
  async validate(): Promise<ValidationResult> {
    // Validator logic
  }
}

const plugin: ValidatorPlugin = {
  register: (registry) => {
    registry.register({ id: 'my-validator' }, () => new MyValidator());
  },
};
```

**New (Rule-based):**
```typescript
const myRule: Rule = {
  meta: { id: 'my-rule', /* ... */ },
  validate: async (context) => {
    // Rule logic
  },
};

const plugin: ClaudeLintPlugin = {
  name: 'claudelint-plugin-myplugin',
  version: '1.0.0',
  rules: { 'my-rule': myRule },
};
```

## Support

- [GitHub Issues](https://github.com/pdugan20/claudelint/issues)
- [Contributing Rules Guide](./contributing-rules.md)
- [Architecture Documentation](./architecture.md)
