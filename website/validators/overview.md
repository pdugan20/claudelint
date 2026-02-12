# Validators

claudelint organizes its 120 validation rules into 10 validator categories. Each validator handles a specific aspect of your Claude Code project.

## Validator Categories

| Validator | Rules | What It Checks |
|-----------|-------|---------------|
| [CLAUDE.md](/validators/claude-md) | 16 | File size, imports, paths, content structure |
| [Skills](/validators/skills) | 46 | Names, descriptions, security, versioning |
| [Settings](/validators/settings) | 5 | Permissions, environment variables |
| [Hooks](/validators/hooks) | 3 | Event types, script references |
| [MCP Servers](/validators/mcp) | 13 | Transport types, URLs, environment variables |
| [Plugins](/validators/plugin) | 12 | Manifest structure, component references |
| [Agents](/validators/agents) | 12 | Names, descriptions, tools, models |
| [LSP](/validators/lsp) | 8 | Transport config, language IDs, extensions |
| [Output Styles](/validators/output-styles) | 3 | Name validation |
| [Commands](/validators/commands) | 2 | Migration checks |

## How Validators Work

Each validator scans specific files in your project and runs its rules against them. Validators operate independently and can be configured via `.claudelintrc.json`.

<ValidatorDiagram :validators="[
  { name: 'CLAUDE.md', rules: 16, link: '/validators/claude-md' },
  { name: 'Skills', rules: 46, link: '/validators/skills' },
  { name: 'Settings', rules: 5, link: '/validators/settings' },
  { name: 'Hooks', rules: 3, link: '/validators/hooks' },
  { name: 'MCP', rules: 13, link: '/validators/mcp' },
  { name: 'Plugin', rules: 12, link: '/validators/plugin' },
  { name: 'Agents', rules: 12, link: '/validators/agents' },
  { name: 'LSP', rules: 8, link: '/validators/lsp' },
  { name: 'Output Styles', rules: 3, link: '/validators/output-styles' },
  { name: 'Commands', rules: 2, link: '/validators/commands' }
]" />
