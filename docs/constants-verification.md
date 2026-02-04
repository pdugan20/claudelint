# Constants Verification

This document describes how to verify that constants in `src/schemas/constants.ts` stay synchronized with Claude Code.

## Overview

Constants like `ToolNames` and `ModelNames` must match what Claude Code actually supports. This document explains:

- How automated verification works
- When to run verification
- How to fix drift when detected
- Manual verification fallback

## Verification Method

### Automated: Claude CLI Queries

Both tools and models are verified by **querying the installed Claude Code CLI**:

```bash
# Verify all constants
npm run verify:constants

# Verify individually
npm run verify:tool-names
npm run verify:model-names
```

**How it works:**

1. **Query Claude CLI** - Scripts ask Claude to list its tools/models
2. **Add Supplemental Values** - Known-good values CLI doesn't mention (like `inherit`)
3. **Compare** - Check our constants against expected set
4. **Report Drift** - Exit 1 if mismatches found

**Requirements:**

- Claude Code CLI installed
- `ANTHROPIC_API_KEY` configured

### Supplemental Values

Some valid values may not be returned by CLI queries. These are maintained in the verification scripts:

**`scripts/verify/tool-names.ts`**:

```typescript
const SUPPLEMENTAL_TOOLS: string[] = [
  // Add tools here that are valid but CLI doesn't return them
];
```

**`scripts/verify/model-names.ts`**:

```typescript
const SUPPLEMENTAL_MODELS: string[] = [
  'inherit', // Valid in agent/skill frontmatter
];
```

Each supplemental value should:

- Have a comment explaining why it's supplemental
- Be verified against official docs
- Be reviewed periodically (every 90 days)

## Current Status

### ToolNames

**Purpose**: Valid tool names for agent frontmatter, skill frontmatter, and settings permissions

**Source of Truth**: Claude Code CLI (actual installed version)

**Documentation**: <https://code.claude.com/docs/en/settings#tools-available-to-claude>

**Last Verified**: 2026-02-04

**Status**: [DRIFT DETECTED]

**Current Drift**:

- Missing: TodoWrite
- Extra: LSP, TaskCreate, TaskGet, TaskList, TaskUpdate

**CLI Returns**: 17 tools
**Supplemental**: 0 tools
**Our Constants**: 21 tools

---

### ModelNames

**Purpose**: Valid model aliases for agent and skill frontmatter

**Source of Truth**: Claude Code CLI Task tool model parameter

**Documentation**: <https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields>

**Last Verified**: 2026-02-04

**Status**: [VERIFIED]

**CLI Returns**: 3 models (sonnet, opus, haiku)
**Supplemental**: 1 model (inherit)
**Our Constants**: 4 models (sonnet, opus, haiku, inherit)

**Note**: ModelNames is ONLY for agent/skill frontmatter. Settings.json uses `z.string()` to accept arbitrary model names (like `default`, `opusplan`, `sonnet[1m]`, full model names, ARNs, etc.)

---

## Verification Schedule

Run verification:

- **Before releases** - Ensure constants are current
- **After Claude Code updates** - Check for new tools/models
- **Every 90 days** - Periodic verification
- **When users report issues** - Invalid config validation

## Fixing Drift

When verification detects drift:

### 1. Investigate the Discrepancy

```bash
# Run verification to see the drift
npm run verify:tool-names

# Example output:
# Missing: TodoWrite
# Extra: LSP, TaskCreate, TaskGet, TaskList, TaskUpdate
```

Check if:

- **CLI is correct** - The actual tools available now
- **Docs confirm** - Cross-reference with official docs
- **Supplemental needed** - Valid value CLI didn't mention

### 2. Review Official Documentation

**Tools**: <https://code.claude.com/docs/en/settings#tools-available-to-claude>
**Models**: <https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields>

Compare against docs to confirm the drift is real.

### 3. Update Constants

Edit `src/schemas/constants.ts`:

```typescript
export const ToolNames = z.enum([
  'AskUserQuestion',
  'Bash',
  // ... add/remove tools based on verification
  'TodoWrite', // Add if missing
]);
```

