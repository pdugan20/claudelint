# Troubleshooting Guide

This guide helps you quickly resolve common issues with claude-code-lint.

## Quick Rule Lookup

When claude-code-lint reports an error, the rule ID is shown in the output. Use this table to find the documentation for that rule:

### CLAUDE.md Rules

| Error Code                         | Description                 | Documentation                                                                                |
| ---------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------- |
| `claude-md-size-error`             | File exceeds 10MB limit     | [claude-md-size-error.md](./rules/claude-md/claude-md-size-error.md)                         |
| `claude-md-size-warning`           | File approaching size limit | [claude-md-size-warning.md](./rules/claude-md/claude-md-size-warning.md)                     |
| `claude-md-import-missing`         | Imported file not found     | [claude-md-import-missing.md](./rules/claude-md/claude-md-import-missing.md)                 |
| `claude-md-import-circular`        | Circular import detected    | [claude-md-import-circular.md](./rules/claude-md/claude-md-import-circular.md)               |
| `claude-md-import-depth-exceeded`  | Too many nested imports     | [claude-md-import-depth-exceeded.md](./rules/claude-md/claude-md-import-depth-exceeded.md)   |
| `claude-md-import-in-code-block`   | Import in code block        | [claude-md-import-in-code-block.md](./rules/claude-md/claude-md-import-in-code-block.md)     |
| `claude-md-glob-pattern-too-broad` | Glob pattern too broad      | [claude-md-glob-pattern-too-broad.md](./rules/claude-md/claude-md-glob-pattern-too-broad.md) |
| `claude-md-file-not-found`         | CLAUDE.md not found         | [claude-md-file-not-found.md](./rules/claude-md/claude-md-file-not-found.md)                 |

### Skills Rules

| Error Code                        | Description                    | Documentation                                                                           |
| --------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------- |
| `skill-missing-version`           | Skill lacks version field      | [skill-missing-version.md](./rules/skills/skill-missing-version.md)                     |
| `skill-version`                   | Invalid version format         | [skill-version.md](./rules/skills/skill-version.md)                                     |
| `skill-name`                      | Invalid skill name             | [skill-name.md](./rules/skills/skill-name.md)                                           |
| `skill-name-directory-mismatch`   | Name doesn't match directory   | [skill-name-directory-mismatch.md](./rules/skills/skill-name-directory-mismatch.md)     |
| `skill-description`               | Missing or invalid description | [skill-description.md](./rules/skills/skill-description.md)                             |
| `skill-referenced-file-not-found` | Referenced file missing        | [skill-referenced-file-not-found.md](./rules/skills/skill-referenced-file-not-found.md) |
| `skill-missing-changelog`         | CHANGELOG.md not found         | [skill-missing-changelog.md](./rules/skills/skill-missing-changelog.md)                 |
| `skill-missing-shebang`           | Shell script lacks shebang     | [skill-missing-shebang.md](./rules/skills/skill-missing-shebang.md)                     |
| `skill-dangerous-command`         | Dangerous shell command        | [skill-dangerous-command.md](./rules/skills/skill-dangerous-command.md)                 |

### Settings Rules

| Error Code                     | Description                   | Documentation                                                                       |
| ------------------------------ | ----------------------------- | ----------------------------------------------------------------------------------- |
| `settings-file-path-not-found` | Referenced path doesn't exist | [settings-file-path-not-found.md](./rules/settings/settings-file-path-not-found.md) |
| `settings-invalid-permission`  | Invalid permission rule       | [settings-invalid-permission.md](./rules/settings/settings-invalid-permission.md)   |
| `settings-invalid-env-var`     | Invalid environment variable  | [settings-invalid-env-var.md](./rules/settings/settings-invalid-env-var.md)         |

### Hooks Rules

