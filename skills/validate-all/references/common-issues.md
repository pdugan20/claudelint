# Common Issues

## Error: "claudelint command not found"

**Cause**: claude-code-lint npm package not installed
**Solution**: Install the package in your project

```bash
npm install --save-dev claude-code-lint
```

## Warning: "Multiple validators failed"

**Cause**: Various validation issues across different file types
**Solution**: Run individual validators for detailed errors

- `claudelint validate-skills` for skill issues
- `claudelint check-claude-md` for CLAUDE.md issues
- `claudelint validate-mcp` for MCP config issues
- `claudelint validate-settings` for settings issues
- `claudelint validate-hooks` for hooks issues

## When to use validate-all vs individual validators?

**Use validate-all when:**

- Running full project audit
- Setting up CI/CD checks
- Before committing changes

**Use individual validators when:**

- Debugging specific file type
- Developing a new skill or configuration
- Want detailed output for one area
