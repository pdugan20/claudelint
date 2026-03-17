---
outline: [2, 3]
description: Fix common claudelint errors including CLAUDE.md issues, skill misconfigurations, cache problems, CI failures, and custom rule debugging.
---

# Troubleshooting

Solutions for common errors, cache issues, CI failures, and custom rule debugging. If your issue isn't listed here, [open a GitHub issue](https://github.com/pdugan20/claudelint/issues).

## Reading Error Output

claudelint error messages follow this format:

```text
/path/to/file.md (1 error)
12  error  Referenced skill not found: authentication  skill-referenced-file-not-found

1 problem (1 error, 0 warnings)
```

- **Path**: `/path/to/file.md (1 error)` — File with the issue and count
- **Line**: `12` — Line number (0 for file-level issues)
- **Severity**: `error` or `warning`
- **Message**: `Referenced skill not found: authentication` — What's wrong
- **Rule ID**: `skill-referenced-file-not-found` — Which rule triggered this

Every rule ID links to a documentation page with examples and fix guidance. Browse the [Rules Reference](/rules/overview) or use `claudelint check-all --explain` for inline details.

## Common Errors by Category

Errors grouped by validator. Each entry links to the full rule documentation.

### File exceeds size limit

**Problem:** CLAUDE.md file exceeds the recommended 40KB limit (configurable).

**Solution:** Split content into smaller files using `@import`:

```markdown
<!-- CLAUDE.md -->

@import ./docs/architecture.md
@import ./docs/api-reference.md
```

Also check for embedded data (base64 images, large code blocks) and use external links instead of inline content.

**See:** [claude-md-size](/rules/claude-md/claude-md-size)

### Imported file not found

**Problem:** `@import` statement references a file that doesn't exist.

**Solution:**

1. Check file path is correct (relative to CLAUDE.md)
2. Verify file exists in the repository
3. Check for typos in filename and file extension

**See:** [claude-md-import-missing](/rules/claude-md/claude-md-import-missing)

### Circular import detected

**Problem:** File A imports File B, which imports File A (directly or indirectly).

**Solution:**

1. Restructure imports to be hierarchical (tree, not graph)
2. Extract shared content to a common file
3. Remove redundant imports

**See:** [claude-md-import-circular](/rules/claude-md/claude-md-import-circular)

### Missing version field

**Problem:** SKILL.md missing required `version` field in frontmatter.

**Solution:** Add version to frontmatter:

```yaml
---
name: my-skill
description: Does something
version: 1.0.0
---
```

Run `claudelint check-all --fix` to auto-fix.

**See:** [skill-missing-version](/rules/skills/skill-missing-version)

### Skill name-directory mismatch

**Problem:** Skill's `name` field doesn't match its directory name.

**Solution:** Either rename the directory to match the skill name, or update the `name` field in frontmatter to match the directory.

**See:** [skill-name-directory-mismatch](/rules/skills/skill-name-directory-mismatch)

### Missing shebang

**Problem:** Executable `.sh` file doesn't start with a shebang line.

**Solution:** Add `#!/usr/bin/env bash` as the first line of the script. Run `claudelint check-all --fix` to auto-fix.

**See:** [skill-missing-shebang](/rules/skills/skill-missing-shebang)

### Referenced path not found

**Problem:** Settings file references a path that doesn't exist on disk.

**Solution:**

1. Create the missing directory or file
2. Fix the path in settings.json
3. Remove the reference if no longer needed

**See:** [settings-file-path-not-found](/rules/settings/settings-file-path-not-found)

### Hook script not found

**Problem:** hooks.json references a command script that doesn't exist.

**Solution:**

1. Create the missing script
2. Fix the path in hooks.json
3. Verify the path is relative to `.claude/hooks.json`

**See:** [hooks-missing-script](/rules/hooks/hooks-missing-script)

## CI/CD Issues

### Hook not running at session start

**Problem:** SessionStart hook runs but Claude doesn't mention validation results.

SessionStart command hooks send output to Claude's context, not your terminal. If Claude doesn't mention results:

**Solution:**

1. Verify `.claude/hooks.json` (or `.claude/hooks/hooks.json`) exists
2. Validate: `claudelint validate-hooks`
3. Check event name is `"SessionStart"` (capital S)
4. Test the command manually: `claudelint check-all --format json`

### Environment variables in CI

**Problem:** Color or notification behavior is wrong in CI environments.

**Solution:**

- **Suppress update notifications:** Set `CI=true` or `NO_UPDATE_NOTIFIER=1`
- **Force color:** `FORCE_COLOR=1 claudelint check-all` or `claudelint check-all --color`
- **Disable color:** `NO_COLOR=1 claudelint check-all` or `claudelint check-all --no-color`

## Cache Issues

### Stale results after upgrade

**Problem:** After upgrading claudelint, you still see old validation results or missing new rules.

The cache stores results keyed by version and build fingerprint. In rare cases (e.g., reinstalling the same version), stale entries may persist.

**Solution:** `claudelint cache-clear`

### Cache not invalidating

