# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

#### BREAKING: Exit Code Standardization

Exit codes now follow POSIX/Unix standard conventions to improve compatibility with CI/CD systems and shell scripts.

**Previous behavior (v0.1.0):**

```bash
claudelint check-all
# Exit 2 if validation errors found
# Exit 1 if only warnings found
# Exit 0 if no issues
```

**New behavior (v1.0.0):**

```bash
claudelint check-all
# Exit 0 - Success (no issues)
# Exit 1 - Validation issues (errors OR warnings)
# Exit 2 - Fatal error (crash, invalid config, etc.)
```

**Rationale:**

This change aligns with standard linting tools (ESLint, Prettier, etc.) and POSIX conventions where:

- Exit 0 = success
- Exit 1 = expected failure (linting issues)
- Exit 2 = unexpected failure (program error)

Most CI systems treat any non-zero exit as failure, making this change transparent for typical setups.

**Migration Guide:**

**No changes needed** if you:

- Use standard CI checks: `if [ $? -ne 0 ]; then fail; fi`
- Check for non-zero exit: `claudelint check-all || exit 1`
- Run in CI with default failure behavior

**Changes required** if you:

1. **Explicitly check exit code 2 for errors:**

   ```bash
   # Before (v0.1.0)
   claudelint check-all
   if [ $? -eq 2 ]; then
     echo "Errors found!"
     exit 1
   fi

   # After (v1.0.0)
   claudelint check-all
   if [ $? -eq 1 ]; then
     echo "Issues found!"
     exit 1
   fi
   ```

2. **Differentiate warnings from errors in CI:**

   ```bash
   # Before (v0.1.0)
   claudelint check-all
   EXIT_CODE=$?
   if [ $EXIT_CODE -eq 2 ]; then
     echo "Errors - fail build"
     exit 1
   elif [ $EXIT_CODE -eq 1 ]; then
     echo "Warnings - continue but notify"
     # Post comment to PR
   fi

   # After (v1.0.0) - Use JSON output for detailed analysis
   claudelint check-all --format json > results.json
   ERRORS=$(jq '.summary.errors' results.json)
   WARNINGS=$(jq '.summary.warnings' results.json)

   if [ $ERRORS -gt 0 ]; then
     echo "Errors found - fail build"
     exit 1
   elif [ $WARNINGS -gt 0 ]; then
     echo "Warnings found - notify team"
     # Post comment to PR
   fi
   ```

3. **GitHub Actions workflow:**

   ```yaml
   # Before (v0.1.0)
   - name: Run claudelint
     run: |
       claudelint check-all
       if [ $? -eq 2 ]; then
         echo "::error::Validation errors found"
         exit 1
       fi

   # After (v1.0.0) - Simpler
   - name: Run claudelint
     run: claudelint check-all
     # Automatically fails on exit 1

   # Or with warning threshold
   - name: Run claudelint
     run: claudelint check-all --max-warnings 0
     # Fails if any warnings/errors
   ```

4. **Want old behavior? Use flags:**

   ```bash
   # Treat warnings as success (exit 0)
   claudelint check-all --quiet

   # Fail only on errors, allow warnings
   claudelint check-all --max-warnings 999

   # Strict mode: fail on everything including info
   claudelint check-all --strict
   ```

**Alternative: JSON output for detailed control:**

```bash
# Get structured results
claudelint check-all --format json > results.json

# Parse results in your script
ERROR_COUNT=$(jq '.summary.errors' results.json)
WARNING_COUNT=$(jq '.summary.warnings' results.json)

# Custom logic
if [ $ERROR_COUNT -gt 0 ]; then
  echo "Found $ERROR_COUNT errors - blocking deployment"
  exit 1
elif [ $WARNING_COUNT -gt 5 ]; then
  echo "Too many warnings ($WARNING_COUNT) - please fix"
  exit 1
fi
```

**Testing your migration:**

```bash
# Create a test file with known issues
echo "# Test" > CLAUDE.md
printf '%040000s' | tr ' ' 'x' >> CLAUDE.md  # 40KB+ file

# v1.0.0 behavior
claudelint check-claude-md
echo "Exit code: $?"  # Should be 1 (issues found)

# Verify CI compatibility
claudelint check-all || echo "Failed as expected"
```

