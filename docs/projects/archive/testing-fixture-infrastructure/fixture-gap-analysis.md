# Fixture Gap Analysis

**Purpose:** Map what future rules need from test fixtures versus what the current fixture infrastructure provides. Identifies gaps that Milestone 4a must fill so future rule work (Milestones 5b, 6, 7, 8) doesn't stall on missing test infrastructure.

---

## Current Fixture Infrastructure

### Fluent Builders (6 of 9 needed)

| Builder | Status | Config Type |
|---------|--------|------------|
| ClaudeMdBuilder | Done | CLAUDE.md |
| SkillBuilder | Done (basic) | .claude/skills/*/SKILL.md |
| SettingsBuilder | Done | .claude/settings.json |
| HooksBuilder | Done | .claude/hooks/hooks.json |
| MCPBuilder | Done | .mcp.json |
| PluginBuilder | Done (basic) | .claude-plugin/plugin.json |
| AgentBuilder | **Missing** | .claude/agents/*/AGENT.md |
| OutputStyleBuilder | **Missing** | .claude/output-styles/*/*.md |
| LSPBuilder | **Missing** | .claude/lsp.json |

**Note:** Commands are deprecated (10th config type), so no builder is needed.

### Static Fixture Projects

| Project | Purpose | Files |
|---------|---------|-------|
| `valid-complete` | All 10 config types present and valid. Exit 0, 0 errors/warnings. | 10+ config files |
| `invalid-all-categories` | Intentional violations in every category. Exit 1. | 11 config files |
| `react-typescript-bloated` | CLAUDE.md optimization test case. | 6 files |

### SkillBuilder Current Capabilities

| Capability | Method | Status |
|-----------|--------|--------|
| Name | `with('name', ...)` | Done |
| Description | `with('description', ...)` | Done |
| Version | `with('version', ...)` | Done |
| Tags | `withAllFields()` | Done |
| Allowed tools | `withAllFields()` | Done |
| Custom frontmatter | `with(key, value)` | Done |
| Shell script | `withScript(content)` | Done |
| Markdown body | `withContent(content)` | Done |

### PluginBuilder Current Capabilities

| Capability | Method | Status |
|-----------|--------|--------|
| Name, version, description | `withMinimalManifest()` | Done |
| Author, skills, settings | `withCompleteManifest()` | Done |
| Custom fields | `with(key, value)` | Done |
| Invalid JSON | `buildInvalid()` | Done |

---

## Future Rules and Their Fixture Requirements

### Milestone 5b: Spec Alignment New Rules (5 rules)

| Rule ID | Severity | Fixture Need | Builder Gap |
|---------|----------|-------------|-------------|
| B6: skill-arguments-without-hint | warn | Skill with `$ARGUMENTS` in body but no `argument-hint` frontmatter | SkillBuilder needs `withArguments()` |
| B7: skill-side-effects-without-disable-model | warn | Skill with Bash/Write in allowed-tools but no `disable-model-invocation: true` | SkillBuilder needs `withDisableModelInvocation()`, `withSideEffectTools()` |
| B8: plugin-hook-missing-plugin-root | error | Plugin hooks referencing `./scripts/setup.sh` without `${CLAUDE_PLUGIN_ROOT}` | PluginBuilder needs `withHooks()` |
| B9: plugin-missing-component-paths | warn | Plugin with component paths missing `./` prefix | PluginBuilder needs `withComponentPaths()` |
| B5: skill-description-missing-trigger | warn | Skill with description lacking trigger phrases | Existing SkillBuilder sufficient (use `with('description', ...)`) |

### Milestone 6: Medium Skill Rules (17 rules)

| Rule ID | Severity | Fixture Need | Builder Gap |
|---------|----------|-------------|-------------|
| M1: skill-description-missing-trigger-phrases | warn | Skill with non-trigger description | Existing (covered by B5 overlap) |
| M2: skill-description-missing-capabilities | warn | Skill description without capability list | Existing SkillBuilder sufficient |
| M3: skill-description-too-vague | warn | Skill with generic "I help with stuff" description | Existing SkillBuilder sufficient |
| M4: skill-missing-error-handling | warn | Skill body without error handling patterns | SkillBuilder needs `withReferences()` for cross-ref |
| M5: skill-missing-examples | warn | Skill without usage examples | Existing SkillBuilder sufficient |
| M6: skill-body-missing-usage-section | warn | Skill body without `## Usage` heading | Existing SkillBuilder sufficient |
| M7: skill-allowed-tools-not-used | warn | Skill declaring tools not referenced in body | Existing SkillBuilder sufficient |
| M8: skill-context-too-broad | warn | Skill with `context: all` or many contexts | Existing SkillBuilder sufficient |
| M9: skill-shell-script-no-error-handling | warn | Shell script without `set -e` or `set -euo pipefail` | SkillBuilder needs `withErrorHandling()` |
| M10: skill-shell-script-hardcoded-paths | warn | Shell script with `/Users/username/path` | SkillBuilder needs `withHardcodedPath()` |
| M11: skill-mcp-tool-qualified-name | warn | Skill referencing MCP tool without `server:tool` format | SkillBuilder needs `withMCPToolReference()` |
| M12: skill-import-not-used | warn | Skill with unused import reference | Existing SkillBuilder sufficient |
| M13: skill-hardcoded-secrets | error | Shell script with `API_KEY="sk-..."` | SkillBuilder needs `withHardcodedSecret()` |
| M14: skill-progressive-disclosure-violation | warn | Skill with flat structure, no progressive disclosure | Existing SkillBuilder sufficient |
| M15: skill-frontmatter-missing-tags | warn | Skill without tags field | Existing SkillBuilder sufficient |
| M16: skill-frontmatter-missing-version | warn | Skill without version field | Existing SkillBuilder sufficient |
| M17: skill-description-missing-context | warn | Skill missing context field | Existing SkillBuilder sufficient |

### Milestone 7: Codebase Cross-Referencing

| Capability | Fixture Need | Builder Gap |
|-----------|-------------|-------------|
| npm script verification | CLAUDE.md with `npm run build` that matches package.json | valid-complete needs enhanced CLAUDE.md |
| File path verification | CLAUDE.md referencing real/fake file paths | ClaudeMdBuilder sufficient |
| Command verification | CLAUDE.md referencing `claudelint`, `prettier`, etc. | ClaudeMdBuilder sufficient |

### Milestone 8: Advanced Analysis

| Capability | Fixture Need | Builder Gap |
|-----------|-------------|-------------|
| Red flags detection | CLAUDE.md with stale commands, dead refs | ClaudeMdBuilder sufficient |
| Progressive disclosure | Skill with 3-level content hierarchy | Existing SkillBuilder sufficient |
| Additive guidance | CLAUDE.md missing common sections | ClaudeMdBuilder sufficient |

---

## Gap Summary

### Missing Builders (Phase 1)

| Builder | Needed By | Priority |
|---------|-----------|----------|
| AgentBuilder | General testing, not blocked by specific future rules | Medium |
| OutputStyleBuilder | General testing, not blocked by specific future rules | Medium |
| LSPBuilder | General testing, not blocked by specific future rules | Medium |

### Missing SkillBuilder Methods (Phase 2)

| Method | Needed By | Priority |
|--------|-----------|----------|
| `withArguments()` | M5b rule B6 | High |
| `withDisableModelInvocation()` | M5b rule B7 | High |
| `withSideEffectTools()` | M5b rule B7 | High |
| `withReferences()` | M6 rule M4, M7 | Medium |
| `withMCPToolReference()` | M6 rule M11 | Medium |
| `withErrorHandling()` | M6 rule M9 | Medium |
| `withHardcodedPath()` | M6 rule M10 | Medium |
| `withHardcodedSecret()` | M6 rule M13 | High |

### Missing PluginBuilder Methods (Phase 3)

| Method | Needed By | Priority |
|--------|-----------|----------|
| `withHooks()` | M5b rule B8 | High |
| `withComponentPaths()` | M5b rule B9 | High |

### Static Fixture Gaps (Phase 4)

| Fixture | Gap | Needed By |
|---------|-----|-----------|
| valid-complete | No `$ARGUMENTS` + `argument-hint` example | B6 |
| valid-complete | No `disable-model-invocation` example | B7 |
| valid-complete | No plugin hooks with `${CLAUDE_PLUGIN_ROOT}` | B8 |
| valid-complete | No plugin component paths | B9 |
| valid-complete | No `set -euo pipefail` in shell scripts | M9 |
| valid-complete | No cross-reference `npm run` in CLAUDE.md | M7 |
| invalid-all-categories | No `$ARGUMENTS` without hint | B6 |
| invalid-all-categories | No side-effect tools without disable-model | B7 |
| invalid-all-categories | No plugin hooks missing `${CLAUDE_PLUGIN_ROOT}` | B8 |
| invalid-all-categories | No plugin paths without `./` prefix | B9 |
| invalid-all-categories | No shell script without error handling | M9 |
| invalid-all-categories | No hardcoded paths in shell scripts | M10 |
| invalid-all-categories | No hardcoded secrets in shell scripts | M13 |

### Forward-Compatibility Gap (Phase 5)

| Gap | Impact |
|-----|--------|
| No per-directory `.claudelintrc.json` | New rules break existing integration tests |
| Vague assertion strings (`'Invalid'`, `'Invalid option'`) | Tests pass for wrong reasons, miss regressions |
| No error count pinning | Silent test pollution from new rules undetectable |

---

## Dependency Chain

```text
Phase 1 (builders) ──┐
Phase 2 (skill ext)  ├──> Phase 4 (static fixtures) ──> Phase 5 (integration) ──> Phase 6 (docs)
Phase 3 (plugin ext) ┘
```

Phases 1-3 can run in parallel. Phase 4 depends on phases 1-3 for builder methods used in fixture generation. Phase 5 depends on Phase 4 having stable fixtures. Phase 6 depends on everything being done.
