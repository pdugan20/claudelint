# Explain Mode Specification

**Reference for**: Phase 3 (Three-Tier Progressive Disclosure)
**Last Updated**: 2026-02-13

---

## Overview

Claudelint uses a three-tier progressive disclosure model for rule explanations, inspired by Rust's `rustc`/Clippy (`--explain E0308`), Biome's three-pillar diagnostics (What/Why/How), and ESLint's `--format` + documentation site pattern.

Each tier reveals more detail, keeping default output clean while making deep information accessible on demand.

| Tier | Trigger | Content | Target audience |
|------|---------|---------|-----------------|
| 1 | Default (`claudelint check-all`) | Aligned table: message + rule ID | Developer fixing issues quickly |
| 2 | `--explain` flag | Inline Why + Fix per issue | Developer who needs context |
| 3 | `claudelint explain <rule-id>` | Full rule documentation page | Developer learning a rule |

---

## Tier 1: Default Output (No Changes)

Standard `text-table` aligned output from Phase 1. Terse messages from Phase 2.

```text
src/.claude/skills/deploy/SKILL.md
      error    Unknown frontmatter key: "author"         skill-frontmatter-unknown-keys
      error    Name "WRONG_NAME" doesn't match directory  skill-name-directory-mismatch
   5  warning  Description should start with action verb  skill-description-quality
   3  warning  Description exceeds 200 characters         skill-description-max-length
      warning  Missing usage examples                     skill-missing-examples
      ... and 2 more skill-description-quality

src/CLAUDE.md
  18  warning  File reference does not exist              claude-md-file-reference-invalid
      warning  Import path uses backslash separator       claude-md-glob-pattern-backslash

7 problems (2 errors, 5 warnings)
```

No explain content. No Fix: labels. Clean, scannable output.

---

## Tier 2: `--explain` Flag

### Design Principles

1. **Two lines per issue maximum** -- Why and Fix each get one line
2. **Terse, not verbose** -- rationale is 1-2 sentences (~120 chars), not a paragraph
3. **Source: `docs.rationale`** -- a new field distinct from `docs.details` (which is web documentation prose)
4. **Fallback chain** -- if `docs.rationale` is not set, use `docs.summary` (never `docs.details`)
5. **No repetition** -- the message already states WHAT is wrong; explain adds WHY and HOW

### Output Format

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

   3  warning  Description exceeds 200 characters         skill-description-max-length
        Why: Long descriptions are truncated in listings and hard to scan.
        Fix: Shorten the description to 200 characters or fewer.

      warning  Missing usage examples                     skill-missing-examples
        Why: Usage examples help developers understand how to invoke the skill correctly.
        Fix: Add a "## Usage" or "## Examples" section to the skill body.

      ... and 2 more skill-description-quality

src/CLAUDE.md
  18  warning  File reference does not exist              claude-md-file-reference-invalid
        Why: Broken file references prevent Claude from accessing context during sessions.
        Fix: Create the missing file or update the path.

      warning  Import path uses backslash separator       claude-md-glob-pattern-backslash
        Why: Backslash separators fail on Unix, breaking cross-platform imports.
        Fix: Replace backslashes with forward slashes.

