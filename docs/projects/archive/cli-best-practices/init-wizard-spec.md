# Init Wizard Modernization Spec

**Last Updated**: 2026-02-14

---

## Current State

The init wizard (`src/cli/init-wizard.ts`) works and provides a solid interactive setup:

- Detects project structure (CLAUDE.md, .claude/, skills, settings, hooks, MCP, plugin)
- Detects optional tools (ShellCheck, Prettier, Markdownlint)
- Interactive prompts (defaults, ignore patterns, output format, npm scripts)
- `--yes` flag for non-interactive use
- Generates `.claudelintrc.json`, `.claudelintignore`, and optional npm scripts

## Issues to Address

### 1. Missing Component Detection

The wizard detects 7 components but misses 3 that our validators already support:

| Component | Detected | Validator |
|-----------|----------|-----------|
| CLAUDE.md | Yes | validate-claude-md |
| .claude/ directory | Yes | (container) |
| Skills | Yes | validate-skills |
| Settings | Yes | validate-settings |
| Hooks | Yes | validate-hooks |
| MCP servers | Yes | validate-mcp |
| Plugin manifest | Yes | validate-plugin |
| **Agents** | **No** | validate-agents |
| **Output styles** | **No** | validate-output-styles |
| **Commands** | **No** | validate-commands |

**Fix**: Add detection for `.claude/agents/`, `.claude/output-styles/`, `.claude/commands/`.

### 2. Hardcoded Rule Configuration

The wizard generates a config with 5 hardcoded rule IDs:

```json
{
  "rules": {
    "size-error": "error",
    "size-warning": "warn",
    "import-missing": "error",
    "skill-dangerous-command": "error",
    "skill-missing-changelog": "off"
  }
}
```

**Problems:**

- Rules may be added, renamed, or removed over time
- No connection to the `docs.recommended` field in rule metadata
- Users get a stale subset rather than the curated "recommended" set

**Fix**: Query `RuleRegistry.getAll()` at runtime and include rules where `meta.docs.recommended === true`. This is complementary to the preset system (Milestone 10) -- the init wizard should eventually offer preset selection, but generating from the registry is the right interim step.

### 3. Outdated Documentation URL

```typescript
logger.detail('3. See docs: https://github.com/pdugan20/claudelint#readme');
```

Should be:

```typescript
logger.detail('3. See docs: https://claudelint.com');
```

### 4. No `--force` Flag

The wizard skips config creation when `.claudelintrc.json` already exists:

```typescript
if (existsSync(configPath)) {
  logger.warn('.claudelintrc.json already exists, skipping...');
  return;
}
```

Users who want to reset their config to defaults have no way to do so with `init`. Adding `--force` to overwrite (with confirmation) improves the experience.

## Proposed Changes

### Updated Detection

```typescript
interface ProjectInfo {
  hasClaudeDir: boolean;
  hasSkills: boolean;
  hasSettings: boolean;
  hasHooks: boolean;
  hasMCP: boolean;
  hasPlugin: boolean;
  hasCLAUDEmd: boolean;
  hasPackageJson: boolean;
  // New
  hasAgents: boolean;
  hasOutputStyles: boolean;
  hasCommands: boolean;
}
```

### Dynamic Default Config

```typescript
private createDefaultConfig(info: ProjectInfo): void {
  const allRules = RuleRegistry.getAll();
  const rules: Record<string, string> = {};

  for (const rule of allRules) {
    if (rule.docs?.recommended) {
      rules[rule.id] = rule.severity;  // Use rule's default severity
    }
  }

  const config: ClaudeLintConfig = {
    rules,
    output: { format: 'stylish', verbose: false },
  };

  this.writeConfig(config);
  this.writeIgnoreFile([]);
}
```

### Smarter Next Steps

The next-steps output should be context-aware:

```text
# If Claude Code project detected:
Next steps:
  1. Review .claudelintrc.json and customize rules
  2. Run: claudelint (validates your project)
  3. See docs: https://claudelint.com

# If no Claude Code project detected:
Next steps:
  1. Create a CLAUDE.md file to define project instructions
  2. Run: claudelint (validates your project)
  3. See docs: https://claudelint.com/guide/getting-started
```

### --force Flag

```text
Usage: claudelint init [options]

Initialize claudelint configuration

Options:
  -y, --yes    Use default configuration without prompts
  --force      Overwrite existing configuration files
  -h, --help   display help for command
```

When `--force` is set without `--yes`, show confirmation prompt:

```text
.claudelintrc.json already exists. Overwrite? (y/N)
```

When both `--force` and `--yes` are set, overwrite without confirmation.

## Test Plan

| Test | Description |
|------|-------------|
| Detect agents | `hasAgents` true when `.claude/agents/` exists |
| Detect output styles | `hasOutputStyles` true when `.claude/output-styles/` exists |
| Detect commands | `hasCommands` true when `.claude/commands/` exists |
| Dynamic rules | Default config includes rules from registry, not hardcoded |
| Force overwrite | `--force` overwrites existing config |
| Force + yes | `--force --yes` overwrites without prompt |
| No force skip | Without `--force`, existing config is skipped |
| URL correct | Next steps shows claudelint.com |
| Context-aware | Different next steps based on project detection |
