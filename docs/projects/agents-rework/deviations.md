# Agents Rework: Deviations Log

**Project**: Agents Rework: Flat File Discovery & Rule Alignment
**Created**: 2026-02-15

## Deviations from Plan

### 1. Rule ID not renamed

**Plan said**: Consider renaming `agent-name-directory-mismatch` to `agent-name-filename-mismatch`
**What we did**: Kept the existing rule ID `agent-name-directory-mismatch`
**Reason**: Renaming the rule ID is a breaking change for users who reference it in `.claudelintrc` configs. All user-facing text (description, error messages, docs) was updated to say "filename" instead of "directory". The rule ID is a technical identifier and renaming it provides minimal user benefit compared to the config breakage cost.

### 2. Additional test files needed updating

**Plan said**: Update 7 test files (phases 7.1-7.7)
**What we did**: Updated 9 test files (added scan-metadata.test.ts and preset-generation snapshots)
**Reason**: The plan didn't account for `scan-metadata.test.ts` (which creates agents with `AGENT.md` paths and checks skip reasons) or the preset generation snapshot tests (which snapshot all rule IDs). Both needed updates after the rule deletion and pattern changes.

### 3. agent-body-too-short skip test case

**Plan said**: Update file paths from `AGENT.md` to flat `.md` files
**What we did**: Additionally changed the "non-AGENT.md" skip test case from `README.md` to `.json`
**Reason**: The old test used `README.md` to verify the rule skipped non-`AGENT.md` files. After changing the guard from `.endsWith('AGENT.md')` to `.endsWith('.md')`, any `.md` file would now be validated. Changed to `.json` to properly test the skip behavior.

### 4. Schemas page expanded

**Plan said**: Update `memory` field docs
**What we did**: Also added `maxTurns`, `mcpServers`, and `delegate` fields to the agent frontmatter table
**Reason**: While updating the schema page, noticed these fields were already in the Zod schema but missing from the documentation table. Added for completeness.
