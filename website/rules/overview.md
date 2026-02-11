# Rules Reference

claudelint includes 120 validation rules across 10 categories. Each rule has detailed documentation with examples.

## By Category

- **CLAUDE.md** (16 rules) - File size, imports, paths, content
- **Skills** (46 rules) - Names, descriptions, security, versioning
- **MCP** (13 rules) - Server config, URLs, transport types
- **Plugin** (12 rules) - Manifest, components, versioning
- **Agents** (12 rules) - Names, descriptions, tools, models
- **LSP** (8 rules) - Transport, language IDs, extensions
- **Settings** (5 rules) - Permissions, environment variables
- **Hooks** (3 rules) - Event types, script references
- **Output Styles** (3 rules) - Name validation
- **Commands** (2 rules) - Migration checks

## Severity Levels

- **error** - Must be fixed. Causes non-zero exit code.
- **warning** - Should be fixed. Does not affect exit code.
- **info** - Informational suggestion.

## Auto-fixable Rules

Some rules support automatic fixing:

```bash
claudelint check-all --fix
```