| Error Code             | Description               | Documentation                                                    |
| ---------------------- | ------------------------- | ---------------------------------------------------------------- |
| `hooks-missing-script` | Hook script not found     | [hooks-missing-script.md](./rules/hooks/hooks-missing-script.md) |
| `hooks-invalid-event`  | Invalid hook event name   | [hooks-invalid-event.md](./rules/hooks/hooks-invalid-event.md)   |
| `hooks-invalid-config` | Invalid hooks.json schema | [hooks-invalid-config.md](./rules/hooks/hooks-invalid-config.md) |

### MCP Rules

| Error Code                  | Description           | Documentation                                                            |
| --------------------------- | --------------------- | ------------------------------------------------------------------------ |
| `mcp-http-invalid-url`      | Invalid HTTP URL      | [mcp-http-invalid-url.md](./rules/mcp/mcp-http-invalid-url.md)           |
| `mcp-sse-invalid-url`       | Invalid SSE URL       | [mcp-sse-invalid-url.md](./rules/mcp/mcp-sse-invalid-url.md)             |
| `mcp-websocket-invalid-url` | Invalid WebSocket URL | [mcp-websocket-invalid-url.md](./rules/mcp/mcp-websocket-invalid-url.md) |

For a complete list of all rules, run:

```bash
claude-code-lint list-rules
```

---

## Common Errors by Category

### CLAUDE.md Issues

#### Error: "CLAUDE.md file exceeds 10MB size limit"

**Cause:** Your CLAUDE.md file is too large for Claude's 10MB context window.

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

**See:** [claude-md-size-error](./rules/claude-md/claude-md-size-error.md)

#### Error: "Imported file not found"

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

**See:** [claude-md-import-missing](./rules/claude-md/claude-md-import-missing.md)

#### Error: "Circular import detected"

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

**See:** [claude-md-import-circular](./rules/claude-md/claude-md-import-circular.md)

---

### Skills Issues

#### Error: "Skill frontmatter lacks 'version' field"

**Cause:** SKILL.md missing required `version` field in frontmatter.

**Example:**

```yaml
---
name: my-skill
description: Does something
---
```

**Solution:**

Add version to frontmatter:

```yaml
---
name: my-skill
description: Does something
version: 1.0.0
---
```

**Auto-fix:** Run `claude-code-lint check-all --fix` to automatically add `version: "1.0.0"`.

**See:** [skill-missing-version](./rules/skills/skill-missing-version.md)

#### Error: "Skill name does not match directory name"

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

**See:** [skill-name-directory-mismatch](./rules/skills/skill-name-directory-mismatch.md)

#### Error: "Shell script missing shebang"

**Cause:** Executable `.sh` file doesn't start with `#!/bin/bash` or similar.

**Solution:**

Add shebang to first line of script:

```bash
#!/usr/bin/env bash

# Rest of script...
```

**Auto-fix:** Run `claude-code-lint check-all --fix` to automatically add shebang.

**See:** [skill-missing-shebang](./rules/skills/skill-missing-shebang.md)

---

### Settings Issues

#### Error: "Referenced file path not found"

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

**See:** [settings-file-path-not-found](./rules/settings/settings-file-path-not-found.md)

---

### Hooks Issues

#### Error: "Hook script not found"

**Cause:** hooks.json references a script that doesn't exist.

**Example:**

```json
{
  "hooks": [
    {
      "event": "SessionStart",
      "type": "script",
      "command": "./scripts/missing-script.sh"
    }
  ]
}
```

**Solutions:**

1. Create the missing script
2. Fix the path in hooks.json
3. Verify path is relative to project root

**See:** [hooks-missing-script](./rules/hooks/hooks-missing-script.md)

---

## Frequently Asked Questions

### Configuration

#### Q: How do I disable a specific rule?

Set the rule to `"off"` in `.claudelintrc.json`:

```json
{
  "rules": {
    "skill-missing-changelog": "off"
  }
}
```

See [Configuration Guide](./configuration.md) for details.

#### Q: How do I disable a rule for one file?

Use inline disable comments:

```markdown
<!-- claude-code-lint-disable-next-line import-missing -->

@import optional-file.md
```

See [Inline Disables](./inline-disables.md) for details.

#### Q: Where should I put my config file?

