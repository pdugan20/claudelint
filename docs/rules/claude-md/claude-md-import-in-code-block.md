# Rule: claude-md-import-in-code-block

**Severity**: Error
**Fixable**: No
**Validator**: CLAUDE.md
**Category**: Best Practices

Import statement found inside code block

## Rule Details

This rule triggers when a CLAUDE.md file contains an import statement inside a markdown code block. Imports placed in code blocks are treated as example code and are not processed by Claude Code, which can lead to confusion when the expected file content is not loaded.

Import statements must appear outside code blocks to be recognized and processed. This ensures your CLAUDE.md files behave as expected when loaded by Claude Code.

### Incorrect

Import statement inside a code block:

````markdown
---
name: "My Project"
---

# Instructions

Here's how to import a file:

```markdown
import rules/coding-standards.md
```
````

### Correct

Import statement outside code blocks:

```markdown
---
name: "My Project"
---

# Instructions

import rules/coding-standards.md

Here's an example of what the import looks like in the file.
```

## How To Fix

To move import statements out of code blocks:

1. **Identify imports in code blocks** - look for import statements between backticks

2. **Move the import outside the code block:**

   ```markdown
   # Before (incorrect)
   Here's how to import:
   ```markdown
   Import: @.claude/rules/standards.md
   ```

   # After (correct)

   Import: @.claude/rules/standards.md

   Here's an example of the import syntax.

   ```

3. **If showing import syntax as an example**, use inline code:

   ```markdown
   Use the syntax: `Import: @path/to/file.md`
   ```

4. **Verify all imports are processed**:

   ```bash
   claudelint check-claude-md
   ```

Remember: Import statements must be outside code blocks to be processed by Claude Code.

## Options

This rule does not have any configuration options.

## When Not To Use It

You should not disable this rule. Import statements in code blocks will never work as intended. If you want to show an example of import syntax, use inline code or add a comment explaining it's an example.

## Related Rules

- [import-missing](./import-missing.md) - Validates that imported files exist
- [import-circular](./import-circular.md) - Detects circular import dependencies

## Resources

- [Rule Implementation](../../src/rules/claude-md/claude-md-import-in-code-block.ts)
- [Rule Tests](../../tests/validators/claude-md.test.ts)

## Version

Available since: v1.0.0
