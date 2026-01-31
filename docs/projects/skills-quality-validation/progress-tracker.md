# Skills Quality Validation - Progress Tracker

**Last Updated**: 2026-01-30
**Status**: Planning Phase
**Progress**: 0/41 rules (0%) - Note: Reduced from 44 to 41 (removed H10-H12)

---

## How to Use This Tracker

- Mark tasks with `[x]` when complete
- Update the phase progress percentages
- Update "Last Updated" date when you make changes
- Link to PRs or commits in the Notes column

---

## Phase 0: Architecture Refactor (PREREQUISITE)

**Must complete before implementing any skill rules**

### Goal
Refactor claudelint architecture to match industry standards (ESLint/Prettier model)

### Current Problem
- `claudelint format` mixes linters (shellcheck, markdownlint) with formatter (prettier)
- Main `claudelint` command doesn't run external linters
- Not comprehensive in one pass

### Target Architecture

```bash
claudelint              # ALL linting (custom rules + shellcheck + markdownlint + pylint)
claudelint --fix        # Same, with autofixes applied
claudelint format       # Prettier only (or deprecate and use prettier directly)
```

### Tasks

- [ ] **Task 1**: Move shellcheck from format command to main linting
  - Integration point: Add to ValidatorRegistry or run alongside validators
  - Apply to ALL .sh files across all categories (skills, hooks, plugins)
  - Notes: _No autofix capability_

