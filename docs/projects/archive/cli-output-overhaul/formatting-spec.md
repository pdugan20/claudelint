# Formatting Specification

**Reference for**: Phase 1 (Reporter Formatting Overhaul)

---

## Current Format (string concatenation)

```text
tests/fixtures/projects/invalid-all-categories/.claude/skills/bad-skill/SKILL.md
     error    Must contain only lowercase letters, numbers, and hyphens  skill-name
     error    Description must be at least 10 characters  skill-description
     error    Must be written in third person (avoid "I" and "you")  skill-description
  2  error    Must contain only lowercase letters, numbers, and hyphens  skill-name
     error    Skill name "WRONG_NAME" does not match directory name "bad-skill"  skill-name-directory-mismatch
    Fix: Change name from "WRONG_NAME" to "bad-skill"
     ... and 1 more skill-description
  5  warning  Skill has side-effect tools in allowed-tools but disable-model-invocation is not set to true  skill-side-effects-without-disable-model
     warning  Unknown frontmatter key "author". Valid keys: agent, allowed-tools, argument-hint, compatibility, context, dependencies, description, disable-model-invocation, disallowed-tools, hooks, license, metadata, model, name, tags, user-invocable, version  skill-frontmatter-unknown-keys
  3  warning  Description should start with an action verb (e.g., "Validate", "Generate", "Run"). Found: "I"  skill-description-quality
    Fix: Rewrite to start with an imperative verb: "I do it" -> "Verb I do it"
```

### Problems

1. Rule IDs float at variable horizontal positions
2. Fix: lines at different indent than issues
3. Messages too long, wrapping the terminal
4. Line numbers left-padded inconsistently
5. No clear visual separation between columns

## Target Format (text-table)

```text
tests/.../bad-skill/SKILL.md
      error    Must contain only lowercase letters               skill-name
      error    Description must be at least 10 characters        skill-description
      error    Must be written in third person                   skill-description
      error    Context "fork" requires agent field               skill-agent
      error    Cannot specify both allowed-tools and disallowed  skill-allowed-tools
   2  error    Must contain only lowercase letters               skill-name
      error    Name "WRONG_NAME" doesn't match directory         skill-name-directory-mismatch
      ... and 1 more skill-description
   5  error    Cannot specify both allowed-tools and disallowed  skill-allowed-tools
   2  error    Context "fork" requires agent field               skill-agent
   5  warning  Side-effect tools without disable-model-invoc...  skill-side-effects-without-disable-model
      warning  Frontmatter lacks "version" field                 skill-missing-version
      warning  Missing usage examples                            skill-missing-examples
      warning  Missing CHANGELOG.md                              skill-missing-changelog
      warning  Unknown frontmatter key: "author"                 skill-frontmatter-unknown-keys
   3  warning  Description should start with action verb         skill-description-quality
      ... and 2 more skill-description-quality
```

### Improvements

1. Rule IDs align in a consistent right column
2. No Fix: lines in default output
3. Messages are short (from Phase 2 content cleanup)
4. Line numbers right-aligned against a clean gutter
5. Clear 2-space gaps between every column

## Column Layout

Using `text-table` with 5 columns:

```text
| Col | Content    | Align | Width    | Notes                           |
|-----|------------|-------|----------|---------------------------------|
| 0   | (empty)    | left  | 0        | Creates 2-space left margin     |
| 1   | Line num   | right | dynamic  | Max digits in file group + pad  |
| 2   | Severity   | left  | 7        | "error" (5) or "warning" (7)    |
| 3   | Message    | left  | dynamic  | Problem statement only          |
| 4   | Rule ID    | left  | dynamic  | dim color                       |
```

**Column separator**: 2 spaces (text-table default `hsep`).

**Severity padding**: text-table handles this automatically since "error" and "warning" are in the same column. "error" gets 2 trailing spaces to match "warning"'s 7-char width.

## Implementation Pattern

Based on ESLint's stylish formatter:

