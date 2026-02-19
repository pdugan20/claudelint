---
description: Worked examples of custom claudelint rules covering pattern matching, auto-fix with character ranges, and configurable options with Zod schemas.
---

# Custom Rule Examples

claudelint dogfoods its own custom rules system. These are real rules from the project's [`.claudelint/rules/`](https://github.com/pdugan20/claudelint/tree/main/.claudelint/rules) directory that run on every CI build.

## Pattern Matching

[`no-user-paths.ts`](https://github.com/pdugan20/claudelint/blob/main/.claudelint/rules/no-user-paths.ts) detects hardcoded user-specific paths (`/Users/name/`, `/home/name/`, `C:\Users\`) with precise line numbers.

```typescript
import type { Rule } from 'claude-code-lint';
import { findLinesMatching } from 'claude-code-lint/utils';

const USER_PATH_PATTERN = /(?:\/Users\/|\/home\/|C:\\Users\\)[^\s/\\]+/;

export const rule: Rule = {
  meta: {
    id: 'no-user-paths',
    name: 'No User Paths',
    description: 'CLAUDE.md must not contain hardcoded user-specific paths',
    category: 'CLAUDE.md',
    severity: 'warn',
    fixable: false,
  },

  validate: async (context) => {
    if (!context.filePath.endsWith('CLAUDE.md')) {
      return;
    }

    const content = context.contentWithoutCode ?? context.fileContent;

    const matches = findLinesMatching(content, USER_PATH_PATTERN);
    for (const match of matches) {
      context.report({
        message: `Hardcoded user path: ${match.match}`,
        line: match.line,
        fix: 'Use a relative path or environment variable instead',
      });
    }
  },
};
```

**Key techniques:**

- `contentWithoutCode` strips fenced code blocks to avoid false positives
- `findLinesMatching()` returns `{ line, match }` pairs for precise line reporting
- Early return on wrong file type

## Auto-Fix

[`normalize-code-fences.ts`](https://github.com/pdugan20/claudelint/blob/main/.claudelint/rules/normalize-code-fences.ts) detects bare code fences (` ``` ` without a language) and auto-fixes them to `` ```text ``.

```typescript
import type { Rule } from 'claude-code-lint';

export const rule: Rule = {
  meta: {
    id: 'normalize-code-fences',
    name: 'Normalize Code Fences',
    description: 'Code fences must specify a language identifier',
    category: 'CLAUDE.md',
    severity: 'warn',
    fixable: true,
  },

  validate: async (context) => {
    const { fileContent, filePath } = context;
    const lines = fileContent.split('\n');
    let inCodeBlock = false;
    let offset = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (inCodeBlock) {
        if (/^```\s*$/.test(line)) {
          inCodeBlock = false;
        }
        offset += line.length + 1;
        continue;
      }

      if (/^```\s*$/.test(line)) {
        inCodeBlock = true;
        const fenceStart = offset;
        const fenceEnd = offset + line.trimEnd().length;
        context.report({
          message: 'Code fence missing language identifier',
          line: i + 1,
          fix: 'Add a language (e.g. ```bash, ```typescript, ```text)',
          autoFix: {
            ruleId: 'normalize-code-fences',
            description: 'Add "text" language to bare code fence',
            filePath,
            range: [fenceStart, fenceEnd],
            text: '```text',
          },
        });
      } else if (/^```\w/.test(line)) {
        inCodeBlock = true;
      }

      offset += line.length + 1;
    }
  },
};
```

**Key techniques:**

- Set `fixable: true` in meta when providing `autoFix`
- Track a character `offset` while iterating lines to compute ranges
- Each violation gets its own fix with a precise `range: [start, end]`
- Overlapping fixes are automatically skipped

The `autoFix` object uses character-range edits inspired by ESLint's fix format:

| Field | Type | Description |
|-------|------|-------------|
| `ruleId` | string | Must match your rule's `meta.id` |
| `description` | string | Human-readable description of the fix |
| `filePath` | string | Path to file being fixed (use `context.filePath`) |
| `range` | [number, number] | Character offsets [start, end) to replace |
| `text` | string | Replacement text |

Run with `claudelint check-all --fix` to apply fixes, or `--fix --dry-run` to preview.

## Configurable Options

[`max-section-depth.ts`](https://github.com/pdugan20/claudelint/blob/main/.claudelint/rules/max-section-depth.ts) limits heading depth to keep documents flat and scannable.

```typescript
import { z } from 'zod';
import type { Rule } from 'claude-code-lint';
import { extractHeadings } from 'claude-code-lint/utils';

const optionsSchema = z.object({
  maxDepth: z.number().int().min(1).max(6).optional(),
});

export const rule: Rule = {
  meta: {
    id: 'max-section-depth',
    name: 'Max Section Depth',
    description: 'CLAUDE.md headings must not exceed a configurable depth',
    category: 'CLAUDE.md',
    severity: 'warn',
    fixable: false,
    schema: optionsSchema,
    defaultOptions: { maxDepth: 4 },
  },

  validate: async (context) => {
    if (!context.filePath.endsWith('CLAUDE.md')) {
      return;
    }

    const maxDepth = (context.options.maxDepth as number) ?? 4;
    const headings = extractHeadings(context.fileContent);

    for (const heading of headings) {
      if (heading.level > maxDepth) {
        context.report({
          message: `Heading "${'#'.repeat(heading.level)} ${heading.text}" exceeds max depth ${maxDepth}`,
          line: heading.line,
          fix: `Restructure to use heading level ${maxDepth} or shallower`,
        });
      }
    }
  },
};
```

**Key techniques:**

- Define `schema` with Zod for type-safe validation of user options
- `defaultOptions` provides fallbacks when the user doesn't configure
- Access options via `context.options` in the validate function

Users configure options in `.claudelintrc.json` using array syntax:

```json
{
  "rules": {
    "max-section-depth": ["warn", { "maxDepth": 3 }]
  }
}
```

## See Also

- [Custom Rules Guide](/development/custom-rules) - Reference for building custom rules
- [Helper Library Reference](/development/helper-library) - Utility functions for custom rules
- [Example rules on GitHub](https://github.com/pdugan20/claudelint/tree/main/.claudelint/rules) - Full source
