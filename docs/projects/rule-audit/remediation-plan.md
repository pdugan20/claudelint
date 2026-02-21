# Rule Audit Remediation Plan

**Created:** 2026-02-21
**Source:** [Rule Audit Tracker](./tracker.md)
**Scope:** Remediation for 12 findings across 117 rules in 10 categories.

---

## Priority

Findings are grouped by implementation complexity, not by finding number.

| Priority | Findings | Description |
|----------|----------|-------------|
| Quick fixes | F3, F8, F11, F12 | Single-file edits with no cascading impact |
| Moderate | F2, F5 | Multi-file changes within one category |
| Significant | F1, F9, F10 | Rule merge/rename/rewrite requiring test, preset, docs, and integration updates |
| Documentation | F4, F6, F7 | No code changes needed; docs and design clarifications only |

---

## Quick Fixes

### F3: Remove trailing period from `lsp-language-id-empty` message

**Issue:** Message ends with a period (`cannot be empty.`) while all other LSP rules omit trailing periods.

**File:** `src/rules/lsp/lsp-language-id-empty.ts:107`

**Fix:** Change message from:

```text
Language ID for extension "${extension}" in server "${serverName}" cannot be empty.
```

to:

```text
Language ID for extension "${extension}" in server "${serverName}" cannot be empty
```

**Test impact:** Update expected message string in `tests/rules/lsp-language-id-empty.test.ts`.

---

### F8: Remove doubled word in `agent-body-too-short` docs

**Issue:** Line 48 of docs string reads "the markdown body of an agent file file" -- "file" is doubled.

**File:** `src/rules/agents/agent-body-too-short.ts:48`

**Fix:** Change:

```text
'This rule checks that the markdown body of an agent file file '
```

to:

```text
'This rule checks that the markdown body of an agent file '
```

**Test impact:** None (docs string only). Regenerate rule docs with `npm run docs:generate`.

---

### F11: Fix incorrect example in `skill-allowed-tools-not-used`

**Issue:** The "incorrect" example lists `Bash`, `Read`, `WebFetch` in `allowed-tools` with `Bash` and `Read` referenced in the body. The rule only fires when **none** of the tools are referenced, so this example would actually pass.

**File:** `src/rules/skills/skill-allowed-tools-not-used.ts:76-79`

**Fix:** Replace the incorrect example with one where zero allowed-tools are mentioned in the body:

```typescript
incorrect: [
  {
    description: 'Tools listed in allowed-tools but none referenced in body',
    code: '---\nname: build\ndescription: Builds the project\nallowed-tools:\n  - Bash\n  - Read\n  - WebFetch\n---\n\n## Usage\n\nRun the build pipeline and check the output for errors.',
  },
],
```

The body text describes the intent without naming any tool (`Bash`, `Read`, or `WebFetch`), so all three are unreferenced and the rule correctly fires.

**Test impact:** None (example metadata only). Regenerate rule docs with `npm run docs:generate`.

---

### F12: Add `ToolSearch` (and MCP resource tools) to `ToolNames`

**Issue:** `ToolSearch` is a confirmed built-in Claude Code tool missing from the `ToolNames` enum. `ListMcpResourcesTool` and `ReadMcpResourceTool` are also present in the current Claude Code environment. The `skill-mcp-tool-qualified-name` rule uses `VALID_TOOLS` to distinguish built-in tools from MCP tools -- any tool not in the set is flagged as "Unrecognized tool", producing false positives.

**File:** `src/schemas/constants.ts:11-33`

**Fix:** Add the missing tools to the `ToolNames` enum:

```typescript
export const ToolNames = z.enum([
  'Bash',
  'Read',
  'Write',
  'Edit',
  'Glob',
  'Grep',
  'Task',
  'WebFetch',
  'WebSearch',
  'LSP',
  'AskUserQuestion',
  'EnterPlanMode',
  'ExitPlanMode',
  'Skill',
  'TaskCreate',
  'TaskUpdate',
  'TaskGet',
  'TaskList',
  'TaskOutput',
  'TaskStop',
  'NotebookEdit',
  'ToolSearch',
  'ListMcpResourcesTool',
  'ReadMcpResourceTool',
]);
```

**Verification note:** `ToolSearch` is confirmed in the current Claude Code environment. `ListMcpResourcesTool` and `ReadMcpResourceTool` appear in this session's tool list. If either of the MCP resource tools turns out to be dynamically injected (only present when MCP servers are configured), they should still be in the list since skills may legitimately reference them.

**Secondary fix:** Update `scripts/verify/tool-names.ts` to add these three tools to the `SUPPLEMENTAL_TOOLS` array so the verification script doesn't rely solely on the CLI query:

