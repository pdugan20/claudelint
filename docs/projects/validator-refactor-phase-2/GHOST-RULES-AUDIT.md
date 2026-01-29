# Ghost Rules Audit

**Last Updated:** 2026-01-29
**Total Ghost Rules Identified:** ~66

## What is a Ghost Rule?

A "ghost rule" is a validation that:
- Calls `reportError()` or `reportWarning()` WITHOUT a ruleId
- Bypasses the configuration system
- Cannot be disabled by users
- Cannot have severity overridden
- Cannot be configured with options

**Example:**
```typescript
// Ghost rule (BAD)
this.reportError('MCP stdio transport command cannot be empty', filePath);
//                                                                ↑
//                                                    No ruleId parameter!

// Real rule (GOOD)
this.reportError('Command cannot be empty', filePath, undefined, 'mcp-empty-command');
//                                                                 ↑
//                                                    Has ruleId!
```

## Inventory by Validator

### MCP Validator (src/validators/mcp.ts)

**Total:** ~10 ghost rules

| Line | Type | Severity | Message | Proposed Rule ID | Difficulty |
|------|------|----------|---------|------------------|------------|
| 61 | Warning | warn | Server key does not match name | `mcp-server-key-mismatch` | Easy |
| 102 | Error | error | stdio transport command empty | `mcp-stdio-empty-command` | Easy |
| 112 | Warning | warn | Simple var expansion $VAR | `mcp-simple-var-expansion` | Easy |
| 119 | Error | error | SSE transport URL empty | `mcp-sse-empty-url` | Easy |
| 130 | Error | error | Invalid URL in SSE transport | `mcp-sse-invalid-url` | Easy |
| 143 | Error | error | HTTP transport URL empty | `mcp-http-empty-url` | Easy |
| 153 | Error | error | Invalid URL in HTTP transport | `mcp-http-invalid-url` | Easy |
| 166 | Error | error | WebSocket URL empty | `mcp-websocket-empty-url` | Easy |
| 176 | Warning | warn | Invalid URL in WebSocket | `mcp-websocket-invalid-url` | Easy |
| 183 | Error | error | Invalid URL with variable | `mcp-url-with-variable` | Easy |

**From utility function (validation-helpers.ts:49-84):**

| Source | Type | Severity | Message | Proposed Rule ID | Difficulty |
|--------|------|----------|---------|------------------|------------|
| Line 54 | Warning | warn | Env var should be uppercase | `mcp-env-var-invalid-naming` | Medium |
| Line 62 | Warning | warn | Empty env var value | `mcp-env-var-empty-value` | Easy |
| Line 77 | Warning | warn | Hardcoded secret detected | `mcp-env-var-hardcoded-secret` | Medium |

**Notes:**
- All are straightforward conversions
- Variable expansion already has a rule (`mcp-invalid-env-var`), but it only checks syntax, not these other aspects
- Consider consolidating URL validation into single rule with transport type as context

---

### Claude.md Validator (src/validators/claude-md.ts)

**Total:** ~8 ghost rules

| Line | Type | Severity | Message | Proposed Rule ID | Difficulty |
|------|------|----------|---------|------------------|------------|
| 99 | Error | error | File not found: ${path} | `claude-md-file-not-found` | Easy |
| 230 | Warning | warn | Case-sensitive filename collision | `claude-md-filename-case-sensitive` | Medium |
| 250 | Error | error | Import not found | `claude-md-import-missing` | Easy |
| 276 | Error | error | Import is inside code block | `claude-md-import-in-code-block` | Easy |
| 288 | Warning | warn | Circular import detected | `claude-md-import-circular` | Medium |
| 300 | Warning | warn | Too many sections in CLAUDE.md | `claude-md-content-too-many-sections` | Easy |
| 312 | Error | error | Glob pattern has backslash | `claude-md-glob-pattern-backslash` | Easy |
| 339 | Error | error | Glob pattern too broad | `claude-md-glob-pattern-too-broad` | Easy |

**Notes:**
- Some already have rules (import-in-code-block, content-too-many-sections, glob patterns)
- Need to verify which are duplicates vs actually missing
- Circular import logic is complex with depth tracking - Medium difficulty
- Case-sensitive collision requires filesystem checks - Medium difficulty

---

### Skills Validator (src/validators/skills.ts)

**Total:** ~12 ghost rules

| Line | Type | Severity | Message | Proposed Rule ID | Difficulty |
|------|------|----------|---------|------------------|------------|
| 91 | Warning | warn | No skill directories found | `skill-no-directories-found` | Easy |
| 115 | Error | error | SKILL.md not found | `skill-missing-skill-md` | Easy |
| 170 | Error | error | Name does not match directory | `skill-name-mismatch` | Easy |
| 208 | Warning | warn | Body content very short | `skill-body-too-short` | Easy |
| 217 | Warning | warn | Missing usage examples | `skill-missing-examples` | Medium |
| 233 | Warning | warn | Invalid variable substitution | `skill-invalid-substitution` | Medium |
| Various | Warning | warn | Multi-script README checks | `skill-multi-script-missing-readme` | Easy |
| Various | Warning | warn | Shell script shebang | `skill-missing-shebang` | Easy |
| Various | Warning | warn | Shell script comments | `skill-missing-comments` | Easy |
| Various | Warning | warn | Missing CHANGELOG.md | `skill-missing-changelog` | Easy |
| Various | Warning | warn | Inconsistent naming | `skill-naming-inconsistent` | Medium |
| Various | Info | info | Version field missing | `skill-missing-version` | Easy |

