# Rule: claude-md-glob-pattern-too-broad

**Severity**: Warning
**Fixable**: No
**Validator**: CLAUDE.md
**Category**: Best Practices

Path pattern is overly broad

## Rule Details

This rule warns when path patterns in the frontmatter `paths` field of `.claude/rules/*.md` files are overly broad. Specifically, it flags patterns that are exactly `**` or `*`, which match all files recursively or all files in the current directory respectively.

Overly broad patterns can cause:

- Unintended file matches, including dependencies, build artifacts, and cached files
- Performance issues when scanning large directory trees
- Rules applying to files they weren't meant for
- Confusion about which files a rule actually targets
- Excessive processing time during validation

While `**` and `*` are valid glob patterns, using them alone without any specificity indicates the pattern should be more targeted. More specific patterns make rules clearer, faster, and less error-prone.

This rule only applies to `.claude/rules/*.md` files that contain frontmatter with a `paths` field.

### Incorrect

Using bare `**` pattern:

```markdown
---
paths:
  - "**"
---

# Rule: TypeScript Coding Standards
```

This matches every file in the project, including `node_modules/`, `.git/`, build outputs, and everything else.

Using bare `*` pattern:

```markdown
---
paths:
  - "*"
---

# Rule: File Naming Convention
```

This matches all files in the current directory, which may be too broad.

Multiple overly broad patterns:

```markdown
---
paths:
  - "**"
  - "*"
---
```

### Correct

Specific file type patterns:

```markdown
---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# Rule: TypeScript Coding Standards
```

Directory-specific patterns:

```markdown
---
paths:
  - src/**/*.ts
  - tests/**/*.test.ts
  - lib/**/*.ts
---
```

Targeted patterns with file extensions:

```markdown
---
paths:
  - "*.md"
  - docs/**/*.md
  - .claude/rules/*.md
---

# Rule: Markdown Documentation Standards
```

Multiple specific patterns:

```markdown
---
paths:
  - src/components/**/*.tsx
  - src/hooks/**/*.ts
  - src/utils/**/*.ts
---
```

## How To Fix

To make glob patterns more specific:

1. **Add file extensions** to target specific file types:
   ```markdown
   # Too broad
   ---
   paths:
     - "**"
   ---

   # More specific
   ---
   paths:
     - "**/*.ts"
     - "**/*.tsx"
   ---
   ```

2. **Specify target directories**:
   ```markdown
   # Too broad
   ---
   paths:
     - "*"
   ---

   # More specific
   ---
   paths:
     - src/**/*.ts
     - tests/**/*.test.ts
   ---
   ```

3. **Combine directory and file patterns**:
   ```markdown
   # Too broad
   ---
   paths:
     - "**"
   ---

   # More specific
   ---
   paths:
     - src/components/**/*.tsx
     - src/services/**/*.ts
     - config/**/*.json
   ---
   ```

4. **Use multiple specific patterns** instead of one broad pattern:
   ```markdown
   # Too broad
   ---
   paths:
     - "**"
   ---

   # More specific
   ---
   paths:
     - "**/*.ts"
     - "**/*.tsx"
     - "**/*.js"
     - "**/*.jsx"
   ---
   ```

5. **Consider what the rule is actually checking**:
   - If it's a TypeScript rule, use `**/*.ts` and `**/*.tsx`
   - If it's for documentation, use `**/*.md`
   - If it's for configuration, use `**/*.json` or specific config files

6. **Verify the pattern matches your intent**:
   ```bash
   # Test the glob pattern
   find . -name "*.ts" -not -path "*/node_modules/*"
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

You might disable this rule if:

- You genuinely need to check all files (rare)
- You're creating a general-purpose rule that applies to any file type
- You're prototyping and plan to make the pattern more specific later

However, it's generally better to be explicit and use multiple specific patterns rather than relying on overly broad matching. Even general-purpose rules benefit from excluding common directories like `node_modules/`, `.git/`, and build outputs.

## Related Rules

- [claude-md-glob-pattern-backslash](./claude-md-glob-pattern-backslash.md) - Backslashes in patterns
- [claude-md-paths](./claude-md-paths.md) - Path format validation

## Resources

- [Rule Implementation](../../src/rules/claude-md/claude-md-glob-pattern-too-broad.ts)
- [Rule Tests](../../tests/validators/claude-md.test.ts)

## Version

Available since: v1.0.0