```typescript
const SUPPLEMENTAL_TOOLS = ['ToolSearch', 'ListMcpResourcesTool', 'ReadMcpResourceTool'];
```

**Test impact:** Update any test in `tests/rules/skill-mcp-tool-qualified-name.test.ts` or `tests/schemas/constants.test.ts` that asserts the count or contents of `VALID_TOOLS`.

---

## Moderate Changes

### F2: Rename `lsp-command-not-in-path` to `lsp-command-bare-name`

**Issue:** The rule name implies it checks whether the command binary exists in PATH, but it only checks if the command string starts with `/` or `./`. The message `Command "X" not found` is also misleading -- the command may be perfectly findable via PATH.

**Solution:** Rename the rule and update its message to accurately describe what it checks.

**New rule ID:** `lsp-command-bare-name`

**New message:** `Command "${commandName}" in server "${serverName}" uses a bare name instead of an explicit path`

**Files to update:**

1. **Rename source file:**
   - `src/rules/lsp/lsp-command-not-in-path.ts` -> `src/rules/lsp/lsp-command-bare-name.ts`
   - Update `meta.id` to `lsp-command-bare-name`
   - Update `meta.name` to `LSP Command Bare Name`
   - Update `meta.description` to `LSP server commands should use explicit paths instead of bare names`
   - Update `meta.docUrl`
   - Update message string

2. **Rename test file:**
   - `tests/rules/lsp-command-not-in-path.test.ts` -> `tests/rules/lsp-command-bare-name.test.ts`
   - Update all rule ID references and expected messages

3. **Presets (3 files):**
   - `presets/all.json` -- rename key
   - `presets/recommended.json` -- rename key (currently set to `"off"`)
   - `presets/strict.json` -- rename key

4. **Integration tests:**
   - `tests/integration/fixture-projects.test.ts` -- update any expected rule IDs

5. **Regenerate auto-generated files:**
   - `npm run generate:types` (updates `src/rules/index.ts` and `src/rules/rule-ids.ts`)
   - `npm run docs:generate` (creates new docs page, old page auto-removed)

6. **Deprecation handling:** Add `lsp-command-not-in-path` as a deprecated alias that maps to `lsp-command-bare-name` so existing user configs don't break silently. Alternatively, document the rename in CHANGELOG and let it be a breaking change in the next minor release.

**Preset question:** This rule is already set to `"off"` in the recommended preset, confirming it's the weakest LSP rule. Consider whether it should remain in `recommended` at all or be `strict`-only.

---

### F5: Add empty-string guard to MCP `*-invalid-url` rules

**Issue:** For `"url": ""`, both the `*-empty-url` and `*-invalid-url` rules fire for the same transport. The `*-invalid-url` rules skip env-var URLs but don't skip empty strings, so `new URL("")` throws and produces a second error on top of the "cannot be empty" message.

**Files (3):**

- `src/rules/mcp/mcp-sse-invalid-url.ts`
- `src/rules/mcp/mcp-http-invalid-url.ts`
- `src/rules/mcp/mcp-websocket-invalid-url.ts`

**Fix:** Add an early continue after the env-var check in each file:

```typescript
// Skip validation for env var placeholders (resolved at runtime)
if (containsEnvVar(url)) {
  continue;
}

// Skip empty/whitespace-only URLs (handled by *-empty-url rules)
if (url.trim().length === 0) {
  continue;
}
```

This is identical in all three files. The guard goes immediately after the `containsEnvVar` check and before the `new URL()` try-catch.

**Test impact:** Add a test case to each rule's test file confirming that an empty URL (`""`) does not produce an error (since `*-empty-url` handles it).

---

## Significant Changes

### F1: Merge `commands-migrate-to-skills` into `commands-deprecated-directory`

**Issue:** Both rules check the exact same condition (`directoryExists('.claude/commands')`) and both fire as `warn`. Users get two warnings for one problem.

**Solution:** Merge the migration guidance from `commands-migrate-to-skills` into the surviving rule's documentation fields, then delete the redundant rule.

**Surviving rule:** `commands-deprecated-directory` (better name -- describes the problem, not the fix).

**Steps:**

1. **Merge docs content into `commands-deprecated-directory`:**
   - Fold the step-by-step migration instructions from `commands-migrate-to-skills.meta.docs.howToFix` into the surviving rule's `howToFix`:

     ```text
     1. Create a skill directory: `.claude/skills/<skill-name>/`
     2. Move command scripts to `<skill-name>/<skill-name>.sh`
     3. Add a `SKILL.md` with YAML frontmatter (name, description) and documentation
     4. Update `plugin.json` to reference skills instead of commands
     5. Remove the old command file from `.claude/commands/`
     ```

   - Add the "Legacy command file" incorrect example from `commands-migrate-to-skills` as a second incorrect example in the surviving rule
   - Remove `relatedRules: ['commands-migrate-to-skills']`

