# Claude Validator - Development Roadmap

Centralized tracker for project phases and tasks. Mark items as complete as we go.

## Phase 1: MVP - Core Infrastructure (Current Phase)

**Goal**: Basic CLI with CLAUDE.md and Skills validation

### 1.1 Project Setup ✅ COMPLETE

- [x] Initialize npm package structure
- [x] Create TypeScript configuration
- [x] Set up build system
- [x] Create plugin manifest
- [x] Set up documentation structure
- [x] Initialize git repository
- [x] Add LICENSE file
- [x] Set up ESLint configuration
- [x] Set up Prettier configuration
- [x] Set up Jest for testing
- [x] Create initial commit (a6e5ef8)

### 1.2 Core Architecture ✅ COMPLETE

- [x] Design validator interface/base class
- [x] Create error/warning reporting system
- [x] Build CLI argument parser (using commander)
- [x] Implement colored console output (using chalk)
- [x] Create file discovery utilities (using glob)
- [x] Design validation result schema
- [x] Write initial utility tests

### 1.3 CLAUDE.md Validator ✅ COMPLETE

- [x] Implement size limit checking (35KB warning, 40KB error)
- [x] Validate markdown formatting
- [x] Check import syntax (`@path/to/file`)
- [x] Validate recursive import depth (max 5)
- [x] Check YAML frontmatter in rules files
- [x] Validate `paths` glob patterns in frontmatter
- [x] Write tests for CLAUDE.md validator
- [x] Integrate into CLI (check-claude-md command)
- [x] Test on real project files

### 1.4 Skills Validator ✅ COMPLETE

- [x] Port existing bash validator to TypeScript
- [x] Validate SKILL.md frontmatter schema
- [x] Check required fields (name, description)
- [x] Validate optional fields (allowed-tools, context, etc.)
- [x] Check referenced files exist
- [x] Validate skill directory structure
- [x] Check markdown formatting in SKILL.md
- [x] Validate string substitutions ($ARGUMENTS, $0, etc.)
- [x] Integrate into CLI (validate-skills command)
- [x] Add --skill flag for specific skill validation
- [ ] Write tests for skills validator

### 1.5 CLI Implementation

- [ ] Implement `check-all` command
- [ ] Implement `check-claude-md` command
- [ ] Implement `validate-skills` command
- [ ] Add `--verbose` flag
- [ ] Add `--warnings-as-errors` flag
- [ ] Add `--path` option for custom paths
- [ ] Create exit codes (0=success, 1=warnings, 2=errors)
- [ ] Write CLI integration tests

### 1.6 Documentation

- [x] Create README.md
- [x] Create ROADMAP.md (this file)
- [ ] Create validators.md
- [ ] Create development.md
- [ ] Create architecture.md
- [ ] Add usage examples
- [ ] Document error codes

**Phase 1 Completion**: COMPLETE (2026-01-26)

All core validators implemented and tested:

- CLAUDE.md validator with size limits, imports, frontmatter
- Skills validator with comprehensive frontmatter and structure checks
- 29 passing tests with high coverage
- CLI interface operational
- Utilities for file system, markdown, YAML, and reporting

---

## Phase 2: Settings & Hooks Validation

**Goal**: Validate settings.json and hooks configuration

### 2.1 Settings Validator ✅ COMPLETE

- [x] Create JSON schema for settings.json
- [x] Validate using Zod schemas
- [x] Check permission rules syntax
- [x] Validate tool names against known tools list
- [x] Check model names (sonnet, opus, haiku, inherit)
- [x] Validate file paths in apiKeyHelper, hooks, etc.
- [x] Check environment variable names
- [x] Validate plugin references
- [x] Write tests for settings validator
- [x] Detect hardcoded secrets in environment variables
- [x] Integrate into CLI (validate-settings command)

### 2.2 Hooks Validator ✅ COMPLETE

