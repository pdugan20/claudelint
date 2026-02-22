# Claude-Assisted Setup - Progress Tracker

**Status:** In Progress
**Created:** 2026-02-19
**Last Updated:** 2026-02-20

---

## Context

Users currently need multiple manual steps to fully set up claudelint: install the npm package, run `claudelint init`, manually create `.claude/hooks/hooks.json`, and run `/plugin` slash commands. The biggest automation gap is the hooks file -- there's no CLI support for creating it.

This project adds a `--hooks` flag to `claudelint init` so the full setup can be done in one command, and adds documentation so users can tell Claude "set up claudelint" and have it handle everything automatable.

Plugin installation (`/plugin marketplace add`, `/plugin install`) cannot be automated via bash -- those remain manual slash commands in the Claude Code UI.

---

## Phase 1: CLI — Add `--hooks` Flag

### 1.1 Add hooks path constant

Add `projectHooks: '.claude/hooks/hooks.json'` to `INIT_DETECTION_PATHS` in `src/utils/filesystem/patterns.ts`.

- [x] Add constant
- [x] Verify no existing references break

### 1.2 Add `--hooks` flag registration

Update `src/cli/commands/config-commands.ts` to register the `--hooks` option on the `init` command. Update the action handler type signature.

- [x] Add `.option('--hooks', 'Create SessionStart validation hook for Claude Code')`
- [x] Update action handler type to include `hooks?: boolean`

### 1.3 Extend InitWizard core logic

Update `src/cli/init-wizard.ts`:

- [x] Add `mkdirSync` to `fs` import
- [x] Add `hasProjectHooks: boolean` to `ProjectInfo` interface
- [x] Add `setupHooks?: boolean` to `WizardAnswers` interface
- [x] Update `run()` signature to accept `hooks?: boolean`
- [x] Update `detectProject()` to detect `.claude/hooks/hooks.json`
- [x] Display hooks detection in `displayProjectInfo()`

### 1.4 Implement `writeHooksFile()` method

Add new method to InitWizard following the `writeConfig`/`writeIgnoreFile` pattern:

- [x] Create `.claude/hooks/` directories with `mkdirSync({ recursive: true })`
- [x] Write SessionStart command hook (`claudelint check-all --format json`)
- [x] Skip if exists without `--force` (with warning message)
- [x] Overwrite if `--force` is set

### 1.5 Wire hooks into `--yes` code path

- [x] After `createPresetConfig()`, call `writeHooksFile()` when `--hooks` is passed
- [x] `--yes` alone does NOT create hooks (preserves existing behavior)

### 1.6 Wire hooks into interactive code path

- [x] Add prompt: "Set up automatic validation hook for Claude Code?"
- [x] Default yes if `.claude/` or `CLAUDE.md` exists
- [x] Skip prompt if hooks file already exists
- [x] Skip prompt if `--hooks` flag is passed (explicit opt-in)
- [x] Call `writeHooksFile()` if user answers yes or `--hooks` passed

### 1.7 Update `displayNextSteps()`

- [x] If hooks created: show confirmation message
- [x] If no hooks and none exist: show tip about `--hooks` flag

### 1.8 Verify Phase 1

- [x] `npm run build` succeeds
- [x] Manual test: `claudelint init --yes --hooks` in temp dir creates all 3 files
- [x] Manual test: `claudelint init --yes` in temp dir does NOT create hooks file
- [ ] Manual test: `claudelint init` interactive shows hooks prompt (requires TTY)

---

## Phase 2: Tests

### 2.1 Unit tests for hooks creation

Add `describe('--hooks flag')` block to `tests/cli/init-wizard.test.ts`:

- [x] `--yes --hooks` creates `.claude/hooks/hooks.json` with correct SessionStart content
- [x] `--yes` alone does NOT create hooks file
- [x] Skips existing hooks file without `--force`
- [x] `--force` overwrites existing hooks file
- [x] Creates `.claude/hooks/` directories when they don't exist

### 2.2 Integration tests

Add to `tests/integration/cli.test.ts`:

- [x] `init --yes --hooks` via subprocess creates hooks file
- [x] `init --yes` via subprocess does not create hooks file

### 2.3 Verify Phase 2

- [x] `npm test` full suite passes (1737 tests, 204 suites)
- [x] `npm run check:self` passes

---

## Phase 3: Documentation

### 3.1 Getting Started — "Set Up with Claude" section

Update `website/guide/getting-started.md`:

- [x] Add new section after "Use with Claude Code"
- [x] Include natural language prompt users can paste into Claude
- [x] Show what commands Claude will run
- [x] List what files get created
- [x] Note that plugin install is manual (slash commands)

### 3.2 CLI Reference — update `init` command

Update `website/guide/cli-reference.md`:

- [x] Add `--hooks` to the options table
- [x] Add `claudelint init --yes --hooks` example
- [x] Add `.claude/hooks/hooks.json` to "What it creates" list

### 3.3 Hooks page — add quick setup

Update `website/integrations/hooks.md`:

- [x] Add "Quick Setup" with `claudelint init --hooks` before existing manual JSON
- [x] Keep existing manual setup as reference

### 3.4 Plugin page — update automatic validation

Update `website/integrations/claude-code-plugin.md`:

- [x] Update "Automatic Validation" section to reference `claudelint init --hooks`

### 3.5 Verify Phase 3

- [x] `npm run docs:build` succeeds
- [ ] Preview all 4 updated pages in dev server
- [ ] Links resolve correctly

---

## Phase 4: Final Validation

### 4.1 Full validation pass

- [x] `npm run validate` (lint + format + build + test)
- [x] `npm run check:self` (dogfood)
- [x] `npm run docs:build` (site build)

### 4.2 Commit and push

- [ ] Commit with `feat(cli): add --hooks flag to init command for SessionStart setup`
- [ ] Push to remote

---

## Key Files

| File | Change |
|------|--------|
| `src/utils/filesystem/patterns.ts` | Add `projectHooks` constant |
| `src/cli/init-wizard.ts` | Core: `writeHooksFile()`, hooks in `run()`, interactive prompt, next steps |
| `src/cli/commands/config-commands.ts` | Register `--hooks` flag |
| `tests/cli/init-wizard.test.ts` | Unit tests for hooks creation |
| `tests/integration/cli.test.ts` | Integration tests for CLI flags |
| `website/guide/getting-started.md` | "Set Up with Claude" section |
| `website/guide/cli-reference.md` | Update init command docs |
| `website/integrations/hooks.md` | Add quick setup option |
| `website/integrations/claude-code-plugin.md` | Update automatic validation |