**Notes:**
- Many are already converted to rules in Phase 5
- Need to verify which are actual ghosts vs already have rules
- Variable substitution logic is moderately complex
- Most are straightforward file existence checks

---

### Agents Validator (src/validators/agents.ts)

**Total:** ~6 ghost rules

| Line | Type | Severity | Message | Proposed Rule ID | Difficulty |
|------|------|----------|---------|------------------|------------|
| 41 | Warning | warn | No agent directories found | `agent-no-directories-found` | Easy |
| 70 | Error | error | AGENT.md not found | `agent-missing-agent-md` | Easy |
| 115 | Error | error | Name does not match directory | `agent-name-mismatch` | Easy |
| 164 | Error | error | Frontmatter validation error | Varies | N/A |
| 208 | Warning | warn | Body content very short | `agent-body-too-short` | Easy |
| 217 | Warning | warn | Missing system prompt section | `agent-missing-system-prompt` | Easy |

**Notes:**
- Similar pattern to skills validator
- Frontmatter errors come from utility, already have ruleIds
- Body content checks duplicate skills pattern
- All straightforward conversions

---

### Output Styles Validator (src/validators/output-styles.ts)

**Total:** ~6 ghost rules

| Line | Type | Severity | Message | Proposed Rule ID | Difficulty |
|------|------|----------|---------|------------------|------------|
| 42 | Warning | warn | No output style directories | `output-style-no-directories-found` | Easy |
| 66 | Error | error | OUTPUT-STYLE.md not found | `output-style-missing-md` | Easy |
| 111 | Error | error | Name does not match directory | `output-style-name-mismatch` | Easy |
| 131 | Warning | warn | Body content very short | `output-style-body-too-short` | Easy |
| 140 | Warning | warn | Missing Examples section | `output-style-missing-examples` | Easy |
| 149 | Warning | warn | Missing Guidelines section | `output-style-missing-guidelines` | Easy |

**Notes:**
- Very similar to agents/skills pattern
- All straightforward conversions
- Examples already has a rule, verify if ghost is duplicate

---

### Plugin Validator (src/validators/plugin.ts)

**Total:** ~4 ghost rules

| Line | Type | Severity | Message | Proposed Rule ID | Difficulty |
|------|------|----------|---------|------------------|------------|
| 45 | Warning | warn | No plugin.json files found | `plugin-no-files-found` | Easy |
| 67 | Warning | warn | Commands field deprecated | `commands-in-plugin-deprecated` | Easy |
| Various | Error | error | Schema validation errors | Various | N/A |
| Various | Error | error | Dependency validation errors | Various | N/A |

**Notes:**
- Commands deprecated already has rule
- Schema errors come from Zod, already have ruleIds
- Most validations already use rules
- Few actual ghosts

---

### Hooks Validator (src/validators/hooks.ts)

**Total:** ~3 ghost rules

| Line | Type | Severity | Message | Proposed Rule ID | Difficulty |
|------|------|----------|---------|------------------|------------|
| 34 | Warning | warn | No hooks.json files found | `hooks-no-files-found` | Easy |
| Various | Error | error | Schema validation errors | Various | N/A |
| Various | Warning | warn | Unknown tool/event warnings | Various | Uses base methods |

**Notes:**
- Most validations already use rules or base methods
- Schema errors have ruleIds
- Very few actual ghosts

---

### Settings Validator (src/validators/settings.ts)

**Total:** ~3 ghost rules

| Line | Type | Severity | Message | Proposed Rule ID | Difficulty |
|------|------|----------|---------|------------------|------------|
| 39 | Warning | warn | No settings.json files found | `settings-no-files-found` | Easy |
| Various | Error | error | Schema validation errors | Various | N/A |
| Various | Warning | warn | Tool/permission warnings | Various | Uses base methods |

**Notes:**
- Most validations already use rules or base methods
- Schema errors have ruleIds
- Very few actual ghosts

---

### Commands Validator (src/validators/commands.ts)

**Total:** ~2 ghost rules (already have rules, just not using them)

| Line | Type | Severity | Message | Proposed Rule ID | Difficulty |
|------|------|----------|---------|------------------|------------|
| Various | Warning | warn | Commands directory deprecated | `commands-deprecated-directory` | Easy |
| Various | Info | info | Migration suggestion | `commands-migrate-to-skills` | Easy |

**Notes:**
- Already have rule files for these
- Just need to use executeRule pattern

---

### LSP Validator (src/validators/lsp.ts)

**Total:** ~2 ghost rules