claude-code-lint searches for config files starting from the current directory and moving up:

Supported files:

- `.claudelintrc.json`
- `.claudelintrc.js`
- `package.json` (with `claudelint` key)

Place it in your project root for best results.

#### Q: How do I see which config is being used?

Run:

```bash
claude-code-lint print-config
```

This shows the resolved configuration with all defaults.

---

### Validation

#### Q: Why am I getting errors for files in node_modules?

Add a `.claudelintignore` file:

```text
node_modules/
dist/
coverage/
```

See [Configuration - Ignoring Files](./configuration.md#ignoring-files) for details.

#### Q: Can I run only one validator?

Yes, use specific commands:

```bash
claude-code-lint check-claude-md
claude-code-lint validate-skills
claude-code-lint validate-settings
```

See [CLI Reference](./cli-reference.md) for all commands.

#### Q: How do I get more detailed error output?

Use the `--verbose` flag:

```bash
claude-code-lint check-all --verbose
```

This shows timing information and additional context.

---

### Auto-Fix

#### Q: Which rules can be auto-fixed?

Run:

```bash
claude-code-lint list-rules --fixable
```

This shows all rules that support auto-fix.

#### Q: How do I preview fixes without applying them?

Use `--fix-dry-run`:

```bash
claude-code-lint check-all --fix-dry-run
```

This shows what would be fixed without making changes.

#### Q: Can I auto-fix only errors (not warnings)?

Yes:

```bash
claude-code-lint check-all --fix --fix-type errors
```

See [Auto-fix Guide](./auto-fix.md) for details.

---

### Performance

#### Q: Validation is slow, how can I speed it up?

1. **Use caching** (enabled by default):

   ```bash
   claude-code-lint check-all  # Uses cache
   ```

2. **Add ignore patterns** in `.claudelintignore`:

   ```text
   node_modules/
   dist/
   *.log
   ```

3. **Check timing** to find slow validators:

   ```bash
   claude-code-lint check-all --verbose
   ```

See [Caching Guide](./caching.md) for details.

#### Q: How do I clear the cache?

```bash
claude-code-lint cache-clear
```

Run this after upgrading claude-code-lint or changing config.

---

### Installation

#### Q: Command not found after installation

**Global install:**

```bash
npm install -g claude-code-lint
claude-code-lint --version
```

**Project install:**

```bash
npm install --save-dev claude-code-lint
npx claude-code-lint --version
```

**Or use full path:**

```bash
./node_modules/.bin/claude-code-lint --version
```

#### Q: Permission denied when installing globally

**macOS/Linux:**

```bash
sudo npm install -g claude-code-lint
```

**Or configure npm to install without sudo:**

```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
npm install -g claude-code-lint
```

---

## Error Message Guide

### Understanding Error Output

claude-code-lint error messages follow this format:

```text
/path/to/file.md
  12:1  error  Referenced skill not found: authentication  skill-referenced-file-not-found

x 1 problem (1 error, 0 warnings)
```

Breaking it down:

- **Path**: `/path/to/file.md` - File with the issue
- **Location**: `12:1` - Line 12, column 1
- **Severity**: `error` or `warning`
- **Message**: `Referenced skill not found: authentication` - What's wrong
- **Rule ID**: `skill-referenced-file-not-found` - Which rule triggered this

### Looking Up Rule Details

To see full documentation for a rule:

1. Note the rule ID from the error (e.g., `skill-referenced-file-not-found`)
2. Find it in the [Quick Rule Lookup](#quick-rule-lookup) table above
3. Click the documentation link for detailed explanation

Or use the CLI:

```bash
claude-code-lint explain skill-referenced-file-not-found
```

---

## Configuration Issues

### Problem: Config file not found

**Error:** `No configuration found`

**Solutions:**

1. Create `.claudelintrc.json` in project root:

   ```bash
   claude-code-lint init
   ```

2. Or add config to `package.json`:

   ```json
   {
     "claudelint": {
       "rules": {
         "skill-missing-version": "error"
       }
     }
   }
   ```

3. Or specify config path:

   ```bash
   claude-code-lint check-all --config /path/to/config.json
   ```

### Problem: Rules not being applied

**Error:** Rules show in `list-rules` but don't trigger

**Solutions:**

1. **Verify config syntax:**

   ```bash
   cat .claudelintrc.json | jq
   ```

2. **Check rule names match exactly:**

   ```json
   {
     "rules": {
       "skill-missing-version": "error" // Correct
       // "skillMissingVersion": "error"  // Wrong (not kebab-case)
     }
   }
   ```

3. **View resolved config:**

   ```bash
   claude-code-lint print-config
   ```

### Problem: JSON parsing error

**Error:** `Unexpected token } in JSON`

**Solution:**

Validate your JSON syntax:

```bash
cat .claudelintrc.json | jq
```

Common mistakes:

- Trailing commas
- Missing quotes around keys
- Incorrect string escaping

---

## CI/CD Issues

### Problem: Exit code not as expected

**Before v1.0:**

- Exit 2 for errors
- Exit 1 for warnings

**After v1.0 (current):**

- Exit 1 for any linting issues (errors OR warnings)
- Exit 0 for success
- Exit 2 only for fatal errors (crashes, invalid config)

**Migration:**

```bash
# Most CI systems check for non-zero exit
claude-code-lint check-all || exit 1

# If you were checking for exit code 2:
# Before: if [ $? -eq 2 ]; then ...
# After:  if [ $? -eq 1 ]; then ...
```

See [README - Exit Code Changes](../README.md#exit-code-changes-v10-breaking-change).

### Problem: Hook doesn't run at session start

**Solutions:**

1. Verify `.claude/hooks/hooks.json` exists
2. Validate: `claude-code-lint validate-hooks`
3. Check event name is `"SessionStart"` (capital S)
4. Test command manually first:

   ```bash
   claude-code-lint check-all --format compact
   ```

---

## Custom Rules Issues

### Problem: Custom rule not loading

**Error:** `Failed to load custom rule`

**Solutions:**

1. Verify file is in `.claude-code-lint/rules/` directory
2. Check file extension is `.js` or `.ts` (not `.d.ts`, `.test.ts`)
3. Ensure `module.exports.rule` is used:

   ```javascript
   module.exports.rule = {
     meta: {
       /* ... */
     },
     validate: async (context) => {
       /* ... */
     },
   };
   ```

4. Check for syntax errors in the rule file

See [Custom Rules Guide](./rule-development.md#part-2-writing-custom-rules) for details.

### Problem: Custom rule not executing

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

   ```javascript
   validate: async (context) => {
     console.log('Validating:', context.filePath);
     // ...
   };
   ```

---

## Getting More Help

If you can't find a solution here:

1. **Search existing issues:** [GitHub Issues](https://github.com/pdugan20/claude-code-lint/issues)
2. **Check documentation:**
   - [Getting Started](./getting-started.md)
   - [Configuration](./configuration.md)
   - [CLI Reference](./cli-reference.md)
3. **Enable verbose output:**

   ```bash
   claude-code-lint check-all --verbose
   ```

4. **Open a new issue** with:
   - Command you ran
   - Error message
   - OS and Node version (`node --version`)
   - Output of `claude-code-lint check-all --verbose`

---

## Quick Reference

### Most Common Commands

```bash
# Initialize config
claude-code-lint init

# Run all validation
claude-code-lint check-all

# List all rules
claude-code-lint list-rules

# Auto-fix issues
claude-code-lint check-all --fix

# Check config
claude-code-lint print-config

# Clear cache
claude-code-lint cache-clear

# Get help
claude-code-lint --help
```

### Common Config Patterns

```json
{
  "rules": {
    "skill-missing-version": "off",
    "claude-md-size-warning": "warn",
    "skill-dangerous-command": "error"
  },
  "extends": [],
  "ignorePatterns": ["node_modules/", "dist/"]
}
```

See [Configuration Guide](./configuration.md) for complete reference.