7 problems (2 errors, 5 warnings)
Run 'claudelint explain <rule-id>' for detailed rule documentation.
```

### Rendering Rules

- **Indentation**: 8 spaces (aligns with the message column in the table)
- **Labels**: `Why:` and `Fix:` in cyan, content in gray
- **Why line**: Sourced from `docs.rationale` (new field). One line, ~120 chars max.
- **Fix line**: Sourced from `docs.howToFix`. May wrap if it contains a data dump (valid keys list, etc.), but the first line should be actionable.
- **Fix: from issue**: If the rule's `context.report()` includes a `fix` field, show it as `Fix:` instead of `docs.howToFix`. Rule-level fix is more specific (e.g., "Change name from X to Y").
- **Collapsed issues**: Collapse lines ("... and N more") do not get Why/Fix lines
- **Footer**: Single line after all output: `Run 'claudelint explain <rule-id>' for detailed rule documentation.`

### Fallback Priority

For `Why:` line:

1. `issue.explanation` (explicitly set by rule at report time -- rare)
2. `docs.rationale` (new field, ~120 chars, designed for terminal)
3. `docs.summary` (one-sentence fallback, always exists)
4. *(omit Why: line if none available)*

For `Fix:` line:

1. `issue.fix` (rule-specific fix from `context.report({ fix })`)
2. `docs.howToFix` (general fix instructions from rule metadata)
3. *(omit Fix: line if neither available)*

### Auto-Populate in file-validator.ts

The `executeRule()` method auto-populates explain fields from rule metadata:

```typescript
const docs = (rule as Rule).meta?.docs;
const explanation = issue.explanation || docs?.rationale || docs?.summary;
const howToFix = issue.howToFix || docs?.howToFix;
```

### Code Change Required in Reporter

Update `reportStylish()` explain block (lines ~446-463) to:

1. Change "Why this matters:" label to "Why:"
2. Change "How to fix:" label to "Fix:"
3. Add footer hint after all file groups

---

## Tier 3: `claudelint explain <rule-id>` Subcommand

### Purpose

A standalone subcommand that prints the full documentation page for a single rule, formatted for terminal reading. This is the equivalent of `rustc --explain E0308` or `ruff rule E501`.

### Usage

```bash
claudelint explain skill-frontmatter-unknown-keys
claudelint explain claude-md-file-reference-invalid
```

### Output Format

```text
skill-frontmatter-unknown-keys
==============================

  Warns when SKILL.md frontmatter contains unrecognized keys.

  SKILL.md frontmatter supports a specific set of known keys: name,
  description, version, tags, dependencies, allowed-tools, disallowed-tools,
  model, context, agent, argument-hint, disable-model-invocation,
  user-invocable, hooks, license, compatibility, and metadata. This rule
  detects any top-level keys that are not in this set. Unknown keys are
  silently ignored at runtime, which means typos in field names (e.g.,
  "dependecies" instead of "dependencies") go unnoticed and the intended
  configuration never takes effect.

  How to fix:

    Valid keys: name, description, version, tags, dependencies, allowed-tools,
    disallowed-tools, model, context, agent, argument-hint,
    disable-model-invocation, user-invocable, hooks, license, compatibility,
    metadata. Check for typos or place custom data under the `metadata` field.

  Examples:

    Incorrect - Frontmatter with a typo in a key name:

      ---
      name: deploy
      description: Deploys the application
      dependecies:
        - build
      ---

    Correct - Frontmatter using only recognized keys:

      ---
      name: deploy
      description: Deploys the application
      dependencies:
        - build
      allowed-tools:
        - Bash
      ---

  Severity:  warn
  Category:  Skills
  Fixable:   no
  Since:     0.3.0
  Docs:      https://claudelint.com/rules/skills/skill-frontmatter-unknown-keys

  Related rules:
    - skill-description
    - skill-dependencies
    - skill-allowed-tools
```

### Output Structure

1. **Rule ID** as title with underline (chalk.bold)
2. **Summary** -- from `docs.summary` (2-space indent)
3. **Details** -- from `docs.details` (2-space indent, word-wrapped to terminal width)
4. **How to fix** -- from `docs.howToFix` (section header + 4-space indent)
5. **Examples** -- from `docs.examples` (incorrect and correct, with code blocks indented 6 spaces)
6. **Metadata table** -- severity, category, fixable, since, docs URL (aligned key-value pairs)
7. **When not to use** -- from `docs.whenNotToUse` (if present)
8. **Related rules** -- from `docs.relatedRules` (if present)

### Implementation

- New file: `src/cli/commands/explain.ts`
- Registered as a commander.js subcommand
- Looks up rule from `RuleRegistry` by ID
- Word-wraps text to `process.stdout.columns || 80`
- Uses chalk for colors (same color/no-color detection as reporter)
- Exits with code 0 on success, code 1 if rule ID not found

### Docs URL Generation

Generate the website URL from rule metadata rather than hardcoding per-rule:

```typescript
function getDocsUrl(rule: Rule): string {
  const categorySlug = getCategorySlug(rule.meta.category);
  return `https://claudelint.com/rules/${categorySlug}/${rule.meta.id}`;
}

function getCategorySlug(category: RuleCategory): string {
  const map: Record<RuleCategory, string> = {
    'CLAUDE.md': 'claude-md',
    Skills: 'skills',
    Settings: 'settings',
    Hooks: 'hooks',
    MCP: 'mcp',
    Plugin: 'plugin',
    Commands: 'commands',
    Agents: 'agents',
    OutputStyles: 'output-styles',
    LSP: 'lsp',
  };
  return map[category];
}
```

This replaces the hardcoded `getDocsUrl()` map in `reporting.ts` and is shared between the explain subcommand and any future docs URL usage.

### Error Handling

```bash
$ claudelint explain nonexistent-rule
Error: Rule "nonexistent-rule" not found.

Available rules:
  claude-md-*         (6 rules)
  skill-*             (30 rules)
  settings-*          (4 rules)
  ...

Run 'claudelint list-rules' to see all available rules.
```

---

## New Field: `docs.rationale`

### Definition

A new optional field on `RuleDocumentation` (in `src/types/rule-metadata.ts`):

```typescript
export interface RuleDocumentation {
  // ... existing fields ...