For more details, see the [migration guide](./docs/MIGRATION.md).

#### BREAKING: Plugin System Removed

The third-party plugin system has been removed and replaced with a custom rules system.

**Previous behavior:**

```bash
# Install third-party plugins via npm
npm install claudelint-plugin-example

# Plugins were loaded automatically from node_modules
claudelint check-all
```

**New behavior:**

```bash
# Create custom rules in .claudelint/rules/
# .claudelint/rules/my-rule.js
module.exports.rule = {
  meta: { id: 'my-rule', ... },
  validate: async (context) => { ... }
};

# Custom rules load automatically
claudelint check-all
```

**Rationale:**

- Simpler architecture - no npm package dependencies required
- Better integration with rule-based system
- Easier to create and maintain custom validation logic
- Same API as built-in rules
- Direct control over custom rule files in your project

**Migration Guide:**

If you were using third-party plugins:

1. Extract the plugin rule logic
2. Create corresponding custom rule files in `.claudelint/rules/`
3. Adapt to the Rule interface (see [Custom Rules Guide](./docs/custom-rules.md))
4. Remove npm plugin dependencies

**Note:** This change only affects the third-party plugin system. The claudelint npm package can still be used as a Claude Code plugin via `/plugin install claudelint`.

**See Also:**

- [Custom Rules Guide](./docs/custom-rules.md) - Complete documentation
- [Example Custom Rules](./docs/examples/custom-rules/) - Practical examples
- [Plugin System Removal Project](./docs/projects/plugin-system-removal/) - Implementation details

#### Why This Matters: Benefits of Rule-Based Architecture

**For Users:**
- **Granular control** - Enable/disable individual checks, not entire validators
- **Custom severity** - Treat warnings as errors or vice versa per rule
- **Configuration options** - Customize thresholds (file sizes, line counts, etc.)
- **Better error messages** - Each rule has specific, actionable guidance
- **Progressive adoption** - Start strict on critical rules, relax on others

**For Developers:**
- **Clear architecture** - Each rule is independent and testable
- **Easier contributions** - Add new rules without touching existing code
- **Better testing** - Rule-level tests are simpler than validator-level
- **Discoverable** - `claudelint list-rules` shows all available checks
- **Self-documenting** - Rule metadata provides all information

**Industry Alignment:**
- **ESLint-style patterns** - Familiar to developers from JavaScript ecosystem
- **Standard configuration** - Same patterns as Prettier, Stylelint, etc.
- **Plugin-friendly** - Easy to extend with custom rules
- **IDE integration ready** - Metadata supports editor integrations

