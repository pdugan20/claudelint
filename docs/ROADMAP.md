# Claude Validator - Development Roadmap

Centralized tracker for project phases and tasks. Mark items as complete as we go.

## Phase 1: MVP - Core Infrastructure (Current Phase)

**Goal**: Basic CLI with CLAUDE.md and Skills validation

### 1.1 Project Setup

- [x] Initialize npm package structure
- [x] Create TypeScript configuration
- [x] Set up build system
- [x] Create plugin manifest
- [x] Set up documentation structure
- [ ] Initialize git repository
- [ ] Add LICENSE file
- [ ] Set up ESLint configuration
- [ ] Set up Prettier configuration
- [ ] Set up Jest for testing

### 1.2 Core Architecture

- [ ] Design validator interface/base class
- [ ] Create error/warning reporting system
- [ ] Build CLI argument parser (using commander)
- [ ] Implement colored console output (using chalk)
- [ ] Create file discovery utilities (using glob)
- [ ] Design validation result schema

### 1.3 CLAUDE.md Validator

- [ ] Implement size limit checking (35KB warning, 40KB error)
- [ ] Validate markdown formatting
- [ ] Check import syntax (`@path/to/file`)
- [ ] Validate recursive import depth (max 5)
- [ ] Check YAML frontmatter in rules files
- [ ] Validate `paths` glob patterns in frontmatter
- [ ] Write tests for CLAUDE.md validator

### 1.4 Skills Validator

- [ ] Port existing bash validator to TypeScript
- [ ] Validate SKILL.md frontmatter schema
- [ ] Check required fields (name, description)
- [ ] Validate optional fields (allowed-tools, context, etc.)
- [ ] Check referenced files exist
- [ ] Validate skill directory structure
- [ ] Check markdown formatting in SKILL.md
- [ ] Validate string substitutions ($ARGUMENTS, $0, etc.)
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

**Phase 1 Completion Target**: Week 1

---

## Phase 2: Settings & Hooks Validation

**Goal**: Validate settings.json and hooks configuration

### 2.1 Settings Validator

- [ ] Create JSON schema for settings.json
- [ ] Validate using Zod schemas
- [ ] Check permission rules syntax
- [ ] Validate tool names against known tools list
- [ ] Check model names (sonnet, opus, haiku, inherit)
- [ ] Validate file paths in apiKeyHelper, hooks, etc.
- [ ] Check environment variable names
- [ ] Validate plugin references
- [ ] Write tests for settings validator

### 2.2 Hooks Validator

- [ ] Validate hooks.json schema
- [ ] Check event names (PreToolUse, PostToolUse, etc.)
- [ ] Validate hook types (command, prompt, agent)
- [ ] Check script files exist and are executable
- [ ] Validate matcher patterns
- [ ] Check variable expansion syntax
- [ ] Validate JSON output schema for advanced hooks
- [ ] Write tests for hooks validator

### 2.3 CLI Additions

- [ ] Implement `validate-settings` command
- [ ] Implement `validate-hooks` command
- [ ] Update `check-all` to include new validators
- [ ] Add examples to documentation

**Phase 2 Completion Target**: Week 2

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