- [x] Validate hooks.json schema
- [x] Check event names (PreToolUse, PostToolUse, etc.)
- [x] Validate hook types (command, prompt, agent)
- [x] Check script files exist and are executable
- [x] Validate matcher patterns (regex validation)
- [x] Check variable expansion syntax
- [x] Validate JSON output schema for advanced hooks
- [x] Write tests for hooks validator
- [x] Integrate into CLI (validate-hooks command)

### 2.3 CLI Integration ✅ COMPLETE

- [x] Implement `validate-settings` command
- [x] Implement `validate-hooks` command
- [x] Update `check-all` to include new validators (CLAUDE.md, Skills, Settings, Hooks)
- [x] Add overall summary with totals
- [x] Proper exit codes for all commands
- [ ] Add examples to documentation
- [ ] Update README with new commands

**Phase 2 Completion**: ✅ COMPLETE (2026-01-26)

All Phase 2 validators implemented and tested:

- Settings validator with Zod schemas and comprehensive validation
- Hooks validator with event, type, and matcher validation
- CLI integration with check-all command
- 67 passing tests with high coverage
- All validators operational and integrated

---

## Phase 3: MCP & Plugin Validation

**Goal**: Validate MCP servers and plugin manifests

### 3.1 MCP Server Validator

- [ ] Validate .mcp.json schema
- [ ] Check server name uniqueness
- [ ] Validate transport types (stdio, HTTP, SSE)
- [ ] Check command/URL validity
- [ ] Validate environment variable syntax
- [ ] Check `${VAR}` and `${VAR:-default}` expansion
- [ ] Validate `${CLAUDE_PLUGIN_ROOT}` in plugins
- [ ] Write tests for MCP validator

### 3.2 Plugin Manifest Validator

- [ ] Validate plugin.json schema
- [ ] Check required fields (name, version, description)
- [ ] Validate semantic versioning
- [ ] Check directory structure (components at root, not in .claude-plugin/)
- [ ] Validate file references exist
- [ ] Check cross-references (skills, agents, hooks)
- [ ] Validate marketplace.json schema
- [ ] Write tests for plugin validator

### 3.3 CLI Additions

- [ ] Implement `validate-mcp` command
- [ ] Implement `validate-plugin` command
- [ ] Update documentation

**Phase 3 Completion Target**: Week 3

---

## Phase 4: Claude Code Plugin Integration

**Goal**: Create Claude Code skills and hooks

### 4.1 Skills Creation

- [ ] Create `/validate` skill (runs check-all)
- [ ] Create `/validate-claude-md` skill
- [ ] Create `/validate-skills` skill
- [ ] Create `/validate-settings` skill
- [ ] Create `/validate-hooks` skill
- [ ] Create `/validate-mcp` skill
- [ ] Create `/validate-plugin` skill
- [ ] Write SKILL.md for each skill

### 4.2 Hooks Integration

- [ ] Create PreToolUse hook to block invalid configs
- [ ] Create hook for validating on file save
- [ ] Create SessionStart hook for initial validation
- [ ] Document hook usage

### 4.3 Plugin Testing

- [ ] Test plugin installation locally
- [ ] Test skills work correctly
- [ ] Test hooks trigger appropriately
- [ ] Write plugin integration tests

**Phase 4 Completion Target**: Week 4

---

## Phase 5: Advanced Features

**Goal**: Auto-fix, security scanning, advanced validation

### 5.1 Auto-fix Capabilities

- [ ] Implement markdown formatting auto-fix
- [ ] Add missing frontmatter fields with defaults
- [ ] Fix common YAML syntax errors
- [ ] Add `--auto-fix` flag to CLI
- [ ] Create `fix-markdown` skill
- [ ] Write tests for auto-fix

### 5.2 Security Scanning

- [ ] Scan for hardcoded API keys
- [ ] Check for exposed secrets in configs
- [ ] Validate permission restrictions
- [ ] Check hook script safety
- [ ] Implement `check-security` command
- [ ] Write security scanning tests

### 5.3 Cross-reference Validation

- [ ] Validate tool names across all files
- [ ] Check skill name references
- [ ] Validate agent name references
- [ ] Check file path consistency
- [ ] Detect circular dependencies

