# Schema Accuracy Fixes

**Status:** In Progress
**Depends on:** Anthropic comparison audit (complete)
**Blocks:** Milestone 4a (Testing Fixture Infrastructure)
**Plan:** `.claude/plans/piped-imagining-axolotl.md`

## Task Tracker

### Phase 1: Trivial Fixes (Issues 4, 6) -- COMPLETE

- [x] Add `TeammateIdle`, `TaskCompleted` to HookEvents enum
- [x] Add both events to SettingsHooksSchema
- [x] Update hooks-config.schema.json
- [x] Update constants tests
- [x] Update settings schema tests
- [x] Fix SandboxSchema: remove `allowedCommands`, add real fields
- [x] Update sandbox tests
- [x] Commit, full test suite passes (1207 tests, 165 suites)

### Phase 2: Easy Fixes (Issues 3, 7) -- COMPLETE

- [x] Fix AttributionSchema: `{ commit, pr }` replacing `{ enabled, name, email }`
- [x] Update attribution tests
- [x] Add missing settings fields to SettingsSchema (14 new fields)
- [x] Update settings field tests
- [x] Commit, full test suite passes (1207 tests, 165 suites)

### Phase 3: Output Styles Rename (Issue 5) -- COMPLETE

- [x] Change glob patterns: `output_styles` -> `output-styles`, `OUTPUT_STYLE.md` -> `*.md`
- [x] Update output-styles validator (renamed findOutputStyleDirectories to findOutputStyleFiles)
- [x] Update 3 output-styles rules
- [x] Update plugin-missing-file rule if affected (not affected)
- [x] Update all output-styles tests
- [x] Update path-helpers tests
- [x] Update rule docs
- [x] Rename fixture directories and files
- [x] Commit, full test suite passes (1207 tests, 165 suites)

### Phase 4: MCP Flat Format Support (Issue 2) -- COMPLETE

- [x] Update MCPConfigSchema to accept both formats (z.preprocess)
- [x] Add normalization layer in MCP validator
- [x] Update mcp-config.schema.json (schema sync passes, no manual changes needed)
- [x] Add flat format schema tests (4 new tests)
- [x] Add flat format integration test (1 new test)
- [x] Commit, full test suite passes (1212 tests, 165 suites)

### Phase 5: Hooks Schema Rewrite (Issue 1)

- [ ] 5a: Rewrite HooksConfigSchema, delete HookSchema/MatcherSchema
- [ ] 5a: Add statusMessage, once, model, agent type to hook handler schema
- [ ] 5a: Update agent/skill frontmatter schemas
- [ ] 5b: Rewrite 3 hooks rules for new format
- [ ] 5c: Rewrite hooks helpers
- [ ] 5d: Rewrite hooks validator
- [ ] 5e: Rewrite hooks-config.schema.json
- [ ] 5f: Rewrite all hooks tests (schema, validator, rule, agent, skill)
- [ ] 5g: Update both fixture hooks.json files
- [ ] 5h: Verify integration tests
- [ ] Commit, full test suite passes

### Phase 6: Reference Doc + Cleanup

- [ ] Create `docs/references/official-claude-code-specs.md`
- [ ] Update `docs/projects/roadmap.md`
- [ ] Delete `docs/projects/anthropic-comparison-audit.md`
- [ ] Commit

### Phase 7: Final Verification

- [ ] `npm test` -- all pass
- [ ] `npm run build` -- compiles clean
- [ ] valid-complete fixture: exit 0, zero errors/warnings
- [ ] invalid-all-categories fixture: exit 1, errors from all 10 categories
- [ ] Integration tests: 14/14 pass
- [ ] Coverage above 80%
- [ ] Archive this project folder
