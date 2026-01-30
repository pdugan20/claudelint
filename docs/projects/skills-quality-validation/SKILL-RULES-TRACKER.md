# Skills Quality Validation - Centralized Rule Tracker

**Last Updated**: 2026-01-30
**Total Rules**: 41 (12 Easy + 17 Medium + 12 Hard)
**Progress**: 0/41 (0%)

**Note**: Originally 44 rules. H10-H12 (shellcheck, pylint, markdownlint) moved to Phase 0 architecture refactor as universal file-type validators.

## Status Legend

- [NOT STARTED] **Not Started** - Available to claim
- [IN PROGRESS] **In Progress** - Someone actively working
- [COMPLETE] **Complete** - Implemented and tested
- [BLOCKED] **Blocked** - Waiting on dependencies

## Priority Legend

- CRITICAL **CRITICAL** - Blocking issue or highest impact
- HIGH **HIGH** - Significant quality/security impact
- Medium **Medium** - Important but not urgent
- Low **Low** - Nice to have, low impact

---

## Phase 1: Easy Rules (12 rules)

Simple pattern-matching rules requiring minimal logic.

| ID | Rule Name | Status | Priority | Assignee | Guide Ref | Notes |
|----|-----------|--------|----------|----------|-----------|-------|
| E1 | `skill-readme-forbidden` | [NOT STARTED] | CRITICAL | - | p8 | Explicit requirement: no README.md in skill folders |
| E2 | `skill-missing-compatibility` | [NOT STARTED] | HIGH | - | p9 | Validate `compatibility` field in frontmatter |
| E3 | `skill-missing-license` | [NOT STARTED] | Medium | - | p9 | Validate `license` field in frontmatter |
| E4 | `skill-multiple-scripts` | [NOT STARTED] | HIGH | - | p8 | Only one executable script allowed per skill |
| E5 | `skill-xml-tags-anywhere` | [NOT STARTED] | CRITICAL | - | p10 | XML tags forbidden ANYWHERE (frontmatter + body + script) |
| E6 | `skill-body-word-count` | [NOT STARTED] | HIGH | - | p10 | Body must be <5,000 words (not lines!) |
| E7 | `skill-placeholder-content` | [NOT STARTED] | Medium | - | p11 | Detect TODO, FIXME, placeholder text |
| E8 | `skill-name-first-person` | [NOT STARTED] | Medium | - | p9 | Name must be descriptive, not first-person ("my-skill") |
| E9 | `skill-single-sentence-description` | [NOT STARTED] | HIGH | - | p9 | Description should be single sentence (no periods mid-sentence) |
| E10 | `skill-overly-generic-name` | [NOT STARTED] | Medium | - | p11 | Flag generic names ("helper", "utils", "tool") |
| E11 | `skill-references-directory-structure` | [NOT STARTED] | Medium | - | p10 | Validate references/ directory if exists |
| E12 | `skill-frontmatter-field-order` | [NOT STARTED] | Low | - | p9 | Enforce recommended field order |

**Phase 1 Progress**: 0/12 (0%)

---

## Phase 2: Medium Rules (17 rules)

Rules requiring parsing, NLP, or cross-file validation.

### Tier 1: Description Quality (MOST CRITICAL)

| ID | Rule Name | Status | Priority | Assignee | Guide Ref | Notes |
|----|-----------|--------|----------|----------|-----------|-------|
| M1 | `skill-description-trigger-phrases` | [NOT STARTED] | CRITICAL | - | p9-10 | Validate description includes effective trigger phrases |
| M2 | `skill-description-structure` | [NOT STARTED] | CRITICAL | - | p9 | Check for action verb + use case format |
| M3 | `skill-description-avoid-meta` | [NOT STARTED] | HIGH | - | p10 | No meta-language ("This skill...", "Use this to...") |

### Tier 2: Security & Integration

| ID | Rule Name | Status | Priority | Assignee | Guide Ref | Notes |
|----|-----------|--------|----------|----------|-----------|-------|
| M13 | `skill-hardcoded-secrets` | [NOT STARTED] | CRITICAL | - | p12 | Detect API keys, tokens, passwords in scripts |
| M11 | `skill-mcp-tool-qualified-name` | [NOT STARTED] | HIGH | - | p11 | MCP tools must use qualified names (server::tool) |

### Tier 3: Progressive Disclosure & Structure

| ID | Rule Name | Status | Priority | Assignee | Guide Ref | Notes |
|----|-----------|--------|----------|----------|-----------|-------|
| M4 | `skill-progressive-disclosure` | [NOT STARTED] | HIGH | - | p10 | Validate 3-level system (frontmatter → body → references/) |
| M5 | `skill-body-structure-quality` | [NOT STARTED] | Medium | - | p10 | Enforce Usage/Examples/Notes sections |
| M6 | `skill-examples-quality` | [NOT STARTED] | Medium | - | p10 | Validate examples are concrete and realistic |
| M7 | `skill-cross-reference-validation` | [NOT STARTED] | Medium | - | p10 | Referenced files in references/ must exist |
| M8 | `skill-usage-section-clarity` | [NOT STARTED] | Medium | - | p10 | Usage section must have clear commands/steps |

### Tier 4: Content Quality

| ID | Rule Name | Status | Priority | Assignee | Guide Ref | Notes |
|----|-----------|--------|----------|----------|-----------|-------|
| M9 | `skill-body-readability` | [NOT STARTED] | Medium | - | p10 | Check readability score (Flesch-Kincaid) |
| M10 | `skill-keyword-density` | [NOT STARTED] | Medium | - | p9 | Validate relevant keywords in description/body |
| M12 | `skill-argument-documentation` | [NOT STARTED] | Medium | - | p11 | If script accepts args, must be documented |
| M14 | `skill-output-format-documentation` | [NOT STARTED] | Low | - | p11 | Document expected output format if non-standard |
| M15 | `skill-error-handling-documentation` | [NOT STARTED] | Low | - | p11 | Document error conditions and exit codes |
| M16 | `skill-duplicate-content-check` | [NOT STARTED] | Low | - | p11 | Detect if body duplicates frontmatter |
| M17 | `skill-version-compatibility-check` | [NOT STARTED] | Low | - | p9 | Validate compatibility field format |