2. **Delete `commands-migrate-to-skills`:**
   - Delete `src/rules/commands/commands-migrate-to-skills.ts`
   - Delete `tests/rules/commands-migrate-to-skills.test.ts`

3. **Update presets (3 files):**
   - Remove `commands-migrate-to-skills` key from `presets/all.json`, `presets/recommended.json`, `presets/strict.json`

4. **Update integration tests:**
   - `tests/integration/fixture-projects.test.ts` -- remove expected `commands-migrate-to-skills` violation from fixture results

5. **Regenerate:**
   - `npm run generate:types`
   - `npm run docs:generate`

6. **Deprecation:** Since the merged rule covers the same condition, no alias is needed. Any user config that disables `commands-migrate-to-skills` was already also getting `commands-deprecated-directory`. Document the merge in CHANGELOG as a breaking change.

---

### F9: Rename `plugin-invalid-manifest` to `plugin-invalid-marketplace-manifest`

**Issue:** The rule name suggests it validates `plugin.json`, but it actually validates `marketplace.json`. The rule checks marketplace schema fields (owner, plugins array, sources) -- none of which apply to `plugin.json`.

**New rule ID:** `plugin-invalid-marketplace-manifest`

**Files to update:**

1. **Rename source file:**
   - `src/rules/plugin/plugin-invalid-manifest.ts` -> `src/rules/plugin/plugin-invalid-marketplace-manifest.ts`
   - Update `meta.id`, `meta.name`, `meta.description`, `meta.docUrl`

2. **Rename test file:**
   - `tests/rules/plugin-invalid-manifest.test.ts` -> `tests/rules/plugin-invalid-marketplace-manifest.test.ts`
   - Update all rule ID references

3. **Presets (3 files):** Rename key in all presets.

4. **Validator references:**
   - `src/validators/plugin-validator.ts` -- update any hardcoded rule ID references
   - Check if the plugin validator uses the old ID for dedup or thin-wrapper mapping

5. **Integration tests:**
   - `tests/integration/fixture-projects.test.ts` -- update expected IDs

6. **Cross-references:**
   - `src/rules/plugin/plugin-marketplace-files-not-found.ts` -- update `relatedRules` array

7. **Regenerate:**
   - `npm run generate:types`
   - `npm run docs:generate`

8. **Deprecation handling:** Add `plugin-invalid-manifest` as a deprecated alias mapping to `plugin-invalid-marketplace-manifest` to avoid breaking existing user configs. Remove the alias in the next major release.

---

### F10: Fix `plugin-hook-missing-plugin-root` to match documented spec, then deprecate until upstream stabilizes

**Issue:** Three problems:

