# Feasibility Study: Rich Diagnostics (Code Context with Caret Highlighting)

**Date**: 2026-02-13
**Verdict**: Feasible with moderate effort. Incremental rollout recommended.

---

## Goal

Display offending source code with inline caret highlighting when reporting violations, matching the pattern used by Biome, Rust clippy, and oxlint:

```text
warning: Missing usage section
 --> .claude/skills/deploy/SKILL.md:12:1
   |
12 | ## Description
   | ^^^^^^^^^^^^^^ expected a "## Usage" section
   |
   = help: Add a "## Usage" section
```

---

## What Already Exists

### API layer (ready)

`src/api/types.ts` — `LintMessage` already has span fields:

```typescript
interface LintMessage {
  line?: number;      // 1-based
  column?: number;    // 1-based
  endLine?: number;   // 1-based
  endColumn?: number; // 1-based
  source?: string;    // Original file content
  // ...other fields
}
```

`LintResult.source` carries the original file content, so formatters can extract code snippets.

### Formatter infrastructure (ready)

`BaseFormatter` in `src/api/formatter.ts` provides a base class with `getRelativePath()` and `getSummary()` helpers. A new `codeframe` formatter can extend this.

### Message builder (partially ready)

`src/api/result-builder.ts` converts `ValidationError` to `LintMessage`. Already passes through `line`. Would need trivial updates to also pass `column`, `endLine`, `endColumn`.

---

## What's Missing

### 1. Validator layer types lack column/span

`src/validators/file-validator.ts`:

```typescript
// CURRENT
interface ValidationError {
  message: string;
  file?: string;
  line?: number;        // Has line
  severity: 'error' | 'warning';
  // ...no column, endLine, endColumn
}
```

**Fix**: Add `column?`, `endLine?`, `endColumn?` to `ValidationError` and `ValidationWarning`. Non-breaking change (all fields optional).

### 2. RuleIssue interface lacks column/span

`src/types/rule.ts`:

```typescript
// CURRENT
interface RuleIssue {
  message: string;
  line?: number;        // Has line
  fix?: string;
  autoFix?: AutoFix;
  // ...no column, endLine, endColumn
}
```

**Fix**: Add `column?`, `endLine?`, `endColumn?`. Non-breaking change.

### 3. Only ~10% of rules provide line numbers

Of ~118 rule files, only ~12 currently provide `line` in their `context.report()` calls. Common patterns:

- `getFrontmatterFieldLine(content, 'fieldName')` — returns line of a YAML key
- `extractImportsWithLineNumbers(content)` — returns line of import statements
- Most rules report issues at the file level (no line number)

**This is the biggest gap.** Adding column/span requires each rule to calculate positional info, which varies by rule type.

### 4. No code snippet extraction utility

Need helper functions:

```typescript
function extractCodeSnippet(source: string, line: number, contextLines?: number): string[];
function generateCaretHighlight(line: string, column: number, endColumn: number): string;
```

### 5. No codeframe formatter

Need a new formatter that renders code context with carets, pipe characters, line numbers, and color.

---

## Effort Estimate

| Sub-task | Effort | Risk |
|----------|--------|------|
| Extend ValidationError/RuleIssue types | Small (1-2 hours) | Low |
| Update message builder pass-through | Small (30 min) | Low |
| Create code snippet extraction utils | Medium (2-4 hours) | Low |
| Create codeframe formatter | Medium (4-8 hours) | Medium |
| Update 10-20 high-value rules with column info | Large (1-2 days) | Medium |
| Update remaining ~100 rules | Very Large (3-5 days) | Medium |

**Total for MVP (types + formatter + 10-20 rules)**: 2-3 days
**Total for full rollout**: 1-2 weeks

---

## Incremental Rollout Strategy

Rules without positional info degrade gracefully. The codeframe formatter can handle three scenarios:

### Full span info (best case)

```text
warning[skill-body-missing-usage-section]: Missing usage section
 --> .claude/skills/deploy/SKILL.md:12:4
   |
12 | ## Description
   |    ^^^^^^^^^^^ expected "## Usage" section
```

### Line only (common case)

```text
warning[skill-body-missing-usage-section]: Missing usage section
 --> .claude/skills/deploy/SKILL.md:12
   |
12 | ## Description
```

### No positional info (fallback)

```text
warning[skill-body-missing-usage-section]: Missing usage section
 --> .claude/skills/deploy/SKILL.md
```

This means we can ship the formatter immediately and improve rule coverage incrementally.

---

## Priority Rules for Column Info

Rules most likely to benefit from code context (high frequency, file-level violations):

1. `claude-md-import-missing` — Can highlight the import line
2. `claude-md-file-reference-invalid` — Can highlight the reference
3. `claude-md-glob-pattern-backslash` — Can highlight the pattern
4. `skill-hardcoded-secrets` — Can highlight the secret
5. `skill-dangerous-command` — Can highlight the command
6. `skill-eval-usage` — Can highlight the eval call
7. `mcp-http-invalid-url` — Can highlight the URL
8. `hooks-invalid-event` — Can highlight the event name
9. `settings-invalid-permission` — Can highlight the permission
10. `skill-unknown-string-substitution` — Can highlight the substitution

---

## Recommendation

**Proceed in phases:**

1. **Phase 4a** (small): Extend types. Zero risk, enables future work.
2. **Phase 4b** (medium): Build codeframe formatter. Works with existing line-only data.
3. **Phase 4c** (medium): Add column helpers and update 10-20 high-value rules.
4. **Phase 4d** (ongoing): Gradually add column info to remaining rules as they're touched.

Phase 4a-4b can be done in a day. Phase 4c in 1-2 days. Phase 4d is ongoing and does not block any release.
