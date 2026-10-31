# Security Policy

## Supported Versions

Only the latest release of `claude-code-lint` on npm receives security fixes.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Report them privately through
[GitHub Security Advisories](https://github.com/pdugan20/claudelint/security/advisories/new)
instead.

Please include:

- Type of vulnerability (for example injection, path traversal, or ReDoS)
- The affected version and the source files involved
- Steps to reproduce, with proof-of-concept input if possible
- The impact you expect, including how an attacker could exploit it

I'll acknowledge the report, confirm the affected versions, and coordinate a fix
and disclosure with you. Reporters are credited in the advisory and release notes
unless they prefer not to be.

Please allow reasonable time for a fix before public disclosure, and avoid
accessing or modifying data that isn't yours while testing.

## Known Security Considerations

claudelint is a static analysis tool that:

- Reads and validates configuration files (CLAUDE.md, JSON, YAML)
- Does not execute user code
- Does not make network requests (except for optional external validators)
- Does not modify files unless explicitly using the `--fix` flag

Relevant risks include:

- **Path traversal** through untrusted `@import` directives
- **Resource exhaustion** from extremely large YAML or JSON files
- **ReDoS** in regular-expression validators