### 4. Update Supplemental Lists (if needed)

If CLI misses a valid value, add it to supplemental list:

**In `scripts/verify/tool-names.ts`**:

```typescript
const SUPPLEMENTAL_TOOLS: string[] = [
  'SomeTool', // Reason: Valid but CLI doesn't return it
];
```

### 5. Run Tests

```bash
npm test
```

Ensure no rules broke from constant changes.

### 6. Re-verify

```bash
npm run verify:constants
```

Should now exit 0 (success).

### 7. Update This Document

Update "Last Verified" dates and status in this document.

### 8. Commit

```bash
git add src/schemas/constants.ts scripts/verify/ docs/constants-verification.md
git commit -m "fix: sync constants with Claude CLI (2026-02-04)"
```

## Manual Verification Fallback

If CLI verification fails (no Claude Code installed, API key issues):

### Tools

1. Visit <https://code.claude.com/docs/en/settings#tools-available-to-claude>
2. Find the "Tools available to Claude" table
3. Extract tool names from first column
4. Compare against `src/schemas/constants.ts`
5. Update constants if drift found

### Models

1. Visit <https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields>
2. Find the "Choose a model" section
3. Note valid model aliases: `sonnet`, `opus`, `haiku`, `inherit`
4. Compare against `src/schemas/constants.ts`
5. Update constants if drift found

## Automation

### Pre-commit Hook

Constants verification can be added to pre-commit hooks:

```bash
# In .husky/pre-commit or similar
npm run verify:constants
```

**Trade-off**: Requires Claude Code installed locally. May slow commits.

### CI Integration

Add to CI pipeline:

```yaml
# Example GitHub Actions
- name: Verify Constants
  run: npm run verify:constants
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

**Trade-off**: Requires API key in CI secrets. Costs tokens on each run.

## Limitations

### CLI Query Limitations

- **Requires Claude installed** - Can't verify without Claude Code CLI
- **Requires API key** - Needs configured `ANTHROPIC_API_KEY`
- **LLM variability** - Claude might not list everything consistently
- **Context dependent** - Different Claude versions may have different tools

### Why Supplemental Lists

CLI queries may not return:

- Special-purpose tools (e.g., `inherit` for models)
- Deprecated but still valid tools
- Tools only available in certain contexts
- Newly added tools Claude hasn't learned about

### Supplemental Lists ≠ Full Hardcoding

Unlike our original broken approach:

- **CLI provides base truth** - Automated discovery of most values
- **Supplemental adds missing** - Only for values CLI misses
- **Documented reasoning** - Each supplemental value has a comment
- **Periodic review** - Verify supplemental list every 90 days

This is **hybrid automation** - mostly automated with manual overrides for edge cases.

## FAQ

### Why query CLI instead of parsing docs?

Docs HTML structure can change. CLI queries:

- Use the actual installed version
- Work offline (after first API call)
- Are less brittle than HTML parsing

### What if CLI returns wrong results?

1. Cross-check with official docs (manual verification)
2. If docs confirm CLI is wrong, add correct value to supplemental list
3. Report issue to Claude Code team

### Can we fully automate this?

No. Edge cases like `inherit` require manual knowledge. Hybrid approach (CLI + supplemental) is the best balance.

### How much does verification cost?

Each verification run:

- Makes 2 API calls (tools + models)
- Uses ~500 tokens per call
- Costs < $0.01 per run

Reasonable for pre-release and periodic verification, but may be too expensive for every commit.

## History

| Date       | Change                                                      |
| :--------- | :---------------------------------------------------------- |
| 2026-02-04 | Rewrote verification to use Claude CLI queries              |
| 2026-02-04 | Added supplemental lists for values CLI doesn't return      |
| 2026-02-04 | Removed useless hardcoded list comparison approach          |
| 2026-02-04 | Changed settings.json model validation to z.string()        |
| 2026-02-04 | Removed jsdom dependency                                    |
| 2026-02-04 | ToolNames drift detected: missing TodoWrite, extra 5 tools  |
| 2026-02-04 | ModelNames verified correct with 'inherit' supplemental     |
