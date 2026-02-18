# Plugin Spec Alignment Tracker

**Last Updated:** 2026-02-17

---

## Phase 0: Commit Pending Install Syntax Fixes

10 files already updated to fix plugin install syntax. Commit before any further changes.

- [ ] 0.1: Commit the 10-file install syntax fix (unstaged changes)
- [ ] 0.2: Verify build passes: `npm run build`
- [ ] 0.3: Verify tests pass: `npm test`

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

- [ ] 1.1: Rewrite `MarketplaceMetadataSchema` in `src/validators/schemas.ts`

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

- [ ] 1.2: Export any sub-schemas needed by rules (e.g., `MarketplacePluginEntrySchema`)

---

## Phase 2: Create Reference JSON Schema

Add `schemas/marketplace.schema.json` so marketplace validation has the same dual-schema coverage as our other 8 schemas.

- [ ] 2.1: Create `schemas/marketplace.schema.json` derived from the Zod schema
- [ ] 2.2: Add to schema drift detection (`npm run check:schema-sync`)
- [ ] 2.3: Add schema test in `tests/schemas/`

---

## Phase 3: Fix plugin-invalid-manifest Rule

Update the rule to validate against the corrected schema.

- [ ] 3.1: Update rule to validate marketplace.json files directly (not searched relative to plugin.json)
- [ ] 3.2: Add validation: required fields `name`, `owner`, `plugins`
- [ ] 3.3: Add validation: each plugin entry has `name` and `source`
- [ ] 3.4: Add validation: plugin entry `version` matches its `plugin.json` version (when both exist and source is a relative path)
- [ ] 3.5: Update rule metadata (`meta.docs`) to reflect real marketplace.json structure
- [ ] 3.6: Rewrite tests in `tests/rules/plugin/plugin-invalid-manifest.test.ts`

---

## Phase 4: Fix plugin-marketplace-files-not-found Rule

Update the rule to check real marketplace.json references.

- [ ] 4.1: Remove checks for non-existent fields (`icon`, `screenshots`, `readme`, `changelog`)
- [ ] 4.2: Add check: relative `source` paths in plugin entries resolve to existing directories
- [ ] 4.3: Add check: relative source directories contain `.claude-plugin/plugin.json`
- [ ] 4.4: Update rule metadata (`meta.docs`) to reflect real behavior
- [ ] 4.5: Rewrite tests in `tests/rules/plugin/plugin-marketplace-files-not-found.test.ts`

---

## Phase 5: Regenerate and Verify

Run generators, verify drift detection, dogfood.

- [ ] 5.1: Run `npm run generate:types` (updates rule index if rule signatures changed)
- [ ] 5.2: Run `npm run generate:json-schemas` (if marketplace schema added to generator)
- [ ] 5.3: Run `npm run check:schema-sync` (verify no drift)
- [ ] 5.4: Run `npm test` (all tests pass)
- [ ] 5.5: Run `npm run check:self` (dogfood: 0 errors/0 warnings on self)
- [ ] 5.6: Run `npm run docs:generate` (regenerate rule docs for updated rule metadata)

---

## Phase 6: Documentation Updates

Update any docs that reference the old marketplace schema or install methods.

- [ ] 6.1: Update `website/integrations/claude-code-plugin.md` if marketplace install path changes
- [ ] 6.2: Verify `website/guide/cli-reference.md` install-plugin docs are accurate
- [ ] 6.3: Update `docs/projects/roadmap.md` to reference this project
- [ ] 6.4: Update `docs/projects/status.md` to add this project

---

## Phase 7: Commit and Verify

- [ ] 7.1: Commit all changes
- [ ] 7.2: Verify CI passes
- [ ] 7.3: Run `npm run validate` (full validation suite)

---

## Out of Scope (Tracked Elsewhere)

These items are related but not part of this project:

- Creating a marketplace repo for claudelint (post-release task)
- Submitting to `claude-plugins-official` (post-release task)
- Interactive plugin testing with `claude --plugin-dir .` (tracked in roadmap.md)
- Stable 0.2.0 release (tracked in roadmap.md)