**Technical Improvements:**
- Reduced coupling between validation logic
- Easier to maintain (fix one rule without affecting others)
- Better error isolation (one rule failure doesn't break others)
- Improved testability (each rule has focused test suite)
- Clear separation of concerns (rule logic vs. file discovery vs. reporting)

### Added

#### BREAKING: ESLint-Style Rule Architecture

Complete refactor from validator-based to rule-based architecture. All validation logic now implemented as individual, configurable rules following ESLint patterns.

**What Changed:**

Before (v0.1.0):
- 6 validators with hardcoded validation logic
- Limited configurability
- All-or-nothing validation per file type

After (v1.0.0):
- **105 individual rules** across 10 categories
- **Full ESLint-style configuration** - enable/disable any rule
- **Configurable severity** per rule (error, warn, off)
- **Per-rule options** with defaults
- **File-specific overrides** via config
- **Rule documentation** for each rule

**Migration from v0.1.0:**

No action required for basic usage. All validation remains enabled by default.

To customize (new capability):

```json
{
  "rules": {
    "claude-md-size-error": ["error", { "maxSize": 50000 }],
    "skill-dangerous-command": "off",
    "mcp-invalid-env-var": ["warn", { "pattern": "^[A-Z_][A-Z0-9_]*$" }]
  }
}
```

#### Complete Rule Set (105 rules)

**CLAUDE.md Rules (13 rules)**

- `claude-md-size-error` - File exceeds 40KB limit (configurable)
- `claude-md-size-warning` - File approaching 35KB limit (configurable)
- `claude-md-content-too-many-sections` - Too many sections (>20, configurable)
- `claude-md-import-missing` - Import file not found
- `claude-md-import-read-failed` - Import file unreadable
- `claude-md-import-circular` - Circular import detected
- `claude-md-import-depth-exceeded` - Import depth >5 levels (configurable)
- `claude-md-import-in-code-block` - Import in code block
- `claude-md-rules-circular-symlink` - Circular symlink in imports
- `claude-md-paths` - Invalid paths array format
- `claude-md-glob-pattern-backslash` - Backslash in glob pattern
- `claude-md-glob-pattern-too-broad` - Overly broad glob patterns
- `claude-md-file-not-found` - CLAUDE.md file missing
- `claude-md-filename-case-sensitive` - Case-sensitive filename issues

**Skills Rules (28 rules)**

Schema & Metadata:
- `skill-name` - Missing or invalid name in frontmatter
- `skill-description` - Description too short or wrong person
- `skill-version` - Missing version field
- `skill-tags` - Invalid tags format
- `skill-context` - Missing context field
- `skill-model` - Invalid model specification
- `skill-agent` - Invalid agent reference
- `skill-dependencies` - Invalid dependencies format
- `skill-allowed-tools` - Invalid allowed-tools syntax
- `skill-disallowed-tools` - Invalid disallowed-tools syntax

Content & Structure:
- `skill-body-too-long` - Body exceeds 500 lines (configurable)
- `skill-large-reference-no-toc` - Large file missing TOC (>100 lines, configurable)
- `skill-missing-examples` - Missing usage examples
- `skill-name-directory-mismatch` - Skill name doesn't match directory

File Organization:
- `skill-too-many-files` - Too many files at root (>10, configurable)
- `skill-deep-nesting` - Excessive directory nesting (>3 levels, configurable)
- `skill-naming-inconsistent` - Mixed naming conventions (configurable minimum files)
- `skill-multi-script-missing-readme` - Multiple scripts without README (>3, configurable)
- `skill-missing-changelog` - Missing CHANGELOG.md

Scripts & Security:
- `skill-missing-shebang` - Shell script missing shebang
- `skill-missing-comments` - Script >10 lines without comments (configurable)
- `skill-dangerous-command` - Dangerous commands (rm -rf, etc.)
- `skill-eval-usage` - Usage of eval/exec
- `skill-path-traversal` - Path traversal patterns (../)
- `skill-time-sensitive-content` - Time-sensitive references
- `skill-unknown-string-substitution` - Invalid {{VAR}} syntax
- `skill-referenced-file-not-found` - Referenced file missing

**Settings Rules (5 rules)**

- `settings-invalid-permission` - Invalid permission action value
- `settings-permission-invalid-rule` - Invalid Tool(pattern) syntax
- `settings-permission-empty-pattern` - Empty inline pattern (configurable)
- `settings-invalid-env-var` - Invalid environment variable name
- `settings-file-path-not-found` - Referenced file path doesn't exist

**Hooks Rules (3 rules)**

- `hooks-invalid-config` - Invalid hooks.json structure
- `hooks-invalid-event` - Unknown hook event name
- `hooks-missing-script` - Hook script file not found

**MCP Rules (13 rules)**

Server Configuration:
- `mcp-invalid-server` - Invalid server configuration
- `mcp-server-key-mismatch` - Server key doesn't match object key
- `mcp-invalid-transport` - Unknown transport type

Transport Validation:
- `mcp-stdio-empty-command` - Empty stdio command
- `mcp-http-empty-url` - Empty HTTP URL
- `mcp-http-invalid-url` - Invalid HTTP URL format
- `mcp-sse-empty-url` - Empty SSE URL
- `mcp-sse-invalid-url` - Invalid SSE URL format
- `mcp-sse-transport-deprecated` - SSE transport deprecated
- `mcp-websocket-empty-url` - Empty WebSocket URL
- `mcp-websocket-invalid-url` - Invalid WebSocket URL
- `mcp-websocket-invalid-protocol` - Invalid WebSocket protocol

Environment:
- `mcp-invalid-env-var` - Invalid env var syntax (configurable pattern)

**Plugin Rules (10 rules)**

Manifest:
- `plugin-name-required` - Missing plugin name
- `plugin-version-required` - Missing version
- `plugin-description-required` - Missing description
- `plugin-invalid-version` - Invalid semantic version
- `plugin-invalid-manifest` - Invalid plugin.json structure

Structure:
- `plugin-json-wrong-location` - plugin.json not in .claude-plugin/
- `plugin-components-wrong-location` - Components in wrong location
- `plugin-missing-file` - Referenced file missing
- `plugin-marketplace-files-not-found` - Marketplace files missing

Dependencies:
- `plugin-dependency-invalid-version` - Invalid dependency version
- `plugin-circular-dependency` - Circular plugin dependency
- `commands-in-plugin-deprecated` - Deprecated commands field

**Agents Rules (13 rules)**

- `agent-name` - Missing or invalid agent name
- `agent-description` - Description too short or wrong person
- `agent-model` - Invalid model specification
- `agent-tools` - Invalid tools array
- `agent-allowed-tools` - Invalid allowed-tools format
- `agent-disallowed-tools` - Invalid disallowed-tools format
- `agent-skills` - Invalid skills array
- `agent-skills-not-found` - Referenced skill not found
- `agent-hooks` - Invalid hooks configuration
- `agent-hooks-invalid-schema` - Hooks schema validation failed
- `agent-events` - Invalid events array
- `agent-missing-system-prompt` - Missing system prompt
- `agent-body-too-short` - Body <50 characters (configurable)
- `agent-name-directory-mismatch` - Name doesn't match directory

**Output Styles Rules (6 rules)**

- `output-style-name` - Missing or invalid name
- `output-style-description` - Description too short
- `output-style-examples` - Invalid examples format
- `output-style-missing-examples` - No usage examples
- `output-style-missing-guidelines` - No formatting guidelines
- `output-style-body-too-short` - Body <50 characters (configurable)
- `output-style-name-directory-mismatch` - Name doesn't match directory

**LSP Rules (9 rules)**

- `lsp-config-file-not-json` - lsp.json is not valid JSON
- `lsp-config-file-relative-path` - Config file path is relative
- `lsp-server-name-too-short` - Server name <2 characters (configurable)
- `lsp-command-not-in-path` - LSP command not executable
- `lsp-invalid-transport` - Invalid transport type
- `lsp-language-id-empty` - Empty language ID
- `lsp-language-id-not-lowercase` - Language ID not lowercase
- `lsp-extension-missing-dot` - File extension missing dot

**Commands Rules (2 rules)**

- `commands-deprecated-directory` - .claude/commands deprecated
- `commands-migrate-to-skills` - Migrate commands to skills

**Total: 105 configurable validation rules**

#### Architecture & Performance

**Rule-Based Architecture**

- **ESLint-style rule system** - Each validation check is an independent rule
- **Rule metadata** - Standardized meta objects with id, name, description, severity, category
- **TypeScript interfaces** - Exported option types for all 17 configurable rules
- **Consistent naming** - All option interfaces follow `{RuleId}Options` pattern
- **ClaudeLintRuleTester** - Testing framework following ESLint patterns
- **Automatic rule registration** - Rules auto-register via index imports
- **1:1:1 mapping enforcement** - Every rule has implementation, test, and documentation

**Rule Registry System**

- Centralized metadata for all 105 validation rules
- Single source of truth for rule definitions
- Config validation against known rules
- Documentation generation support
- IDE integration readiness
- Plugin rule registration
- Rule option validation with Zod schemas

**Validator Registry & Factory**

- Self-registration pattern for validators
- Dynamic validator discovery
- Plugin validator integration
- Factory pattern for validator instantiation
- Metadata-driven validator management

**Composition Framework**

- Functional validator composition (inspired by FP patterns)
- Reusable validation primitives: `compose()`, `optional()`, `conditional()`, `all()`, `any()`
- Type-safe composable validators
- Reduced code duplication
- Enhanced testability
- Reusable validator building blocks

**Performance Optimizations**

- **Parallel Validation**: Concurrent validator execution using `Promise.all()`
  - ~3.5x speedup over sequential execution
  - Wall-clock time: ~128ms for full validation
- **Smart Caching**: mtime-based validation result caching
  - ~2.4x speedup on warm cache (cold: ~204ms, warm: ~84ms)
  - Cache hit rate: 90%+ on unchanged files
  - Automatic invalidation on file changes or version updates
- **Progress Indicators**: Real-time validation feedback
  - Automatic CI detection (disables spinners in CI)
  - Timing information per validator
  - Minimal overhead (<5%)

#### CLI Commands (13 commands)

**Validation Commands:**

- `check-all` - Run all validators
- `check-claude-md` - Validate CLAUDE.md files
- `check-skills` - Validate skills
- `check-settings` - Validate settings.json
- `check-hooks` - Validate hooks.json
- `check-mcp` - Validate MCP server configs
- `check-plugin` - Validate plugin manifests

**Configuration Commands:**

- `init` - Interactive configuration wizard (with `--yes` flag)
- `print-config` - Display resolved configuration
- `resolve-config <file>` - Show effective config for specific file
- `validate-config` - Validate configuration file schema

**Utility Commands:**

- `list-rules` - Browse and filter validation rules by category
- `cache-clear` - Clear validation cache

#### CLI Options & Flags

**Output Formats:**

- `--format <type>` - Output format: stylish (default), json, compact
- `--verbose` - Detailed validation output
- `--quiet` - Minimal output (only errors)
- `--show-docs-url` - Display documentation URLs for triggered rules

**Strictness & Thresholds:**

- `--strict` - Fail on any issues (errors, warnings, or info)
- `--max-warnings <number>` - Enforce warning count limits
- `--warnings-as-errors` - Treat all warnings as errors

**Auto-fix:**

- `--fix` - Automatically apply fixes to problems
- `--fix-dry-run` - Preview fixes without applying them
- `--fix-type <type>` - Fix only errors, warnings, or all issues

**Caching:**

- `--cache` / `--no-cache` - Enable/disable validation caching (default: enabled)
- `--cache-location <path>` - Custom cache directory (default: `.claudelint-cache/`)

**Path Options:**

- `--path <path>` - Custom path to validate
- `--ignore-pattern <pattern>` - Additional ignore patterns

#### Configuration Features

**Configuration Files:**

- `.claudelintrc.json` - Project configuration
- `.claudelintrc.js` - JavaScript configuration with logic
- `.claudelintrc.yaml` - YAML configuration
- `package.json` - `claudelint` field support
- `.claudelintignore` - Ignore patterns (gitignore-style)

**Inline Directives:**

- `<!-- claudelint-disable -->` - Disable all rules for block
- `<!-- claudelint-disable rule-name -->` - Disable specific rule
- `<!-- claudelint-enable -->` - Re-enable rules
- `<!-- claudelint-disable-next-line -->` - Disable for next line
- `<!-- claudelint-disable-line -->` - Disable for current line
- **Unused directive detection** with `reportUnusedDisableDirectives` option

**Rule Configuration:**

```json
{
  "rules": {
    // Disable/enable individual rules
    "claude-md-size-error": "off",
    "skill-dangerous-command": "warn",

    // Configure rule options
    "claude-md-size-error": ["error", { "maxSize": 50000 }],
    "skill-body-too-long": ["warn", { "maxLines": 1000 }],
    "lsp-server-name-too-short": ["warn", { "minLength": 3 }],

    // File-specific overrides
    "overrides": [
      {
        "files": ["**/.claude/rules/*.md"],
        "rules": {
          "claude-md-size-error": "off"
        }
      }
    ]
  },
  "plugins": ["mycompany"],
  "extends": ["claudelint:recommended"]
}
```

**All 17 Configurable Rules:**

1. `claude-md-size-error` - maxSize (default: 40000 bytes)
2. `claude-md-size-warning` - maxSize (default: 35000 bytes)
3. `claude-md-content-too-many-sections` - maxSections (default: 20)
4. `claude-md-import-depth-exceeded` - maxDepth (default: 5)
5. `claude-md-rules-circular-symlink` - maxSymlinkDepth (default: 100)
6. `skill-body-too-long` - maxLines (default: 500)
7. `skill-large-reference-no-toc` - minLines (default: 100)
8. `skill-too-many-files` - maxFiles (default: 10)
9. `skill-deep-nesting` - maxDepth (default: 3)
10. `skill-naming-inconsistent` - minFiles (default: 3)
11. `skill-missing-comments` - minLines (default: 10)
12. `skill-multi-script-missing-readme` - maxScripts (default: 3)
13. `settings-permission-empty-pattern` - allowEmpty (default: false)
14. `mcp-invalid-env-var` - pattern (default: '^[A-Z_][A-Z0-9_]*$')
15. `lsp-server-name-too-short` - minLength (default: 2)
16. `agent-body-too-short` - minLength (default: 50)
17. `output-style-body-too-short` - minLength (default: 50)

#### Documentation (30+ pages)

**User Guides:**

- Getting Started guide
- CLI reference (13 commands documented)
- Configuration guide
- Auto-fix guide
- Caching guide
- Debugging guide
- Inline disables guide
- Formatting tools integration guide

**Developer Guides:**

- Architecture documentation (comprehensive system overview)
- Validator development guide
- Plugin development guide
- Composition framework guide

**Rule Documentation:**

- **105 individual rule pages** (ESLint-style)
- Per-rule examples (Incorrect/Correct code patterns)
- Configuration options with defaults
- "When Not To Use It" sections
- "How To Fix" guidance
- Related rules cross-references
- Resource links to implementation and tests
- Template-driven consistency

**Integration Examples:**

- GitHub Actions workflows
- Pre-commit hooks
- npm scripts
- CI/CD pipeline examples

#### Claude Code Plugin Integration

**Skills (8 validation skills):**

- `validate-all` - Run all validators
- `validate-claude-md` - CLAUDE.md validation
- `validate-skills` - Skills validation
- `validate-settings` - Settings validation
- `validate-hooks` - Hooks validation
- `validate-mcp` - MCP validation
- `validate-plugin` - Plugin validation
- `check-rules` - Browse available rules

**Hooks:**

- `SessionStart` hook - Automatic validation on session start
- `PreToolUse` hook - Validate before file writes (optional)

**Plugin Manifest:**

- `.claude-plugin/plugin.json` - Claude Code plugin metadata
- `.claude-plugin/marketplace.json` - Marketplace listing

#### Development Infrastructure

**Testing:**

- **708 test cases** covering all 105 rules
- **Rule-level unit tests** - Each rule has dedicated test file
- **ClaudeLintRuleTester** framework - ESLint-style testing
- **Valid/invalid test cases** - Comprehensive coverage per rule
- **Integration tests** for CLI commands
- **Validator orchestration tests** - End-to-end validation flows
- **Config system tests** - Rule configuration and overrides
- **Cache system tests** - Validation caching behavior
- **Inline disable tests** - Comment directive handling
- **100% rule coverage** - All 105 rules have test files
- **1:1:1 enforcement** - Automated script verifies rule/test/doc mapping

**CI/CD:**

- GitHub Actions workflow for testing
- Automated npm publishing on release
- Pre-commit hooks (husky + lint-staged)
- Commitlint for conventional commits

**Code Quality:**

- TypeScript strict mode
- ESLint + Prettier configuration
- 100% TypeScript codebase
- Comprehensive JSDoc comments

**Development Tooling:**

- `check-rule-structure.ts` - Enforces 1:1:1 rule/test/doc mapping
- `check-rule-option-docs.ts` - Validates option/documentation sync
- `check-rule-option-interfaces.ts` - Enforces interface naming standards
- `audit-rule-docs.ts` - Audits documentation quality and completeness
- `verify-rule-implementations.ts` - Verifies all rules have implementations
- `generate-rule-types.ts` - Auto-generates TypeScript types from rules
- Pre-commit hooks validate structure and formatting
- CI pipeline runs all validation checks

#### Performance Benchmarks

Real-world performance on typical Claude Code projects:

```bash
# First run (cold cache)
$ time claudelint check-all
✓ All validation passed
204ms

# Second run (warm cache)
$ time claudelint check-all
✓ All validation passed (from cache)
84ms

# Speedup: ~2.4x with caching
```

Validator execution times (parallel):

- CLAUDE.md: ~13ms
- Skills: ~18ms
- Settings: ~10ms
- Hooks: ~7ms
- MCP: ~5ms
- Plugin: ~10ms
- **Total wall-clock:** ~128ms (includes overhead)

**vs. Sequential execution:** ~63ms total validator time → ~3.5x speedup with parallelization

## [0.1.0] - 2026-01-27

### Added

- Initial development version
- Core infrastructure and architecture
- Basic validation capabilities
- Test suite with 202+ tests

[Unreleased]: https://github.com/pdugan20/claudelint/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/pdugan20/claudelint/releases/tag/v0.1.0