  /**
   * Terse rationale for terminal display (~120 chars).
   * Explains WHY this rule exists in 1-2 sentences.
   * Used by --explain (Tier 2). Distinct from `details` which is for web docs.
   */
  rationale?: string;
}
```

### Guidelines for Writing Rationale

| Quality | Example |
|---------|---------|
| Good | "Unknown keys are silently ignored; typos prevent configuration from taking effect." |
| Good | "Backslash separators fail on Unix, breaking cross-platform compatibility." |
| Good | "Side-effect tools can modify the environment; disable-model-invocation prevents unintended execution." |
| Bad | "This rule checks for unknown keys in the frontmatter of SKILL.md files." *(describes WHAT, not WHY)* |
| Bad | "You should not use unknown keys because they might cause issues." *(vague, no consequence)* |
| Bad | "SKILL.md frontmatter supports a specific set of known keys: name, description, version..." *(too long, data dump)* |

### Relationship to Other Fields

| Field | Purpose | Length | Used in |
|-------|---------|--------|---------|
| `description` (on `meta`) | One-line rule summary for listings | ~60 chars | `list-rules`, config |
| `docs.summary` | One-sentence for search indexes | ~80 chars | Website overview, Tier 2 fallback |
| `docs.rationale` | WHY this matters, for terminal | ~120 chars | Tier 2 `--explain` Why: line |
| `docs.details` | Full explanation with markdown | Unlimited | Tier 3 `explain` subcommand, website |
| `docs.howToFix` | Step-by-step fix instructions | Unlimited | Tier 2 Fix: line, Tier 3 "How to fix" |

### Migration Plan

All 116 rules need a `docs.rationale` field added. This can be done incrementally:

1. **Phase 3 implementation**: Add `rationale` to `RuleDocumentation` interface (done)
2. **Batch authoring**: Write rationale for all 116 rules (category by category)
3. **Fallback works**: Until rationale is populated, `--explain` falls back to `docs.summary`
4. **Enforcement**: Phase 4 script validates that new rules include `rationale`

---

## Type Enforcement (Phase 4)

### Build-Time Validation

Add a check script (`scripts/check/rule-docs.ts`) that validates every rule has the required documentation fields:

```text
Required fields:
  - meta.docs.summary         (all rules)
  - meta.docs.details         (all rules)
  - meta.docs.rationale       (all rules -- enforced after batch authoring)
  - meta.docs.howToFix        (all rules)
  - meta.docs.examples        (all rules, at least 1 incorrect + 1 correct)

Validation:
  - docs.rationale max 200 chars (soft limit, warn at 150)
  - docs.rationale must not equal docs.summary (they serve different purposes)
  - docs.rationale must not equal docs.details (rationale is terse)
  - docs.howToFix must not be empty string
  - docs.summary must not be empty string
```

### TypeScript Type Strictness

Consider making `docs` required on `RuleMetadata` (currently optional):

```typescript
// Current (optional)
docs?: RuleDocumentation;

// Future (required -- enforced after all rules have docs)
docs: RuleDocumentation;
```

This is a breaking change that should wait until all 116 rules have complete `docs` objects.

---

## Data Flow Summary

```text
Rule Definition                    CLI Output
==============                    ==========

meta.description ────────────────> list-rules, config
meta.docs.summary ───────────────> Website overview page
                                   Tier 2 fallback (if no rationale)
                                   Tier 3 explain subcommand (first line)
meta.docs.rationale ─────────────> Tier 2 --explain "Why:" line
meta.docs.details ───────────────> Tier 3 explain subcommand (body)
                                   Website rule page
meta.docs.howToFix ──────────────> Tier 2 --explain "Fix:" line (fallback)
                                   Tier 3 explain subcommand "How to fix"
meta.docs.examples ──────────────> Tier 3 explain subcommand "Examples"
                                   Website rule page
context.report({ fix }) ─────────> Tier 2 --explain "Fix:" line (primary)
context.report({ explanation }) ──> Tier 2 --explain "Why:" line (override)
```

---

## Comparison with Other Tools

| Tool | Default | Verbose/Explain | Deep Explain |
|------|---------|-----------------|--------------|
| ESLint | Table + rule ID | N/A (uses website) | Website docs |
| Clippy | What + Why + Help inline | N/A | `--explain` prints full page |
| Biome | What + Why + Help inline | N/A | N/A |
| Ruff | Table + rule ID | N/A | `ruff rule E501` subcommand |
| Pylint | Table + message ID | N/A | Website docs |
| **claudelint** | Table + rule ID | `--explain`: Why + Fix | `explain <id>`: full page |

Our approach combines:

- ESLint's clean default table
- Clippy/Ruff's `explain` subcommand for deep dives
- Biome's Why/How philosophy adapted for two-line inline display

---

## Implementation Checklist

Phase 3 implementation order:

1. Add `docs.rationale` field to `RuleDocumentation` interface (done)
2. Update `file-validator.ts` auto-populate to use `rationale || summary` (done)
3. Update `reporting.ts` Tier 2 rendering (Why/Fix labels, indentation)
4. Write `docs.rationale` for all 116 rules
5. Build `claudelint explain <rule-id>` subcommand
6. Add tests for Tier 2 rendering and Tier 3 subcommand
7. Verify end-to-end with `--explain` and `explain <rule-id>`

Phase 4 enforcement:

1. Add `scripts/check/rule-docs.ts` validation script
2. Enforce `docs.rationale` presence and length limits
3. Add to pre-commit hooks