| Line | Type | Severity | Message | Proposed Rule ID | Difficulty |
|------|------|----------|---------|------------------|------------|
| Various | Warning | warn | No lsp.json files found | `lsp-no-files-found` | Easy |
| Various | Error | error | Schema validation errors | Various | N/A |

**Notes:**
- Minimal ghosts, most use schema validation with ruleIds

---

### Base Validator (src/validators/base.ts)

**Total:** ~6 utility methods that report without ruleIds

| Line | Method | Type | Severity | Message Pattern | Notes |
|------|--------|------|----------|-----------------|-------|
| 563 | mergeSchemaResult | Warning | varies | Schema validation warnings | Uses ruleId when available |
| 655 | mergeSchemaResult | Error | varies | Schema validation errors | Uses ruleId when available |
| 684 | validateToolName | Warning | warn | Unknown tool: ${toolName} | Could add ruleId parameter |
| 698 | validateEventName | Warning | warn | Unknown event: ${eventName} | Could add ruleId parameter |
| 783 | executeRule | Error | error | Rule execution failed | Internal error, not user-facing |

**Notes:**
- Some base methods intentionally don't use ruleIds
- These are called by multiple validators
- Could add optional ruleId parameter for each validator to pass their own ID

---

## Summary Statistics

| Validator | Ghost Rules | Easy | Medium | Hard | Notes |
|-----------|-------------|------|--------|------|-------|
| MCP | 13 | 10 | 3 | 0 | Includes utility function |
| Claude.md | 8 | 6 | 2 | 0 | Some already have rules |
| Skills | 12 | 9 | 3 | 0 | Many already converted |
| Agents | 6 | 5 | 1 | 0 | Similar to skills |
| Output Styles | 6 | 6 | 0 | 0 | Straightforward |
| Plugin | 4 | 4 | 0 | 0 | Mostly done |
| Hooks | 3 | 3 | 0 | 0 | Mostly done |
| Settings | 3 | 3 | 0 | 0 | Mostly done |
| Commands | 2 | 2 | 0 | 0 | Rules exist |
| LSP | 2 | 2 | 0 | 0 | Minimal work |
| Base | 6 | 4 | 2 | 0 | Shared utilities |
| **TOTAL** | **65** | **54** | **11** | **0** | |

## Conversion Priority

### High Priority (User-Facing, Frequent)
1. MCP transport validations (10 rules)
2. Claude.md import validations (5 rules)
3. Skills/Agents body content (6 rules)
4. Environment variable validations (3 rules)

### Medium Priority (Less Frequent)
1. "No files found" warnings (8 rules)
2. Name mismatch errors (4 rules)
3. Output styles validations (6 rules)

### Low Priority (Edge Cases)
1. Base validator utilities (6 rules)
2. Already-have-rules cases (4 rules)

## Edge Cases and Exceptions

### Case 1: "No Files Found" Warnings

**Issue:** Should warnings like "No agent directories found" be configurable rules?

**Options:**
1. Create rules for each (8 new rules)
2. Add single `no-files-found` rule with category parameter
3. Keep as non-configurable warnings

**Recommendation:** Option 1 - Create individual rules for consistency

### Case 2: Schema Validation Errors

**Issue:** Schema errors from Zod already have ruleIds from schema, but go through reportError

**Status:** These are NOT ghost rules - they already pass ruleIds

**Action:** No change needed

### Case 3: Base Validator Utility Methods

**Issue:** Methods like `validateToolName()` are called by multiple validators

**Options:**
1. Add optional ruleId parameter, each validator passes their own
2. Create generic rules (e.g., `unknown-tool`)
3. Keep as non-configurable

**Recommendation:** Option 1 - Add ruleId parameter, validators pass category-specific ID

### Case 4: Rules That Already Exist

**Issue:** Some ghost rules have corresponding rule files but validator doesn't use executeRule

**Examples:**
- `commands-deprecated-directory` rule exists but validator reports directly
- `claude-md-import-in-code-block` rule exists but validator also reports

**Action:** Remove duplicate reporting, use executeRule only

## Migration Decision Tree

```
Does validation have a ruleId?
├─ YES → Not a ghost rule, skip
└─ NO → Ghost rule
    │
    ├─ Is it schema validation from Zod?
    │  └─ YES → Already has ruleId from schema, not a ghost
    │
    ├─ Is there an existing rule file for this?
    │  ├─ YES → Remove ghost, use executeRule
    │  └─ NO → Continue
    │
    ├─ Is it a "no files found" warning?
    │  └─ YES → Create validator-specific rule (e.g., skill-no-files-found)
    │
    ├─ Is it from a utility function?
    │  └─ YES → Convert utility to rule, remove utility
    │
    ├─ Is it a one-off validation?
    │  └─ YES → Create new rule file
    │
    └─ Complex case?
       └─ Document in edge cases, get approval
```

## Next Steps

1. [ ] Review this audit for accuracy
2. [ ] Get approval on edge case decisions
3. [ ] Prioritize conversion order
4. [ ] Begin Phase 2.2: Convert ghost rules to real rules