```typescript
import table from 'text-table';
import stripAnsi from 'strip-ansi';

// Build rows for one file group
const rows: string[][] = [];

for (const issue of fileIssues) {
  // Collapse logic (same as current)
  if (shouldCollapse(issue)) {
    rows.push(['', '', '', `... and ${remaining} more ${issue.ruleId}`, '']);
    continue;
  }

  rows.push([
    '',                                          // indent (col 0)
    issue.line ? String(issue.line) : '',         // line number (col 1, right-aligned)
    issue.kind,                                   // "error" or "warning" (col 2)
    issue.message,                                // problem statement (col 3)
    issue.ruleId || '',                           // rule ID (col 4)
  ]);
}

// Generate aligned table
const output = table(rows, {
  align: ['', 'r', 'l', 'l', 'l'],
  stringLength: (str) => stripAnsi(str).length,
});

// Apply colors after table generation
// (text-table needs plain strings for width calculation)
const colored = output
  .split('\n')
  .map((line) => {
    // Apply chalk.red to "error", chalk.yellow to "warning"
    // Apply chalk.dim to rule ID
    return colorize(line);
  })
  .join('\n');
```

**Key**: Colors are applied AFTER table generation. text-table uses `stringLength` to calculate widths from plain text, but the column content must be plain during table building. Colors are applied in a post-processing pass.

ESLint does this identically -- builds plain table, then applies chalk via regex replacement.

## File Headers

Unchanged from current:

```typescript
this.log(this.colorize(chalk.underline, relativePath));
```

File path on its own line, underlined, no indentation.

## Summary Line

Unchanged from current (rendered by check-all.ts):

```text
Checked 28 files across 5 components (claude-md, skills, settings, hooks, plugin) in 89ms.
79 problems (29 errors, 50 warnings)
5 potentially fixable with --fix
```

## Explain Mode (Tier 2: `--explain` Flag)

When `--explain` is used, each issue gets a `Why:` + `Fix:` block below its table row.
Two lines max per issue. `Why:` sourced from `docs.rationale`, `Fix:` from `issue.fix` or `docs.howToFix`.

See [explain-mode-spec.md](explain-mode-spec.md) for the full three-tier design.

```text
src/.claude/skills/deploy/SKILL.md
      error    Unknown frontmatter key: "author"         skill-frontmatter-unknown-keys
        Why: Unknown keys are silently ignored; typos prevent configuration from taking effect.
        Fix: Valid keys: name, description, version, tags, dependencies, allowed-tools,
             disallowed-tools, model, context, agent, argument-hint,
             disable-model-invocation, user-invocable, hooks, license,
             compatibility, metadata.

      error    Name "WRONG_NAME" doesn't match directory  skill-name-directory-mismatch
        Why: Mismatched names cause skill discovery to fail at runtime.
        Fix: Change name from "WRONG_NAME" to "deploy"

   5  warning  Description should start with action verb  skill-description-quality
        Why: Action verbs help Claude understand what the skill does and when to invoke it.
        Fix: Rewrite to start with an imperative verb like "Deploy", "Generate", or "Validate".

src/CLAUDE.md
  18  warning  File reference does not exist              claude-md-file-reference-invalid
        Why: Broken file references prevent Claude from accessing context during sessions.
        Fix: Create the missing file or update the path.

7 problems (2 errors, 5 warnings)
Run 'claudelint explain <rule-id>' for detailed rule documentation.
```

### Rendering rules

- **Indentation**: 8 spaces (aligns with message column)
- **Labels**: `Why:` and `Fix:` in cyan, content in gray
- **Why source**: `docs.rationale` (~120 chars). Falls back to `docs.summary`.
- **Fix source**: `issue.fix` (rule-specific) > `docs.howToFix` (general)
- **Omission**: Omit Why/Fix lines if no data available
- **Footer**: Single hint line pointing to Tier 3 `explain` subcommand

### Fallback priority

Why: `issue.explanation` > `docs.rationale` > `docs.summary` > *(omit)*
Fix: `issue.fix` > `docs.howToFix` > *(omit)*

## Explain Subcommand (Tier 3: `claudelint explain <rule-id>`)

Full rule documentation in the terminal. See [explain-mode-spec.md](explain-mode-spec.md) for format.

```bash
claudelint explain skill-frontmatter-unknown-keys
```

Prints: summary, full details, how to fix, examples, metadata, related rules.

## Compact Format

Unchanged. One line per issue, no table alignment:

```text
src/CLAUDE.md:18:0: warning: File reference does not exist [claude-md-file-reference-invalid]
```

## JSON/SARIF/GitHub Formats

Unchanged. Machine-readable formats are not affected by this work.
