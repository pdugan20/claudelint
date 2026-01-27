# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **BREAKING**: Exit codes now follow POSIX standard (exit 1 for any linting issues, exit 0 for success, exit 2 only for fatal errors)
  - Previously: exit 2 for errors, exit 1 for warnings
  - Now: exit 1 for errors OR warnings, exit 0 for success, exit 2 for fatal errors
  - Migration: Most CI systems check for non-zero exit codes, so no changes needed in most cases
  - See migration guide in README.md for details

### Added

- Initial MVP release preparation
- Comprehensive validation for CLAUDE.md files
- Skills validator with security and best practices checks
- Settings validator with JSON schema validation
- Hooks validator for Claude Code hooks
- MCP server configuration validator
- Plugin manifest validator
- CLI with multiple output formats (stylish, json, compact)
- Configuration file support (.claudelintrc.json)
- Ignore patterns support (.claudelintignore)
- Inline disable comments for fine-grained control
- Actionable error messages with --explain flag
- Claude Code plugin integration with 8 skills
- SessionStart hook for automatic validation
- GitHub Actions CI/CD workflows
- Pre-commit hooks for development
- Automated npm publishing workflow

## [0.1.0] - 2026-01-27

### Added

- Initial development version
- Core infrastructure and architecture
- Basic validation capabilities
- Test suite with 202+ tests

[Unreleased]: https://github.com/pdugan20/claudelint/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/pdugan20/claudelint/releases/tag/v0.1.0
