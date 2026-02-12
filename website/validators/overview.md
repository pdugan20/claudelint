# Validators

claudelint organizes its <RuleCount category="total" /> validation rules into <RuleCount category="categories" /> validator categories. Each validator handles a specific aspect of your Claude Code project.

## Validator Categories

| Validator | Rules | What It Checks |
|-----------|-------|---------------|
| [CLAUDE.md](/validators/claude-md) | <RuleCount category="claude-md" /> | File size, imports, paths, content structure |
| [Skills](/validators/skills) | <RuleCount category="skills" /> | Names, descriptions, security, versioning |
| [Settings](/validators/settings) | <RuleCount category="settings" /> | Permissions, environment variables |
| [Hooks](/validators/hooks) | <RuleCount category="hooks" /> | Event types, script references |
| [MCP Servers](/validators/mcp) | <RuleCount category="mcp" /> | Transport types, URLs, environment variables |
| [Plugins](/validators/plugin) | <RuleCount category="plugin" /> | Manifest structure, component references |
| [Agents](/validators/agents) | <RuleCount category="agents" /> | Names, descriptions, tools, models |
| [LSP](/validators/lsp) | <RuleCount category="lsp" /> | Transport config, language IDs, extensions |
| [Output Styles](/validators/output-styles) | <RuleCount category="output-styles" /> | Name validation |
| [Commands](/validators/commands) | <RuleCount category="commands" /> | Migration checks |

## How Validators Work

Each validator scans specific files in your project and runs its rules against them. Validators operate independently and can be configured via `.claudelintrc.json`.

<ValidatorDiagram />