1. **Examples show inline hook objects in plugin.json**, but Claude Code rejects inline hook objects at runtime
2. **Validation logic checks file paths for `${CLAUDE_PLUGIN_ROOT}`**, but file paths in plugin.json are resolved relative to the plugin root by the plugin system -- `${CLAUDE_PLUGIN_ROOT}` is needed in hook *commands* inside hooks.json, not in plugin.json file references
3. **The entire plugin.json `hooks` field is broken upstream** -- both string paths (not loaded; anthropics/claude-code#16288) and inline objects (rejected at runtime) fail. The only working path is auto-discovery from `hooks/hooks.json` at the plugin root (anthropics/claude-code#27307)

**Issue:** [#40](https://github.com/pdugan20/claudelint/issues/40)

**Solution:** Fix the rule to correctly validate against the documented Claude Code spec, then deprecate it until the upstream bugs are resolved. This way the rule is ready to re-enable the moment the Anthropic team fixes #16288 and #27307.

**The documented spec says `hooks` accepts three formats:**

- `string` -- path to a hooks.json file (e.g., `"./config/hooks.json"`)
- `string[]` -- array of paths (e.g., `["./config/hooks.json", "./extra-hooks.json"]`)
- `object` -- inline hook configuration (same structure as hooks.json)

**Steps:**

1. **Rewrite validation logic to handle all three formats:**

   - **String/string[] paths:** Check that paths match the schema pattern `^\.\/.*\.json$`. Do NOT check for `${CLAUDE_PLUGIN_ROOT}` in file paths -- file paths are resolved relative to the plugin root by the plugin system.
   - **Inline objects:** Walk the hook structure, find hooks of `type: "command"`, and check that commands referencing script paths use `${CLAUDE_PLUGIN_ROOT}`. This is where the variable is actually needed.

   ```typescript
   validate: (context: RuleContext) => {
     const { filePath, fileContent } = context;
     if (!filePath.endsWith('plugin.json')) return;

     const plugin = safeParseJSON(fileContent);
     if (!plugin || !isObject(plugin) || !hasProperty(plugin, 'hooks')) return;

     const hooks = plugin.hooks;

     // String or string[] paths: no ${CLAUDE_PLUGIN_ROOT} check needed
     // (file paths are resolved relative to plugin root by the system)

     // Inline object: check command-type hooks for missing ${CLAUDE_PLUGIN_ROOT}
     if (isObject(hooks) && !isString(hooks) && !Array.isArray(hooks)) {
       // Walk hook events -> matchers -> hooks -> check commands
       for (const [event, matchers] of Object.entries(hooks)) {
         if (!Array.isArray(matchers)) continue;
         for (const matcher of matchers) {
           if (!isObject(matcher) || !hasProperty(matcher, 'hooks')) continue;
           if (!Array.isArray(matcher.hooks)) continue;
           for (const hook of matcher.hooks) {
             if (!isObject(hook)) continue;
             if (hook.type === 'command' && isString(hook.command)) {
               if (isScriptPathMissingRoot(hook.command)) {
                 context.report({
                   message: `Hook command missing \${CLAUDE_PLUGIN_ROOT}: ${hook.command}`,
                 });
               }
             }
           }
         }
       }
     }
   };
   ```

2. **Fix examples to show all three formats:**

   **Incorrect (inline object with bare relative path in command):**

   ```json
   {
     "name": "my-plugin",
     "hooks": {
       "PostToolUse": [{
         "matcher": "Write",
         "hooks": [{
           "type": "command",
           "command": "./scripts/post-tool.sh"
         }]
       }]
     }
   }
   ```

   **Correct (inline object with `${CLAUDE_PLUGIN_ROOT}`):**

   ```json
   {
     "name": "my-plugin",
     "hooks": {
       "PostToolUse": [{
         "matcher": "Write",
         "hooks": [{
           "type": "command",
           "command": "${CLAUDE_PLUGIN_ROOT}/scripts/post-tool.sh"
         }]
       }]
     }
   }
   ```

   **Correct (string path -- no `${CLAUDE_PLUGIN_ROOT}` needed):**

   ```json
   {
     "name": "my-plugin",
     "hooks": "./config/hooks.json"
   }
   ```

3. **Deprecate until upstream is fixed:**
   - Set `meta.deprecated: true`
   - Add deprecation note to `meta.docs.details` referencing anthropics/claude-code#16288 and #27307
   - Set to `"off"` in `presets/recommended.json` and `presets/strict.json`

4. **Update our schema to accept inline objects:**
   - Update `PluginManifestSchema` in `src/validators/schemas.ts` to add object to the `hooks` union:

     ```typescript
     hooks: z.union([z.string(), z.array(z.string()), z.record(z.string(), z.unknown())]).optional(),
     ```

   - Keep the comment noting the upstream bug, but align the schema with the documented spec

5. **Update docs:**
   - Update `website/api/schemas/plugin.md` hooks row to list `string | string[] | object` with a note that inline objects and string paths are currently broken upstream
   - Regenerate rule docs

6. **Rewrite tests:**
   - Test all three input formats (string path, string array, inline object)
   - Test that string/array paths do NOT trigger the rule
   - Test that inline objects with bare relative paths in commands DO trigger the rule
   - Test that inline objects with `${CLAUDE_PLUGIN_ROOT}` in commands pass

7. **Regenerate:**
   - `npm run generate:types`
   - `npm run docs:generate`

**Re-enable (post-upstream-fix):** Once anthropics/claude-code#16288 and #27307 are resolved, set `meta.deprecated: false` and re-enable in presets. The rule is already correct -- it just needs to be turned back on.

---

## Documentation Only

### F4: Document thin-wrapper schema-delegation behavior

**Issue:** Five rules have empty `validate` functions delegating to Zod schemas (the "thin wrapper pattern"). The original question: if a user disables one of these rules, does the schema validation also get suppressed?

**Answer (from research):** Yes, disabling thin-wrapper rules correctly suppresses their schema-level errors. The mechanism:

1. Schema validation runs in `file-validator.ts`
2. `mergeSchemaValidationResult()` checks each schema error for a matching thin-wrapper rule ID -- if found, it skips the schema error (dedup)
3. The thin wrapper then reports via `context.report()` with the rule's ID
4. `getResult()` checks the config severity for each reported rule -- `"off"` means the error is suppressed

This means the system works as designed. No code changes needed.

**Affected rules:**

- `output-style-name`
- `output-style-description`
- `output-style-examples`
- `agent-events`
- `agent-hooks-invalid-schema`

**Action:** Add a brief note to `src/CLAUDE.md` under "Conventions" explaining the thin-wrapper pattern and its disableability:

```text
- Thin-wrapper rules (empty validate, schema-delegated) ARE disableable via config.
  Schema errors with matching rule IDs are deduplicated in mergeSchemaValidationResult(),
  then the thin wrapper reports with the ruleId, and getResult() respects severity="off".
```

---

### F6: Extract shared MCP URL validation helper (future)

**Issue:** The 6 MCP transport URL rules (`*-empty-url` and `*-invalid-url` for SSE, HTTP, WebSocket) are near-identical copies. Separate rule IDs allow per-transport disabling, so the design is intentional. But if validation logic changes, 6 files must change.

**Action now:** No code changes. This is a design observation, not a bug.

**Future refactor (when URL validation next needs updating):** Extract a shared helper:

```typescript
// src/utils/validators/mcp-url.ts
export function validateMcpUrl(
  url: string,
  transportType: string,
  context: RuleContext
): void {
  if (containsEnvVar(url)) return;
  if (url.trim().length === 0) return; // F5 fix baked in
  try { new URL(url); } catch (error) {
    context.report({ message: `Invalid URL in ${transportType} transport: ${formatError(error)}` });
  }
}
```

Each transport rule would become a thin wrapper calling the shared helper with its transport type string. Rule IDs and per-transport disabling remain unchanged.

---

### F7: Reconcile file-discovery and monorepo docs pages

**Issue:** Two docs pages maintain independent file discovery tables that disagree:

| Discrepancy | `file-discovery.md` | `monorepos.md` |
|-------------|---------------------|----------------|
| Hooks path | `hooks/hooks.json` (plugin) | `.claude/hooks/hooks.json` |
| Agent filename | `.claude/agents/<name>.md` | `.claude/agents/*/AGENT.md` |
| Skills paths | `.claude/skills/` and `skills/` | `**/.claude/skills/` only |

**Correct values** (verified against `src/utils/filesystem/patterns.ts`):

- **Hooks:** `hooks/hooks.json` (plugin auto-discovery path). The `.claude/hooks/` path doesn't exist in the discovery patterns.
- **Agents:** `.claude/agents/<name>.md` (single file per agent, not `AGENT.md` inside a subdirectory)
- **Skills:** Both `.claude/skills/` and `skills/` are valid (one for project scope, one for plugin scope)

**Action:**

1. Fix `monorepos.md` table:
   - Hooks: `hooks/hooks.json` (or note this is plugin-only)
   - Agents: `.claude/agents/<name>.md`
   - Skills: add `skills/*/SKILL.md` as plugin-scope path

2. Make `file-discovery.md` the single source of truth for the discovery table. In `monorepos.md`, replace the duplicate table with a link:

   ```markdown
   For the complete file discovery table, see [File Discovery](/guide/file-discovery#file-type-reference).
   ```

3. Make `monorepos.md` the authority on config inheritance and workspaces. In `file-discovery.md`, replace the mini monorepo section with a link:

   ```markdown
   For workspace detection and config inheritance, see [Monorepo Support](/integrations/monorepos).
   ```

---

## Implementation Order

Recommended sequence for implementation:

1. **Quick fixes first** (F3, F8, F11, F12) -- independent, no risk of conflicts
2. **F5** (MCP empty-string guard) -- small, contained, independent
3. **F1** (commands merge) -- rule deletion, preset updates
4. **F2** (LSP rename) -- file rename, preset updates
5. **F9** (plugin rename) -- file rename, preset updates, cross-references
6. **F10** (plugin hook rewrite + deprecate) -- full rewrite to match documented spec, then deprecate until upstream fixes land
7. **Documentation** (F4, F6, F7) -- can be done in parallel with any of the above

Each numbered step above is a separate commit. F1, F2, F9 are each breaking changes and should be clearly documented in the CHANGELOG.

---

## Verification Checklist

After all changes, run:

```bash
npm run generate:types       # Regenerate rule index and IDs
npm run docs:generate        # Regenerate rule documentation
npm test                     # Full test suite
npm run lint                 # All linters
npm run check:self           # Dogfood validation
npm run check:rule-coverage  # Verify docs/tests exist for all rules
npm run check:message-length # Verify message constraints
npm run check:message-content # Verify message content rules
```