**Phase 2 Progress**: 0/17 (0%)

---

## Phase 3: Hard Rules (15 rules)

Rules requiring external integrations (MCP registry, LLM API, external tools).

### Tier 1: MCP Integration

| ID | Rule Name | Status | Priority | Assignee | Guide Ref | Notes |
|----|-----------|--------|----------|----------|-----------|-------|
| H1 | `skill-mcp-server-exists` | [NOT STARTED] | CRITICAL | - | p11 | Validate referenced MCP servers exist in registry |
| H2 | `skill-mcp-tool-exists` | [NOT STARTED] | CRITICAL | - | p11 | Validate MCP tools exist on specified server |

### Tier 2: LLM-Based Validation

| ID | Rule Name | Status | Priority | Assignee | Guide Ref | Notes |
|----|-----------|--------|----------|----------|-----------|-------|
| H3 | `skill-trigger-phrase-quality` | [NOT STARTED] | HIGH | - | p9-10 | Use Claude API to evaluate trigger phrase effectiveness |
| H4 | `skill-description-clarity` | [NOT STARTED] | HIGH | - | p9 | LLM evaluation of description clarity/effectiveness |
| H5 | `skill-body-relevance` | [NOT STARTED] | Medium | - | p10 | LLM check: body content aligns with description |

### Tier 3: Advanced Analysis

**Note**: Former Tier 3 (H10-H12: shellcheck, pylint, markdownlint) moved to Phase 0 architecture refactor.

| ID | Rule Name | Status | Priority | Assignee | Guide Ref | Notes |
|----|-----------|--------|----------|----------|-----------|-------|
| H6 | `skill-complexity-score` | [NOT STARTED] | Medium | - | p11 | Calculate skill complexity (script + deps) |
| H7 | `skill-dependency-validation` | [NOT STARTED] | Medium | - | p12 | Validate external tool dependencies documented |
| H8 | `skill-performance-check` | [NOT STARTED] | Low | - | p11 | Warn on slow operations without async patterns |
| H9 | `skill-test-coverage` | [NOT STARTED] | Low | - | p12 | Check for test files in tests/ directory |
| H13 | `skill-accessibility-check` | [NOT STARTED] | Low | - | p10 | Check for screen reader friendly output |
| H14 | `skill-internationalization` | [NOT STARTED] | Low | - | p11 | Warn on hardcoded English strings if i18n possible |
| H15 | `skill-semantic-versioning` | [NOT STARTED] | Low | - | p9 | Validate version field follows semver |

**Phase 3 Progress**: 0/12 (0%) - H10-H12 removed

---

## Dependencies

Rules that depend on other rules being implemented first:

- **M4** (progressive-disclosure) → depends on **E11** (references-directory-structure)
- **M7** (cross-reference-validation) → depends on **E11** (references-directory-structure)
- **H5** (body-relevance) → depends on **M1** (description-trigger-phrases)

---

## Priority Queue

**Work on these first** (ordered by impact):

1. **M1** - `skill-description-trigger-phrases` HIGH Biggest impact on skill triggering
2. **E1** - `skill-readme-forbidden` HIGH Explicit requirement, easy win
3. **E6** - `skill-body-word-count` HIGH Align with guide
4. **M13** - `skill-hardcoded-secrets` Security Critical security
5. **M11** - `skill-mcp-tool-qualified-name` HIGH Prevent integration errors
6. **E5** - `skill-xml-tags-anywhere` Security
7. **M2** - `skill-description-structure` HIGH Core quality
8. **H1** - `skill-mcp-server-exists` HIGH Prevent broken skills
9. **E2** - `skill-missing-compatibility` - Frontmatter completeness
10. **E4** - `skill-multiple-scripts` - Structural requirement

---

## Notes

### Implementation Patterns

Each rule should follow this structure:

```typescript
export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'quality', // or 'security', 'structure', etc.
    severity: 'error', // or 'warning'
    source: 'anthropic-guide',
    guideReference: 'p9',
  },
  validate: (context: SkillValidationContext) => {
    // Implementation
    if (violation) {
      context.reportError(message, location);
    }
  },
};
```

### Testing Requirements

Each rule must have tests for:

- DONE Valid examples (should pass)
- MISSING Invalid examples (should fail with correct message)
- Official Anthropic example skills (should pass - zero false positives)

### External Service Integration Pattern

For rules requiring external services (H1-H15):

```typescript
// Graceful degradation pattern
if (!isServiceAvailable()) {
  context.reportWarning('Rule skipped: service unavailable');
  return;
}
```

### Configuration

Hard rules should be opt-in via config:

```json
{
  "skills": {
    "enableMcpValidation": true,
    "enableLlmValidation": false,
    "claudeApiKey": "..."
  }
}
```

---

## Questions / Blockers

- [ ] Should LLM-based rules (H3-H5) be opt-in or automatic?
- [ ] What's the threshold for readability scores (M9)?
- [ ] Should we validate against official Anthropic skills repo as test suite?

---

## Related Files

- Implementation guides: EASY-RULES.md, MEDIUM-RULES.md, HARD-RULES.md
- Project overview: PROJECT-OVERVIEW.md
- Phase breakdown: IMPLEMENTATION-PHASES.md
- Best practices: ANTHROPIC-BEST-PRACTICES-SUMMARY.md