### 5.4 Advanced Reporting

- [ ] Add JSON output format
- [ ] Create HTML report generator
- [ ] Add summary statistics
- [ ] Implement severity levels
- [ ] Add suggested fixes in output

**Phase 5 Completion Target**: Week 5-6

---

## Phase 6: Agents & Commands Validation

**Goal**: Complete coverage of all Claude Code components

### 6.1 Agents Validator

- [ ] Validate agent frontmatter schema
- [ ] Check tool allowlist/denylist
- [ ] Validate model selections
- [ ] Check permission modes
- [ ] Validate skill preloading
- [ ] Write tests for agents validator

### 6.2 Commands/Prompts Validator

- [ ] Validate command structure
- [ ] Check markdown formatting
- [ ] Validate frontmatter
- [ ] Check file references
- [ ] Write tests for commands validator

### 6.3 LSP & Output Styles

- [ ] Validate .lsp.json schema
- [ ] Check output styles configuration
- [ ] Validate language mappings
- [ ] Write tests

**Phase 6 Completion Target**: Week 7

---

## Phase 7: Testing & Quality

**Goal**: Comprehensive test coverage and CI/CD

### 7.1 Testing

- [ ] Achieve 80%+ code coverage
- [ ] Add integration tests
- [ ] Add end-to-end tests
- [ ] Test on real-world projects (NextUp, nextup-backend)
- [ ] Performance testing with large files

### 7.2 CI/CD Setup

- [ ] Create GitHub Actions workflow
- [ ] Run tests on PR
- [ ] Run linting on PR
- [ ] Automate npm publishing
- [ ] Add pre-commit hooks to this project

### 7.3 Code Quality

- [ ] ESLint compliance
- [ ] Prettier formatting
- [ ] TypeScript strict mode
- [ ] No any types
- [ ] Documentation comments

**Phase 7 Completion Target**: Week 8

---

## Phase 8: Documentation & Publishing

**Goal**: Publish to npm and share with community

### 8.1 Documentation Completion

- [ ] Complete all docs/ files
- [ ] Add comprehensive examples
- [ ] Create troubleshooting guide
- [ ] Add FAQ section
- [ ] Create contributing guide
- [ ] Add code of conduct

### 8.2 Publishing

- [ ] Publish to npm as @patdugan/claude-validator
- [ ] Tag v1.0.0 release
- [ ] Create GitHub release with changelog
- [ ] Update README with installation instructions

### 8.3 Community

- [ ] Share on GitHub
- [ ] Write blog post/announcement
- [ ] Add to awesome-claude-code list (if exists)
- [ ] Share in Claude Code community

**Phase 8 Completion Target**: Week 9

---

## Future Enhancements (Post v1.0)

### Nice-to-Have Features

- [ ] VSCode extension integration
- [ ] GitHub Action for PR validation
- [ ] Watch mode for continuous validation
- [ ] Configuration file (.claudevalidatorrc)
- [ ] Custom rule definitions
- [ ] Validate .claudeignore syntax
- [ ] Detect duplicate skills/commands
- [ ] Performance profiling of validators
- [ ] Integration with other linters (markdownlint, etc.)
- [ ] Machine learning for suggesting improvements

### Ecosystem Building

- [ ] Create awesome-claude-plugins GitHub list
- [ ] Build web directory for plugin discovery
- [ ] Create plugin registry service
- [ ] Build search/stats tooling

---

## Metrics

### Definition of Done (per phase)

- All tasks completed
- Tests written and passing
- Documentation updated
- No linting errors
- Reviewed and approved

### Success Criteria (v1.0)

- [ ] All 13 Claude Code components validated
- [ ] 80%+ test coverage
- [ ] Published to npm
- [ ] 10+ GitHub stars
- [ ] Used in NextUp and nextup-backend projects
- [ ] Zero critical bugs

---

## Notes

- Update this file as tasks complete
- Add new tasks as discovered
- Link to relevant GitHub issues
- Track blockers and dependencies
- Celebrate milestones!

**Last Updated**: 2026-01-26