- [ ] **Task 2**: Move markdownlint from format command to main linting
  - Integration point: Add to ValidatorRegistry or run alongside validators
  - Apply to ALL .md files (SKILL.md, CLAUDE.md, references/*, etc.)
  - Support --fix flag (32/60+ rules support autofix)
  - Notes: _Has autofix capability_

- [ ] **Task 3**: Add pylint to main linting (NEW)
  - Integration point: Add to ValidatorRegistry or run alongside validators
  - Apply to ALL .py files across all categories
  - Support --fix flag if available
  - Notes: _Limited autofix via autopep8/black integration_

- [ ] **Task 4**: Update format command to run Prettier only
  - Remove shellcheck integration
  - Remove markdownlint integration
  - Keep only Prettier
  - Update command description/docs

- [ ] **Task 5**: Update documentation
  - Update CLI docs to explain new architecture
  - Update CONTRIBUTING.md if exists
  - Update README with correct usage examples

- [ ] **Task 6**: Add tests for new architecture
  - Test that main command runs all external linters
  - Test --fix flag integration
  - Test graceful degradation when tools not installed

### Success Criteria

- [ ] Running `claudelint` executes shellcheck, markdownlint, pylint on appropriate files
- [ ] `claudelint --fix` applies markdownlint fixes
- [ ] `claudelint format` runs Prettier only
- [ ] All tests passing
- [ ] Documentation updated

### Estimated Effort
2-3 days

---

## Phase 1: Easy Rules (12 rules, 2-3 days)

**Progress**: 0/12 (0%)

### Day 1: Core Structural Rules

- [ ] **E1**: `skill-readme-forbidden` (30 min)
  - Notes: _Check for forbidden README.md in skill folders_

- [ ] **E4**: `skill-multiple-scripts` (45 min)
  - Notes: _Only one executable script per skill_

- [ ] **E5**: `skill-xml-tags-anywhere` (1 hour)
  - Notes: _XML tags forbidden everywhere (extend existing rule)_

- [ ] **E6**: `skill-body-word-count` (1 hour)
  - Notes: _Replace line count with word count (<5,000 words)_

**Day 1 Subtotal**: 0/4 complete

### Day 2: Frontmatter Enhancement

- [ ] **E2**: `skill-missing-compatibility` (30 min)
  - Notes: _Add compatibility field to schema_

- [ ] **E3**: `skill-missing-license` (30 min)
  - Notes: _Add license field to schema_

- [ ] **E9**: `skill-single-sentence-description` (1 hour)
  - Notes: _Description should be single sentence_

- [ ] **E12**: `skill-frontmatter-field-order` (1 hour)
  - Notes: _Validate recommended field order_

**Day 2 Subtotal**: 0/4 complete

### Day 3: Content Quality Basics

- [ ] **E7**: `skill-placeholder-content` (45 min)
  - Notes: _Detect TODO, FIXME, placeholders_

- [ ] **E8**: `skill-name-first-person` (45 min)
  - Notes: _Flag first-person skill names (my-skill)_

- [ ] **E10**: `skill-overly-generic-name` (1 hour)
  - Notes: _Flag generic names (helper, utils, tool)_

- [ ] **E11**: `skill-references-directory-structure` (1 hour)
  - Notes: _Validate references/ folder structure_

**Day 3 Subtotal**: 0/4 complete

### Phase 1 Summary

- [ ] All 12 rules implemented
- [ ] All 47 tests written and passing
- [ ] Zero false positives on official Anthropic examples
- [ ] Phase 1 documentation complete

---

## Phase 2: Medium Rules (17 rules, 1-2 weeks)

**Progress**: 0/17 (0%)

### Week 1: Description Quality

#### Day 4: Trigger Phrase Validation (HIGHEST IMPACT)

- [ ] **M1**: `skill-description-trigger-phrases` (6 hours)
  - Notes: _Build trigger phrase library, validate presence_
  - [ ] Create trigger-phrases.json library
  - [ ] Implement keyword extraction
  - [ ] Write 10 comprehensive tests

**Day 4 Subtotal**: 0/1 complete

#### Day 5: Description Structure

- [ ] **M2**: `skill-description-structure` (3 hours)
  - Notes: _Validate action verb + use case pattern_

- [ ] **M3**: `skill-description-avoid-meta` (2 hours)
  - Notes: _Detect meta-language patterns_

**Day 5 Subtotal**: 0/2 complete

#### Day 6-7: Progressive Disclosure & Body Structure

- [ ] **M4**: `skill-progressive-disclosure` (4 hours)
  - Notes: _Validate 3-level hierarchy (depends on E11)_

- [ ] **M5**: `skill-body-structure-quality` (3 hours)
  - Notes: _Enforce Usage/Examples/Notes sections_

- [ ] **M8**: `skill-usage-section-clarity` (4 hours)
  - Notes: _Validate clear commands in Usage section_

**Day 6-7 Subtotal**: 0/3 complete

#### Day 8: Content Quality

- [ ] **M6**: `skill-examples-quality` (3 hours)
  - Notes: _Validate concrete examples (not placeholders)_

- [ ] **M9**: `skill-body-readability` (2 hours)
  - Notes: _Flesch-Kincaid readability scoring_

**Day 8 Subtotal**: 0/2 complete

### Week 2: Security & Integration

#### Day 9: Security (CRITICAL)

- [ ] **M13**: `skill-hardcoded-secrets` (6 hours)
  - Notes: _Detect API keys, tokens, passwords_
  - [ ] Create secret-patterns.ts library
  - [ ] Implement entropy analysis
  - [ ] Write 12 comprehensive tests

**Day 9 Subtotal**: 0/1 complete

#### Day 10: MCP Integration

- [ ] **M11**: `skill-mcp-tool-qualified-name` (5 hours)
  - Notes: _Validate server::tool format_

**Day 10 Subtotal**: 0/1 complete

#### Day 11: Cross-Reference & Keywords

- [ ] **M7**: `skill-cross-reference-validation` (3 hours)
  - Notes: _Validate referenced files exist (depends on E11)_

- [ ] **M10**: `skill-keyword-density` (2 hours)
  - Notes: _Extract keywords, validate relevance_

**Day 11 Subtotal**: 0/2 complete

#### Day 12-13: Documentation Quality

- [ ] **M12**: `skill-argument-documentation` (3 hours)
  - Notes: _Validate args are documented_

- [ ] **M14**: `skill-output-format-documentation` (2 hours)
  - Notes: _Check for output documentation_

- [ ] **M15**: `skill-error-handling-documentation` (2 hours)
  - Notes: _Validate error condition docs_

- [ ] **M16**: `skill-duplicate-content-check` (2 hours)
  - Notes: _Compare frontmatter vs body content_

- [ ] **M17**: `skill-version-compatibility-check` (1 hour)
  - Notes: _Validate compatibility field format_

**Day 12-13 Subtotal**: 0/5 complete

### Phase 2 Summary

- [ ] All 17 rules implemented
- [ ] All 108 tests written and passing
- [ ] Trigger phrase library complete
- [ ] Secret detection patterns complete
- [ ] Phase 2 documentation complete

---

## Phase 3: Hard Rules (12 rules, 2-3 weeks)

**Progress**: 0/12 (0%) - Note: H10-H12 removed (handled by Phase 0 architecture refactor)

### Week 3: MCP Integration

#### Day 14-15: MCP Registry

- [ ] **Infrastructure**: MCP Registry Client (Day 14)
  - [ ] Design MCP registry client architecture
  - [ ] Implement caching strategy
  - [ ] Implement graceful degradation pattern
  - [ ] Write architecture documentation

- [ ] **H1**: `skill-mcp-server-exists` (5 hours)
  - Notes: _Validate MCP servers exist in registry_

- [ ] **H2**: `skill-mcp-tool-exists` (4 hours)
  - Notes: _Validate MCP tools exist on server (depends on H1)_

**Week 3 Subtotal**: 0/2 complete

### Week 4: LLM-Based Validation

#### Day 16: LLM Integration Architecture

- [ ] **Infrastructure**: Claude API Client
  - [ ] Design Claude API client architecture
  - [ ] Implement prompt template system
  - [ ] Implement rate limiting and budget controls
  - [ ] Create opt-in configuration schema
  - [ ] Write architecture documentation

**Day 16 Subtotal**: Infrastructure only

#### Day 17-18: LLM Rules

- [ ] **H3**: `skill-trigger-phrase-quality` (6 hours)
  - Notes: _LLM evaluation of trigger phrase effectiveness_

- [ ] **H4**: `skill-description-clarity` (3 hours)
  - Notes: _LLM evaluation of description clarity_

- [ ] **H5**: `skill-body-relevance` (3 hours)
  - Notes: _LLM check body aligns with description (depends on M1)_

**Day 17-19 Subtotal**: 0/3 complete

### Week 5: Advanced Analysis (Continued)

#### Day 21-24: Advanced Rules (Continued)

**Note**: H10-H12 (shellcheck, pylint, markdownlint integration) have been **removed from this project**. These are handled by the Phase 0 architecture refactor as universal file-type validators, not skill-specific rules.

### Week 6: Advanced Analysis

#### Day 25-27: Advanced Rules

- [ ] **H6**: `skill-complexity-score` (3 hours)
  - Notes: _Calculate cyclomatic complexity_

- [ ] **H7**: `skill-dependency-validation` (3 hours)
  - Notes: _Parse and validate external dependencies_

- [ ] **H8**: `skill-performance-check` (2 hours)
  - Notes: _Detect slow operations without async_

- [ ] **H9**: `skill-test-coverage` (2 hours)
  - Notes: _Check for test files in tests/_

- [ ] **H13**: `skill-accessibility-check` (2 hours)
  - Notes: _Validate screen reader friendly output_

- [ ] **H14**: `skill-internationalization` (2 hours)
  - Notes: _Warn on hardcoded English strings_

- [ ] **H15**: `skill-semantic-versioning` (1 hour)
  - Notes: _Validate version field follows semver_

**Day 25-27 Subtotal**: 0/7 complete

#### Day 28: Integration & Polish

- [ ] **Integration Testing**
  - [ ] Integration tests across all rules
  - [ ] Performance optimization (<2s per skill)
  - [ ] Final documentation updates
  - [ ] SKILL-RULES-TRACKER.md final update

### Phase 3 Summary

- [ ] All 12 rules implemented (H10-H12 removed)
- [ ] All 80+ tests written and passing
- [ ] MCP registry client library complete
- [ ] Claude API client library complete
- [ ] Configuration documentation complete
- [ ] Phase 3 documentation complete

---

## Overall Project Status

### Architecture Refactor (Phase 0)
- **Status**: Not started
- **Required before**: Any rule implementation

### Rule Implementation

- **Phase 1**: 0/12 (0%)
- **Phase 2**: 0/17 (0%)
- **Phase 3**: 0/12 (0%)
- **Total**: 0/41 (0%)

### Infrastructure Components

- [ ] Trigger phrase library (trigger-phrases.json)
- [ ] Secret detection patterns (secret-patterns.ts)
- [ ] MCP registry client
- [ ] Claude API client with budget controls
- [ ] External tool wrapper
- [ ] Configuration schema updates

### Testing

- [ ] 255+ test cases written
- [ ] Official Anthropic examples tested (zero false positives)
- [ ] Integration test suite
- [ ] Performance benchmarks

### Documentation

- [x] Project structure created
- [x] Implementation guides written
- [x] Best practices summary complete
- [x] Centralized tracker created
- [ ] Per-rule documentation
- [ ] API documentation for new libraries
- [ ] Configuration guide

### Success Criteria

- [ ] 90%+ alignment with Anthropic guide recommendations
- [ ] <5% false positive rate on official example skills
- [ ] Rules execute in <2 seconds for typical skill
- [ ] User satisfaction >4/5 based on feedback

---

## Quick Reference

### Critical Path (Highest Impact First)

1. [ ] Day 4: **M1** - Trigger phrases (BIGGEST IMPACT)
2. [ ] Day 1: **E1**, **E5**, **E6** - Structural + security
3. [ ] Day 5: **M2**, **M3** - Description quality
4. [ ] Day 9: **M13** - Hardcoded secrets (SECURITY)
5. [ ] Day 10: **M11** - MCP tool names
6. [ ] Days 14-15: **H1**, **H2** - MCP validation
7. [ ] Days 17-18: **H3** - LLM trigger phrase evaluation

### Dependencies

- **E11** → required by **M4**, **M7**
- **M1** → required by **H5**
- **H1** → required by **H2**

### Current Sprint

**Focus**: Phase 1 - Easy Rules (2-3 days)
**Next Up**: E1, E4, E5, E6 (Day 1 core structural rules)

---

## Notes & Blockers

### 2026-01-30

- Initial project structure created
- All documentation complete
- **Architecture decision**: H10-H12 removed from skills project
  - shellcheck, pylint, markdownlint are universal file-type validators
  - Will be integrated in Phase 0 architecture refactor
  - Skills project now focuses on 41 skill-specific rules only
- Added Phase 0: Architecture refactor (prerequisite)
- Ready to begin Phase 0 implementation

### External Tool Clarification (RESOLVED)

**Current state**: We ARE already using shellcheck and markdownlint, but in different contexts:

1. **`claudelint format` command** (src/cli/commands/format.ts):
   - Manually run formatting tool on Claude-specific files (.claude/**, CLAUDE.md)
   - User explicitly calls `claudelint format` or `claudelint format --check`
   - Shellcheck checks shell scripts, markdownlint checks markdown files
   - Used for general project formatting/linting

2. **Pre-commit hooks** (.pre-commit-config.yaml):
   - Markdownlint runs automatically on git commit
   - Prevents committing poorly formatted markdown

**H10-H12 rules are COMPLEMENTARY, not redundant**:

- **Different purpose**: Validation rules that run during SKILL validation
- **Automatic**: When you run `claudelint` on a skill, it would automatically check the script quality
- **Part of quality validation**: Integrated into the skill validation workflow, not a separate format command
- **Skill-specific**: Only runs on skill scripts during skill validation

**Example flow**:
```bash
# Current (format command - manual)
claudelint format --check  # Checks all .claude/** files

# With H10-H12 (validation - automatic)
claudelint validate .claude/skills/my-skill  # Automatically runs shellcheck on my-skill.sh as part of validation
```

**Decision**: Keep H10-H12 in the plan - they provide automatic quality checking during skill validation
