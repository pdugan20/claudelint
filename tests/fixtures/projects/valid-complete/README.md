# valid-complete

Test fixture with all 10 config file types present and valid.

Running `claudelint check-all` against this directory should produce zero errors and zero warnings.

## Config Files

- `CLAUDE.md` - Valid project instructions
- `.claude/settings.json` - Valid model, env vars, permissions
- `.claude/hooks.json` - Valid PreToolUse hook
- `.claude/mcp.json` - Valid stdio MCP server
- `.claude/lsp.json` - Valid TypeScript language server
- `.claude/skills/example-skill/SKILL.md` - Valid skill with frontmatter
- `.claude/skills/example-skill/run.sh` - Valid script with shebang
- `.claude/agents/example-agent/AGENT.md` - Valid agent with system prompt
- `.claude/output-styles/concise/concise.md` - Valid output style with guidelines
- `plugin.json` - Valid manifest with name, version, description, author
