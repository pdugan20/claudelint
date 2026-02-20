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

### CLAUDE.md Issues

File size, `@import` resolution, and circular dependency errors.

::: details File exceeds size limit
**Cause:** Your CLAUDE.md file exceeds the recommended 40KB limit (configurable). Files this large should be split into smaller, focused files using `@import`.

**Solutions:**

1. Split content into smaller files and use `@import`:

   ```markdown
   <!-- CLAUDE.md -->

   @import ./docs/architecture.md
   @import ./docs/api-reference.md
   ```

2. Remove embedded data (base64 images, large code blocks)
3. Use external links instead of inline content
4. Check for accidentally included binary data

**See:** [claude-md-size](/rules/claude-md/claude-md-size)
:::

::: details Imported file not found
**Cause:** `@import` statement references a file that doesn't exist.

**Example:**

```markdown
@import ./nonexistent-file.md
```

**Solutions:**

1. Check file path is correct (relative to CLAUDE.md)
2. Verify file exists in the repository
3. Check for typos in filename
4. Ensure proper file extension (.md, .txt, etc.)

**See:** [claude-md-import-missing](/rules/claude-md/claude-md-import-missing)
:::

::: details Circular import detected
**Cause:** File A imports File B, which imports File A (directly or indirectly).

**Example:**

```markdown
<!-- CLAUDE.md -->

@import ./docs/setup.md

<!-- setup.md -->

@import ../CLAUDE.md <!-- Circular! -->
```

**Solutions:**

1. Restructure imports to be hierarchical (tree, not graph)
2. Extract shared content to a common file
3. Remove redundant imports

**See:** [claude-md-import-circular](/rules/claude-md/claude-md-import-circular)
:::

### Skills Issues

Frontmatter validation, naming conventions, and shell script checks.

::: details Missing version field
**Cause:** SKILL.md missing required `version` field in frontmatter.

**Example:**

```yaml
---
name: my-skill
description: Does something
---
```

**Solution:** Add version to frontmatter:

```yaml
---
name: my-skill
description: Does something
version: 1.0.0
---
```

**Auto-fix:** Run `claudelint check-all --fix` to automatically add `version: "1.0.0"`.

**See:** [skill-missing-version](/rules/skills/skill-missing-version)
:::

::: details Name-directory mismatch
**Cause:** Skill's `name` field doesn't match its directory.

**Example:**

```text
.claude/skills/user-auth/SKILL.md

Frontmatter:
name: authentication  <!-- Doesn't match directory 'user-auth' -->
```

**Solutions:**

1. Rename directory to match skill name
2. Update skill name in frontmatter to match directory

**See:** [skill-name-directory-mismatch](/rules/skills/skill-name-directory-mismatch)
:::

::: details Missing shebang
**Cause:** Executable `.sh` file doesn't start with `#!/bin/bash` or similar.

**Solution:** Add shebang to first line of script:

```bash
#!/usr/bin/env bash

# Rest of script...
```

**Auto-fix:** Run `claudelint check-all --fix` to automatically add shebang.

**See:** [skill-missing-shebang](/rules/skills/skill-missing-shebang)
:::

### Settings Issues

Path references and configuration structure.

::: details Referenced path not found
**Cause:** Settings file references a path that doesn't exist.

**Example:**

```json
{
  "commandPaths": ["./nonexistent-commands"]
}
```

**Solutions:**

1. Create the missing directory/file
2. Fix the path in settings.json
3. Remove the reference if no longer needed

**See:** [settings-file-path-not-found](/rules/settings/settings-file-path-not-found)
:::

### Hooks Issues

Script references and event configuration.

::: details Hook script not found
**Cause:** hooks.json references a script that doesn't exist.

**Example:**

```json
{
  "SessionStart": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "./scripts/missing-script.sh"
        }
      ]
    }
  ]
}
```

**Solutions:**

1. Create the missing script
2. Fix the path in hooks.json
3. Verify path is relative to `.claude/hooks.json`

**See:** [hooks-missing-script](/rules/hooks/hooks-missing-script)
:::

## CI/CD Issues

### Hook not running at session start

**Note:** SessionStart command hooks send output to Claude's context, not your terminal. Claude will mention any issues when you start chatting. If Claude doesn't mention validation results:

**Solutions:**

1. Verify `.claude/hooks.json` (or `.claude/hooks/hooks.json`) exists
2. Validate: `claudelint validate-hooks`
3. Check event name is `"SessionStart"` (capital S)
4. Test the command manually to confirm it works:

   ```bash
   claudelint check-all --format json
   ```

### Environment variables

**Update notification in CI:** Set `CI=true` or `NO_UPDATE_NOTIFIER=1` to suppress version check notifications.

**No color in CI:** Force color with `FORCE_COLOR=1 claudelint check-all` or `claudelint check-all --color`.

**Unwanted color in logs:** Disable with `NO_COLOR=1 claudelint check-all` or `claudelint check-all --no-color`.

## Cache Issues

### Stale results after upgrade

**Symptom:** After upgrading claudelint, you still see old validation results or missing new rules.

**Cause:** The cache stores results keyed by claudelint version and build fingerprint. In rare cases (e.g., reinstalling the same version), stale entries may persist.

**Solution:**

```bash
claudelint cache-clear
```

### Cache not invalidating

**Symptom:** You edited a file but claudelint still reports old results.

**Cause:** Cache invalidation is mtime-based. If a file's modification time didn't change (e.g., `git checkout` restoring a file to its previous state), the cache considers it unchanged.

**Solutions:**

1. Clear the cache: `claudelint cache-clear`
2. Bypass for one run: `claudelint check-all --no-cache`
3. Touch the file: `touch CLAUDE.md`

### Auto-fix not applying

**Symptom:** Running `--fix` reports issues but doesn't modify files.

**Cause:** The rule likely doesn't support auto-fix. Only rules with `fixable: true` apply changes.

**Solution:**

```bash
claudelint list-rules --fixable
```

## Custom Rules Issues

### Custom rule not loading

**Error:** `Failed to load custom rule`

**Solutions:**

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

See [Custom Rules Guide](/development/custom-rules) for details.

### Custom rule not executing

**Solutions:**

1. Check rule is enabled in `.claudelintrc.json`:

   ```json
   {
     "rules": {
       "my-custom-rule": "error"
     }
   }
   ```

2. Verify `context.report()` is being called
3. Add debug logging:

   ```typescript
   validate: async (context) => {
     console.log('Validating:', context.filePath);
     // ...
   };
   ```

## stdin and Editor Integration

### stdin not reading input

**Symptom:** `claudelint check-all --stdin` hangs or times out.

**Cause:** stdin mode expects piped input. Running it interactively (without piped data) will timeout after 5 seconds.

**Solution:**

```bash
cat CLAUDE.md | claudelint check-all --stdin --stdin-filename CLAUDE.md
```

### No matching validator

**Symptom:** `Exit code 2` with error about no matching validator.

**Cause:** The `--stdin-filename` doesn't match any validator's file patterns.

**Solution:**

Use a filename that matches a known pattern:

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

**Symptom:** `claudelint check-all` takes a long time because it checks every file.

**Solution:**

Use VCS-aware flags to check only changed files:

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
