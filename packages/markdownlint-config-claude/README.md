# markdownlint-config-claude

Markdownlint configuration for Claude Code projects.

## What It Enforces

This config validates markdown structure in Claude-specific files (CLAUDE.md, SKILL.md, agent/command docs):

- **MD041**: First line must be H1 heading (`# Title`)
- **MD031**: Blank lines around code blocks
- **MD032**: Blank lines around lists
- **MD040**: Code fence language specification (`` ```bash ``)
- **MD022**: Blank lines around headings
- **MD024**: No duplicate headings (siblings only)

**What it doesn't enforce:**

- **MD013**: Line length (disabled - Claude docs can be long)
- **MD033**: HTML tags (allows `<kbd>` and `<br>`)

## Installation

```bash
npm install --save-dev markdownlint-config-claude markdownlint-cli
```

## Usage

### Option 1: Claude Files Only (Recommended)

Run markdownlint only on Claude-specific files to avoid conflicts with your existing project markdown config:

```json
// package.json
{
  "scripts": {
    "lint:md": "markdownlint '**/*.md' --ignore node_modules --ignore CLAUDE.md --ignore .claude",
    "lint:md:claude": "markdownlint --config node_modules/markdownlint-config-claude 'CLAUDE.md' '.claude/**/*.md'"
  }
}
```

This way:

- Your project markdown uses your existing config
- Claude markdown uses this config
- No conflicts!

### Option 2: Entire Project

If you want to use Claude's markdown rules for your entire project:

```json
// .markdownlint.json
{
  "extends": "markdownlint-config-claude"
}
```

**Warning:** Only use this if you don't have an existing markdownlint config.

## Why Separate Commands?

markdownlint doesn't have great file-specific override support in JSON configs, so we recommend running separate commands for project vs Claude files.

This is the same pattern used by other specialized configs (e.g., different rules for documentation vs code comments).

## Pre-commit Hook

```yaml
# .pre-commit-config.yaml
repos:
  # Project markdown (exclude Claude files)
  - repo: https://github.com/igorshubovych/markdownlint-cli
    rev: v0.39.0
    hooks:
      - id: markdownlint
        args: ['--ignore', 'CLAUDE.md', '--ignore', '.claude']

  # Claude markdown (separate config)
  - repo: local
    hooks:
      - id: markdownlint-claude
        name: Lint Claude markdown
        entry: npx markdownlint --config node_modules/markdownlint-config-claude
        language: node
        files: '^(CLAUDE\.md|\.claude/.*\.md)$'
        pass_filenames: true
```

## What Files Should Use This?

Use this config for:

- `CLAUDE.md` (project root)
- `.claude/CLAUDE.md` (user-specific)
- `.claude/rules/*.md` (rule documentation)
- `.claude/skills/*/SKILL.md` (skill documentation)
- `.claude/agents/*.md` (agent definitions)
- `.claude/commands/*.md` (command definitions)
- Any other markdown in `.claude/`

Don't use this for:

- Project README.md
- Documentation in `docs/`
- Code comments
- Other project markdown

## Integration with claudelint

This config is designed to work alongside [@pdugan20/claudelint](https://www.npmjs.com/package/@pdugan20/claudelint):

```bash
# Validate Claude-specific configuration
claudelint check-all

# Lint markdown structure
markdownlint --config node_modules/markdownlint-config-claude 'CLAUDE.md' '.claude/**/*.md'

# Format with prettier
prettier --check 'CLAUDE.md' '.claude/**/*.{md,json,yaml}'
```

Or use the convenience command:

```bash
claudelint format --check
```

## Customization

You can extend this config with your own rules:

```json
// .markdownlint-claude.json
{
  "extends": "markdownlint-config-claude",
  "MD013": {
    "line_length": 120
  }
}
```

Then use it:

```bash
markdownlint --config .markdownlint-claude.json 'CLAUDE.md' '.claude/**/*.md'
```

## Related Packages

- [@pdugan20/claudelint](https://www.npmjs.com/package/@pdugan20/claudelint) - Claude configuration validator
- [prettier-config-claude](https://www.npmjs.com/package/prettier-config-claude) - Prettier config for Claude files
- [eslint-config-claude](https://www.npmjs.com/package/eslint-config-claude) - ESLint config for Claude JSON/YAML

## License

MIT
