---
description: Validate Language Server Protocol configuration for transport settings, language IDs, file extensions, and server commands in Claude Code projects.
---

# LSP Validator

The LSP validator checks Language Server Protocol configuration files for transport settings, language IDs, file extensions, and server commands.

## What It Checks

- Transport configuration (stdio, TCP)
- Language ID format and validity
- File extension format
- Server command existence
- Configuration file paths

## Rules

This validator includes <RuleCount category="lsp" /> rules. See the [LSP rules category](/rules/lsp/lsp-command-bare-name) for the complete list.

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin: 16px 0;">

<RuleCard
  rule-id="lsp-invalid-transport"
  description="LSP server uses an invalid transport type"
  severity="error"
  category="LSP"
  link="/rules/lsp/lsp-invalid-transport"
/>

<RuleCard
  rule-id="lsp-language-id-empty"
  description="Language ID field is empty"
  severity="error"
  category="LSP"
  link="/rules/lsp/lsp-language-id-empty"
/>

<RuleCard
  rule-id="lsp-extension-missing-dot"
  description="File extension is missing the leading dot"
  severity="warning"
  category="LSP"
  link="/rules/lsp/lsp-extension-missing-dot"
/>

<RuleCard
  rule-id="lsp-command-bare-name"
  description="Server command uses a bare name instead of explicit path"
  severity="warning"
  category="LSP"
  link="/rules/lsp/lsp-command-bare-name"
/>

</div>

## CLI Usage

```bash
# Validate LSP configuration
claudelint validate-lsp

# Verbose output
claudelint validate-lsp --verbose
```

## See Also

- [Claude Code LSP Servers](https://code.claude.com/docs/en/plugins-reference#lsp-servers) - Official LSP documentation
- [Configuration](/guide/configuration) - Customize rule severity
