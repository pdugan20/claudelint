# Security Policy

## Supported Versions

The following versions of claudelint are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.2.x   | :white_check_mark: |
| < 0.2   | :x:                |

**Note:** Once version 1.0.0 is released, only the latest major version will receive security updates.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing:

**[Your security email or create one]**

Or use GitHub Security Advisories:

[Report a vulnerability](https://github.com/pdugan20/claudelint/security/advisories/new)

### What to Include

Please include the following information in your report:

- Type of vulnerability (e.g., injection, XSS, path traversal, etc.)
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

### What to Expect

1. **Acknowledgment** - You will receive an acknowledgment within 48 hours
2. **Assessment** - We will assess the vulnerability and determine its severity (typically within 5 business days)
3. **Updates** - You will receive status updates every 5 business days
4. **Resolution** - We will work on a fix and coordinate disclosure with you
5. **Credit** - You will be credited in the release notes (if desired)

### Security Update Process

1. Vulnerability reported and confirmed
2. Severity assessment (CVSS score assigned)
3. Fix development and testing
4. Security advisory published (GitHub Security Advisories)
5. Patch release published to npm
6. Public disclosure coordinated with reporter

### Preferred Languages

We prefer all communications to be in English.

## Security Best Practices for Users

When using claudelint:

1. **Keep up to date** - Always use the latest version to get security patches
2. **Review dependencies** - Run `npm audit` regularly to check for vulnerable dependencies
3. **Validate input** - If using the programmatic API, validate user input before passing to claudelint
4. **Sandbox execution** - If running claudelint on untrusted code, consider sandboxing
5. **Report issues** - If you discover a security issue, report it responsibly

## Known Security Considerations

claudelint is a static analysis tool that:

- Reads and validates configuration files (CLAUDE.md, JSON, YAML)
- Does not execute user code
- Does not make network requests (except for optional external validators)
- Does not modify files unless explicitly using `--fix` flag

### Potential Security Risks

- **Path traversal** - claudelint validates file paths but users should be cautious with untrusted `@import` directives
- **YAML/JSON parsing** - Malformed YAML/JSON files are handled safely but extremely large files could impact performance
- **Regular expressions** - claudelint uses regex validators which are tested for ReDoS vulnerabilities

## Security Tooling

We use the following tools to maintain security:

- **npm audit** - Automated dependency vulnerability scanning
- **Dependabot** - Automated dependency updates
- **CodeQL** (planned) - Static code analysis for security issues
- **GitHub Security Advisories** - Coordinated vulnerability disclosure

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find similar problems
3. Prepare fixes for all supported versions
4. Release patches as soon as possible

We ask that you:

- Allow us reasonable time to fix the vulnerability before public disclosure
- Make a good faith effort to avoid privacy violations, data destruction, and service disruption
- Do not access or modify data that isn't yours
- Do not perform actions that could negatively affect our users

## Attribution

We appreciate the security research community and will acknowledge researchers who report valid vulnerabilities in:

- Release notes
- Security advisories
- GitHub repository (if desired)

Thank you for helping keep claudelint and our users safe!