**Problem:** You edited a file but claudelint still reports old results.

Cache invalidation is mtime-based. If a file's modification time didn't change (e.g., `git checkout` restoring a file), the cache considers it unchanged.

**Solution:**

1. Clear the cache: `claudelint cache-clear`
2. Bypass for one run: `claudelint check-all --no-cache`
3. Touch the file: `touch CLAUDE.md`

### Auto-fix not applying

**Problem:** Running `--fix` reports issues but doesn't modify files.

The rule likely doesn't support auto-fix. Only rules with `fixable: true` apply changes.

**Solution:** `claudelint list-rules --fixable` to see which rules support auto-fix.

### Fixes failed

**Problem:** "N fixes failed" message appears after running `--fix`.

Possible causes: file doesn't exist, invalid file content (can't parse frontmatter), or permission denied.

**Solution:** Run with `--verbose` to see detailed error messages. Check file permissions with `ls -l`.

### Auto-fix makes unexpected changes

**Problem:** A fix modifies files in an unintended way.

**Solution:** Always use `--fix-dry-run` first to preview changes. Use `git checkout .` to revert if needed. [Report an issue](https://github.com/pdugan20/claudelint/issues) if a fix is incorrect, including original content and the diff from `--fix-dry-run`.

## Inline Disable Issues

### Disable directive not working

**Problem:** `<!-- claudelint-disable-next-line rule-id -->` doesn't suppress the violation.

**Solution:**

1. Verify syntax: `<!-- claudelint-disable-next-line rule-id -->`
2. Check rule ID spelling: run `claudelint list-rules`
3. Confirm the directive is immediately before the violation (no blank lines between them)

### Unused disable warnings

**Problem:** claudelint warns about a disable directive that doesn't suppress any violations.

`reportUnusedDisableDirectives` is enabled and the targeted rule no longer triggers on that line.

**Solution:**

1. Remove the disable if the violation has been fixed
2. Fix the underlying issue instead of disabling
3. Set `"reportUnusedDisableDirectives": false` in config to turn off detection

### Wrong line affected by disable

**Problem:** `disable-next-line` doesn't suppress the expected violation.

`disable-next-line` affects the line immediately after the comment. If there's a blank line between the comment and the violation, it won't work. Use `disable-line` to disable the current line instead.

## Custom Rules Issues

For in-depth custom rule debugging, see the [Custom Rules Troubleshooting](/development/custom-rules-troubleshooting) guide.

### Custom rule not loading

**Problem:** `Failed to load custom rule` error.

**Solution:**

1. Verify file is in `.claudelint/rules/` directory
2. Check file extension is `.ts` or `.js` (not `.d.ts`, `.test.ts`)
3. Ensure a named `rule` export is used:

   ```typescript
   import type { Rule } from 'claude-code-lint';

   export const rule: Rule = {
     meta: {
       /* ... */
     },
     validate: async (context) => {
       /* ... */
     },
   };
   ```

4. Check for syntax errors in the rule file

### Custom rule not executing

**Problem:** Rule loads without error but doesn't report any violations.

**Solution:**

1. Check rule is enabled in `.claudelintrc.json`:

   ```json
   {
     "rules": {
       "my-custom-rule": "error"
     }
   }
   ```

2. Verify `context.report()` is being called
3. Add `console.log` statements to trace execution

## stdin and Editor Integration

### stdin not reading input

**Problem:** `claudelint check-all --stdin` hangs or times out.

stdin mode expects piped input. Running it interactively (without piped data) will timeout after 5 seconds.

**Solution:**

```bash
cat CLAUDE.md | claudelint check-all --stdin --stdin-filename CLAUDE.md
```

### No matching validator

**Problem:** `Exit code 2` with error about no matching validator.

The `--stdin-filename` doesn't match any validator's file patterns.

**Solution:** Use a filename that matches a known pattern:

```bash
# CLAUDE.md files
cat content.md | claudelint check-all --stdin --stdin-filename CLAUDE.md

# Settings
cat settings.json | claudelint check-all --stdin --stdin-filename .claude/settings.json

# Hooks
cat hooks.json | claudelint check-all --stdin --stdin-filename .claude/hooks.json
```

## Incremental Linting

### Slow on large projects

**Problem:** `claudelint check-all` takes a long time because it checks every file.

**Solution:** Use VCS-aware flags to check only changed files:

```bash
# Check only uncommitted changes
claudelint check-all --changed

# Check only files changed since a branch
claudelint check-all --since main

# Check only files changed since a tag
claudelint check-all --since v0.1.0
```

These flags require a git repository. If you're not in a git repo, you'll see a helpful error message.

## Getting More Help

If you can't find a solution here:

1. **Search existing issues:** [GitHub Issues](https://github.com/pdugan20/claudelint/issues)
2. **Check documentation:** [Getting Started](./getting-started.md), [Configuration](./configuration.md), [CLI Reference](./cli-reference.md)
3. **Enable verbose output:** `claudelint check-all --verbose`
4. **Open a new issue** with: command you ran, error message, OS and Node version, verbose output
