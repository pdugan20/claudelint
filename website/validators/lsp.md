# LSP Validator

The LSP validator checks Language Server Protocol configuration files for transport settings, language IDs, file extensions, and server commands.

## What It Checks

- Transport configuration (stdio, TCP)
- Language ID format and validity
- File extension format
- Server command existence
- Configuration file paths

## Rules

This validator includes <RuleCount category="lsp" /> rules. See the [LSP rules category](/rules/lsp/lsp-command-not-in-path) for the complete list.

| Rule | Severity | Description |
|------|----------|-------------|
| [lsp-server-name-too-short](/rules/lsp/lsp-server-name-too-short) | warn | Server name is too short |
| [lsp-language-id-not-lowercase](/rules/lsp/lsp-language-id-not-lowercase) | warn | Language ID should be lowercase |
| [lsp-language-id-empty](/rules/lsp/lsp-language-id-empty) | error | Language ID is empty |
| [lsp-invalid-transport](/rules/lsp/lsp-invalid-transport) | error | Invalid transport type |
| [lsp-extension-missing-dot](/rules/lsp/lsp-extension-missing-dot) | warn | File extension missing leading dot |
| [lsp-config-file-relative-path](/rules/lsp/lsp-config-file-relative-path) | warn | Config file uses relative path |
| [lsp-config-file-not-json](/rules/lsp/lsp-config-file-not-json) | warn | Config file is not JSON |
| [lsp-command-not-in-path](/rules/lsp/lsp-command-not-in-path) | warn | Command not found in PATH |

## CLI Usage

```bash
claudelint check-all
claudelint check-all --verbose
```

## See Also

- [Rules Reference](/rules/overview) - All validation rules
- [Configuration](/guide/configuration) - Customize rule severity
