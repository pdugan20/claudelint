# invalid-all-categories

Test fixture with intentional errors in every validator category.

Running `claudelint check-all` against this directory should produce errors from all 10 validators.

## Intentional Errors

- **CLAUDE.md** - Import referencing nonexistent file
- **settings.json** - Invalid tool name, empty pattern, bad env var names, hardcoded secret
- **hooks.json** - Invalid event name, invalid hook type, bad regex pattern
- **mcp.json** - Invalid transport type, empty command, invalid URL
- **lsp.json** - Short server name, missing command in PATH, bad extensions, bad transport
- **skills** - Invalid name format, bad description, conflicting tool lists, missing agent for fork context
- **agents** - Name/directory mismatch, bad description, conflicting tool lists, missing system prompt, body too short
- **output-styles** - Name/directory mismatch, missing guidelines, body too short
- **commands** - Deprecated commands directory exists
- **plugin.json** - Missing name, invalid version, wrong location (at root instead of .claude-plugin/)
