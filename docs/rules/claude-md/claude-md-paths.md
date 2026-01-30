# Rule: claude-md-paths

**Severity**: Error
**Fixable**: No
**Validator**: CLAUDE.md
**Category**: Best Practices

Claude MD paths must be a non-empty array with at least one path pattern

## Rule Details

This rule validates the `paths` field in the frontmatter of `.claude/rules/*.md` files. The `paths` field specifies which files a rule applies to using glob patterns. When present, this field must be:

- An array (not a string, number, or other type)
- Non-empty (containing at least one path pattern)
- Containing only non-empty string values

The `paths` field tells claudelint which files to check when validating a rule. Without proper path patterns, the rule won't know which files to validate, or it may attempt to validate inappropriate files.

This rule only applies to `.claude/rules/*.md` files, which are custom rule definitions that require frontmatter. Regular CLAUDE.md files do not require this field.

### Incorrect

Missing paths array:

```markdown
---
name: TypeScript Strict Mode
severity: error
---

# TypeScript files must use strict mode
```

Empty paths array:

```markdown
---
name: File Naming Convention
paths: []
---

# Files must use kebab-case naming
```

Paths is not an array:

```markdown
---
name: Import Organization
paths: "src/**/*.ts"
---

# Imports must be organized
```

Paths contains non-string values:

```markdown
---
name: Code Standards
paths:
  - src/**/*.ts
  - 123
  - true
---
```

Paths contains empty strings:

```markdown
---
name: Documentation Standards
paths:
  - "src/**/*.ts"
  - ""
  - "docs/**/*.md"
---
```

### Correct

Valid paths array with single pattern:

```markdown
---
name: TypeScript Strict Mode
paths:
  - "**/*.ts"
---

# TypeScript files must use strict mode
```

Multiple path patterns:

```markdown
---
name: File Naming Convention
paths:
  - src/**/*.ts
  - tests/**/*.test.ts
  - lib/**/*.ts
---

# Files must use kebab-case naming
```

Specific file patterns:

```markdown
---
name: Configuration Validation
paths:
  - "*.json"
  - "config/**/*.json"
  - ".claude/**/*.json"
---

# JSON files must be valid
```

Mixed specificity:

```markdown
---
name: Documentation Standards
paths:
  - "**/*.md"
  - "README.md"
  - "CHANGELOG.md"
---

# Markdown files must follow standards
```

## How To Fix

To fix invalid `paths` fields:

1. **Convert string to array**:
   ```markdown
   # Wrong - paths is a string
   ---
   paths: "src/**/*.ts"
   ---

   # Correct - paths is an array
   ---
   paths:
     - "src/**/*.ts"
   ---
   ```

2. **Add at least one path pattern** to empty arrays:
   ```markdown
   # Wrong - empty array
   ---
   paths: []
   ---

   # Correct - contains patterns
   ---
   paths:
     - "**/*.ts"
     - "**/*.tsx"
   ---
   ```

3. **Ensure all values are strings**:
   ```markdown
   # Wrong - contains non-string values
   ---
   paths:
     - src/**/*.ts
     - 123
     - true
   ---

   # Correct - all strings
   ---
   paths:
     - "src/**/*.ts"
     - "tests/**/*.ts"
   ---
   ```

4. **Remove empty strings**:
   ```markdown
   # Wrong - contains empty string
   ---
   paths:
     - "src/**/*.ts"
     - ""
     - "docs/**/*.md"
   ---

   # Correct - no empty strings
   ---
   paths:
     - "src/**/*.ts"
     - "docs/**/*.md"
   ---
   ```

5. **Add paths field if missing** (when creating rules files):
   ```markdown
   # Wrong - no paths field
   ---
   name: My Rule
   severity: error
   ---

   # Correct - includes paths
   ---
   name: My Rule
   severity: error
   paths:
     - "**/*.ts"
   ---
   ```

6. **Use YAML array syntax properly**:
   ```markdown
   # Option 1: Multi-line array
   ---
   paths:
     - "src/**/*.ts"
     - "lib/**/*.ts"
   ---

   # Option 2: Inline array
   ---
   paths: ["src/**/*.ts", "lib/**/*.ts"]
   ---
   ```

7. **Verify the fix**:
   ```bash
   claudelint check-claude-md
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

This rule only applies to `.claude/rules/*.md` files that define custom validation rules. It does not apply to:

- Top-level `CLAUDE.md` files
- Regular markdown documentation files
- Imported rule files that don't define path patterns

However, if you're creating a custom rule file in `.claude/rules/`, you should always provide valid `paths` patterns to specify which files the rule validates. Disabling this rule would allow misconfigured rules that don't know which files to check.

## Related Rules

- [claude-md-glob-pattern-backslash](./claude-md-glob-pattern-backslash.md) - Backslashes in patterns
- [claude-md-glob-pattern-too-broad](./claude-md-glob-pattern-too-broad.md) - Overly broad patterns

## Resources

- [Rule Implementation](../../src/rules/claude-md/claude-md-paths.ts)
- [Rule Tests](../../tests/validators/claude-md.test.ts)

## Version

Available since: v1.0.0
