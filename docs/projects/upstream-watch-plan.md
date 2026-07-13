# Upstream Watch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Detect new and changed Claude Code documentation surface automatically, make hallucinated schema fields mechanically impossible, and ship the plugin-dependency rules that would have caught the `mintlify-docs` install failure.

**Architecture:** A docs snapshot is committed to the repo. Refreshing it needs the network and runs weekly via cron; conforming claudelint's Zod schemas *to* it is fully offline and runs on every PR. Deterministic extractors turn docs into a `facts.json`, guarded by minimum-fact counts so a reformatted upstream table fails loudly instead of silently yielding nothing.

**Tech Stack:** TypeScript, Zod, Jest, ts-node, GitHub Actions.

## Global Constraints

- Spec: `docs/projects/upstream-watch.md`. Read it before starting.
- **No `ANTHROPIC_API_KEY` or LLM call in CI.** Explicitly deferred; the deterministic layer must stand alone.
- New rules use `since: '0.6.0'` (current `package.json` version is `0.5.0`).
- Rule messages must be **≤ 100 characters**, counting each `${...}` interpolation as 10 (`scripts/check/message-length.ts`).
- No emojis anywhere (`npm run check:emojis`).
- Conventional Commits, enforced by commitlint. No AI attribution in commit messages.
- `src/rules/index.ts` and `src/rules/rule-ids.ts` are auto-generated. Never hand-edit; run `npm run generate:types`.
- A schema change fans out to **four** places: the Zod schema, the manual reference schema in `schemas/`, the generated schema (via `npm run generate:json-schemas`), and the website schema docs in `website/api/schemas/`. Missing any one red-builds `check:schema-sync` or `check:schema-docs-coverage`.

## Phase ordering (important)

Phase 1 must land before Phase 2. The Phase 2 conformance check compares Zod against upstream docs and will **fail on `MessageDisplay` and `marketplace`** the moment it exists. Fixing those first means the gate is introduced green.

---

## Phase 1 — Findings batch

### Task 1: Add the `MessageDisplay` hook event

Upstream documents 30 hook events; `HookEvents` has 29. `MessageDisplay` ("While assistant message text is displayed") is missing.

**Files:**

- Modify: `src/schemas/constants.ts` (the `HookEvents` z.enum, currently lines 53-83)
- Modify: `schemas/hooks-config.schema.json` (event keys under `properties`, near line 22)
- Test: `tests/schemas/constants.test.ts`

**Interfaces:**

- Produces: `HookEvents` z.enum now accepts the string literal `'MessageDisplay'`.

- [ ] **Step 1: Write the failing test**

Append to `tests/schemas/constants.test.ts`, inside the existing `HookEvents` describe block (match the surrounding style):

```typescript
it('accepts the MessageDisplay event', () => {
  expect(HookEvents.safeParse('MessageDisplay').success).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/schemas/constants.test.ts -t MessageDisplay`
Expected: FAIL — `safeParse` returns `success: false` because the literal is not in the enum.

- [ ] **Step 3: Add the event to the Zod enum**

In `src/schemas/constants.ts`, add to the `HookEvents` z.enum array, after `'Notification'`:

```typescript
  'MessageDisplay',
```

- [ ] **Step 4: Add the event to the manual reference schema**

In `schemas/hooks-config.schema.json`, alongside the other event keys (e.g. next to `"PostToolBatch"`):

```json
        "MessageDisplay": { "$ref": "#/$defs/matcherGroupArray" },
```

- [ ] **Step 5: Run the test and the schema sync check**

Run: `npx jest tests/schemas/constants.test.ts -t MessageDisplay`
Expected: PASS

Run: `npm run check:schema-sync`
Expected: PASS (regenerates `schemas/generated/` then compares against `schemas/`).

Run: `npm run check:schema-docs-coverage`
Expected: PASS. **If it fails**, it will name the missing doc location — add `MessageDisplay` to `website/api/schemas/hooks.md` in the same format the other events use, then re-run.

- [ ] **Step 6: Commit**

```bash
git add src/schemas/constants.ts schemas/ website/api/schemas/ tests/schemas/constants.test.ts
git commit -m "fix(schemas): add missing MessageDisplay hook event"
```

---

### Task 2: Add `marketplace` to `PluginDependencySchema`

The docs define three fields on a dependency object (`name`, `version`, `marketplace`). claudelint models only two. `marketplace` is the field that fixed the real bug, and Zod strips unknown keys, so correct manifests validate only by accident.

**Files:**

- Modify: `src/validators/schemas.ts` (`PluginDependencySchema`, currently line 338)
- Modify: `schemas/plugin-manifest.schema.json` (`dependencies` items, near line 246)
- Modify: `website/api/schemas/plugin.md` (the `dependencies` table row, line 38)
- Test: `tests/schemas/plugin-manifest.schema.test.ts`

**Interfaces:**

- Produces: `PluginDependencySchema = string | { name: string; version?: string; marketplace?: string }`. Tasks 3 and 4 consume this type.

- [ ] **Step 1: Write the failing test**

Append to `tests/schemas/plugin-manifest.schema.test.ts`:

```typescript
it('accepts a dependency with a marketplace field', () => {
  const result = PluginManifestSchema.safeParse({
    name: 'deploy-kit',
    dependencies: [{ name: 'mintlify', marketplace: 'claude-plugins-official' }],
  });
  expect(result.success).toBe(true);
  expect(result.data?.dependencies?.[0]).toEqual({
    name: 'mintlify',
    marketplace: 'claude-plugins-official',
  });
});
```

The second assertion is the point: without the schema change Zod *strips* `marketplace`, so `success` is `true` but the parsed value silently loses the field.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/schemas/plugin-manifest.schema.test.ts -t marketplace`
Expected: FAIL — parsed dependency is `{ name: 'mintlify' }`; `marketplace` was stripped.

- [ ] **Step 3: Add the field to the Zod schema**

In `src/validators/schemas.ts`, replace `PluginDependencySchema`:

```typescript
export const PluginDependencySchema = z.union([
  z.string(),
  z.object({
    name: z.string(),
    version: z.string().optional(),
    // Resolve `name` in a different marketplace. Requires the root marketplace to list
    // that marketplace in allowCrossMarketplaceDependenciesOn.
    // https://code.claude.com/docs/en/plugin-dependencies
    marketplace: z.string().optional(),
  }),
]);
```

- [ ] **Step 4: Add the field to the manual reference schema**

In `schemas/plugin-manifest.schema.json`, inside the object branch of the `dependencies` items `oneOf`, add to its `properties`:

```json
            "marketplace": {
              "type": "string",
              "description": "Marketplace to resolve name in. Requires allowCrossMarketplaceDependenciesOn."
            }
```

- [ ] **Step 5: Run the test and the sync checks**

Run: `npx jest tests/schemas/plugin-manifest.schema.test.ts -t marketplace`
Expected: PASS

Run: `npm run check:schema-sync && npm run check:schema-docs-coverage`
Expected: PASS. **If coverage fails**, add `marketplace` to the `dependencies` description in `website/api/schemas/plugin.md` and re-run.

- [ ] **Step 6: Commit**

```bash
git add src/validators/schemas.ts schemas/ website/api/schemas/ tests/schemas/plugin-manifest.schema.test.ts
git commit -m "fix(schemas): add marketplace field to plugin dependency entries"
```

---

### Task 3: Rule `plugin-dependency-string-with-marketplace`

**The flagship rule.** A bare-string dependency containing `@`.

Doc-backed: *"Each entry is either a plugin name or an object"*, and plugin `name` is *"kebab-case, no spaces"* — so `@` cannot legally appear in one. `"dependencies": ["mintlify@claude-plugins-official"]` is therefore parsed as a literal plugin name that cannot exist. Claude Code silently drops the whole plugin entry from the catalog and reports `Plugin "X" not found in marketplace "Y"` — pointing at entirely the wrong thing. The trap is that `foo@bar` **is** valid CLI syntax (`claude plugin install foo@bar`), so it looks correct.

**Files:**

- Create: `src/rules/plugin/plugin-dependency-string-with-marketplace.ts`
- Test: `tests/rules/plugin/plugin-dependency-string-with-marketplace.test.ts`

**Interfaces:**

- Consumes: `PluginManifestSchema` from Task 2.
- Produces: rule id `plugin-dependency-string-with-marketplace`, auto-registered by `npm run generate:types`.

- [ ] **Step 1: Write the failing test**

Create `tests/rules/plugin/plugin-dependency-string-with-marketplace.test.ts`:

```typescript
/**
 * Tests for plugin-dependency-string-with-marketplace rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/plugin/plugin-dependency-string-with-marketplace';

const ruleTester = new ClaudeLintRuleTester();

describe('plugin-dependency-string-with-marketplace', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('plugin-dependency-string-with-marketplace', rule, {
      valid: [
        // Bare string naming a plugin in the same marketplace
        {
          content: JSON.stringify({ name: 'deploy-kit', dependencies: ['audit-logger'] }),
          filePath: '/test/plugin.json',
        },
        // Object form with an explicit marketplace: the correct way to cross marketplaces
        {
          content: JSON.stringify({
            name: 'mintlify-docs',
            dependencies: [{ name: 'mintlify', marketplace: 'claude-plugins-official' }],
          }),
          filePath: '/test/plugin.json',
        },
        // Object form with a version constraint
        {
          content: JSON.stringify({
            name: 'deploy-kit',
            dependencies: [{ name: 'secrets-vault', version: '~2.1.0' }],
          }),
          filePath: '/test/plugin.json',
        },
        // No dependencies at all
        {
          content: JSON.stringify({ name: 'claudelint' }),
          filePath: '/test/plugin.json',
        },
        // Not a plugin manifest
        {
          content: JSON.stringify({ dependencies: ['left-pad@1.0.0'] }),
          filePath: '/test/package.json',
        },
      ],
      invalid: [
        // The real mintlify-docs bug
        {
          content: JSON.stringify({
            name: 'mintlify-docs',
            dependencies: ['mintlify@claude-plugins-official'],
          }),
          filePath: '/test/plugin.json',
          errors: 1,
        },
        // Multiple offenders report separately
        {
          content: JSON.stringify({
            name: 'deploy-kit',
            dependencies: ['a@one', 'audit-logger', 'b@two'],
          }),
          filePath: '/test/plugin.json',
          errors: 2,
        },
      ],
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/rules/plugin/plugin-dependency-string-with-marketplace.test.ts`
Expected: FAIL — cannot resolve module `src/rules/plugin/plugin-dependency-string-with-marketplace`.

- [ ] **Step 3: Write the rule**

Create `src/rules/plugin/plugin-dependency-string-with-marketplace.ts`:

```typescript
/**
 * Rule: plugin-dependency-string-with-marketplace
 *
 * A bare-string dependency is only a plugin name. Plugin names are kebab-case and
 * cannot contain "@", so "name@marketplace" is read as a literal plugin name that
 * cannot exist. Claude Code then drops the entire plugin entry from the marketplace
 * catalog and reports a misleading "not found in marketplace" error.
 */

import { Rule } from '../../types/rule';
import { PluginManifestSchema } from '../../validators/schemas';
import { z } from 'zod';

type PluginManifest = z.infer<typeof PluginManifestSchema>;

export const rule: Rule = {
  meta: {
    id: 'plugin-dependency-string-with-marketplace',
    name: 'Plugin Dependency String With Marketplace',
    description: 'Bare-string dependency must be a plugin name and cannot contain "@"',
    category: 'Plugin',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.6.0',
    docUrl: 'https://claudelint.com/rules/plugin/plugin-dependency-string-with-marketplace',
    docs: {
      recommended: true,
      summary:
        'Flags a bare-string dependency containing "@", which Claude Code reads as a literal plugin name.',
      rationale:
        'A string dependency is only a plugin name, and plugin names are kebab-case with no "@". ' +
        'Claude Code cannot resolve the reference, silently drops the whole plugin entry from the ' +
        'marketplace catalog, and reports "not found in marketplace" - an error that points at the ' +
        'catalog rather than the dependency, making the real cause undiagnosable from the message.',
      details:
        'The "name@marketplace" form is valid CLI syntax (claude plugin install foo@bar), which is ' +
        'why it looks correct in a manifest. It is not valid manifest syntax. To depend on a plugin ' +
        'in another marketplace, use the object form with an explicit marketplace field, and ensure ' +
        'the root marketplace lists that marketplace in allowCrossMarketplaceDependenciesOn.',
      examples: {
        incorrect: [
          {
            description: 'CLI syntax used in a manifest dependency string',
            code: '{\n  "name": "mintlify-docs",\n  "dependencies": ["mintlify@claude-plugins-official"]\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Object form with an explicit marketplace',
            code: '{\n  "name": "mintlify-docs",\n  "dependencies": [\n    { "name": "mintlify", "marketplace": "claude-plugins-official" }\n  ]\n}',
            language: 'json',
          },
          {
            description: 'Bare string for a plugin in the same marketplace',
            code: '{\n  "name": "deploy-kit",\n  "dependencies": ["audit-logger"]\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Replace the string with an object: { "name": "<plugin>", "marketplace": "<marketplace>" }. ' +
        'Then add the target marketplace to allowCrossMarketplaceDependenciesOn in the root ' +
        'marketplace.json, or the install will fail with a cross-marketplace error.',
      relatedRules: ['plugin-dependency-not-allowlisted'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    if (!filePath.endsWith('plugin.json')) {
      return;
    }

    let plugin: PluginManifest;
    try {
      plugin = JSON.parse(fileContent) as PluginManifest;
    } catch {
      return; // JSON parse errors handled by schema validation
    }

    if (!Array.isArray(plugin.dependencies)) {
      return;
    }

    for (const dep of plugin.dependencies) {
      if (typeof dep === 'string' && dep.includes('@')) {
        context.report({
          message: `Dependency "${dep}" is not a valid plugin name`,
          fix: 'Use the object form: { "name": "...", "marketplace": "..." }',
        });
      }
    }
  },
};
```

Message length check: `Dependency "" is not a valid plugin name` is 39 characters plus one interpolation estimated at 10 = 49. Well under the 100 limit.

- [ ] **Step 4: Register the rule and run the test**

Run: `npm run generate:types`
Expected: `Found 115 rule files` (up from 114).

Run: `npx jest tests/rules/plugin/plugin-dependency-string-with-marketplace.test.ts`
Expected: PASS

- [ ] **Step 5: Generate rule docs and run the rule meta-checks**

Run: `npm run docs:generate`

Run: `npm run check:rule-since && npm run check:rule-structure && npm run check:message-length && npm run check:rule-docs-sections`
Expected: all PASS. These enforce repo-wide rule conventions and will name anything missing.

- [ ] **Step 6: Commit**

```bash
git add src/rules/ tests/rules/ website/rules/ website/data/
git commit -m "feat(rules): add plugin-dependency-string-with-marketplace"
```

---

### Task 4: Rule `plugin-dependency-not-allowlisted`

A cross-marketplace dependency requires `allowCrossMarketplaceDependenciesOn` on the declaring marketplace. This rule runs against `marketplace.json`, the only place both halves of the constraint are visible.

**Scoping note (from the spec):** when a plugin lives in a different repo from its marketplace, `marketplace.json` is not on disk and this rule cannot fire. That is intentional. An advisory warn on standalone plugins was rejected — a cross-marketplace dependency in correct object form is *valid*, so warning on it would nag correct code.

**Files:**

- Create: `src/rules/plugin/plugin-dependency-not-allowlisted.ts`
- Test: `tests/rules/plugin/plugin-dependency-not-allowlisted.test.ts`

**Interfaces:**

- Consumes: `MarketplaceMetadataSchema` (has `allowCrossMarketplaceDependenciesOn: string[]`) and `PluginDependencySchema` (Task 2) from `src/validators/schemas.ts`.

- [ ] **Step 1: Write the failing test**

Create `tests/rules/plugin/plugin-dependency-not-allowlisted.test.ts`:

```typescript
/**
 * Tests for plugin-dependency-not-allowlisted rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/plugin/plugin-dependency-not-allowlisted';

const ruleTester = new ClaudeLintRuleTester();

const owner = { name: 'Acme' };

describe('plugin-dependency-not-allowlisted', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('plugin-dependency-not-allowlisted', rule, {
      valid: [
        // Cross-marketplace dependency, correctly allowlisted
        {
          content: JSON.stringify({
            name: 'acme-tools',
            owner,
            allowCrossMarketplaceDependenciesOn: ['acme-shared'],
            plugins: [
              {
                name: 'deploy-kit',
                source: './deploy-kit',
                dependencies: [{ name: 'audit-logger', marketplace: 'acme-shared' }],
              },
            ],
          }),
          filePath: '/test/.claude-plugin/marketplace.json',
        },
        // Same-marketplace dependency needs no allowlist
        {
          content: JSON.stringify({
            name: 'acme-tools',
            owner,
            plugins: [
              {
                name: 'deploy-kit',
                source: './deploy-kit',
                dependencies: [{ name: 'audit-logger', marketplace: 'acme-tools' }],
              },
            ],
          }),
          filePath: '/test/.claude-plugin/marketplace.json',
        },
        // Bare-string dependency: no marketplace to cross
        {
          content: JSON.stringify({
            name: 'acme-tools',
            owner,
            plugins: [
              { name: 'deploy-kit', source: './deploy-kit', dependencies: ['audit-logger'] },
            ],
          }),
          filePath: '/test/.claude-plugin/marketplace.json',
        },
        // No dependencies
        {
          content: JSON.stringify({
            name: 'acme-tools',
            owner,
            plugins: [{ name: 'deploy-kit', source: './deploy-kit' }],
          }),
          filePath: '/test/.claude-plugin/marketplace.json',
        },
      ],
      invalid: [
        // Cross-marketplace dependency with no allowlist at all
        {
          content: JSON.stringify({
            name: 'pdugan20-plugins',
            owner,
            plugins: [
              {
                name: 'mintlify-docs',
                source: './mintlify-docs',
                dependencies: [{ name: 'mintlify', marketplace: 'claude-plugins-official' }],
              },
            ],
          }),
          filePath: '/test/.claude-plugin/marketplace.json',
          errors: 1,
        },
        // Allowlist present but missing this marketplace
        {
          content: JSON.stringify({
            name: 'acme-tools',
            owner,
            allowCrossMarketplaceDependenciesOn: ['some-other'],
            plugins: [
              {
                name: 'deploy-kit',
                source: './deploy-kit',
                dependencies: [{ name: 'audit-logger', marketplace: 'acme-shared' }],
              },
            ],
          }),
          filePath: '/test/.claude-plugin/marketplace.json',
          errors: 1,
        },
      ],
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/rules/plugin/plugin-dependency-not-allowlisted.test.ts`
Expected: FAIL — cannot resolve module `src/rules/plugin/plugin-dependency-not-allowlisted`.

- [ ] **Step 3: Write the rule**

Create `src/rules/plugin/plugin-dependency-not-allowlisted.ts`:

```typescript
/**
 * Rule: plugin-dependency-not-allowlisted
 *
 * Claude Code refuses to auto-install a dependency that lives in a different
 * marketplace than the plugin declaring it, unless the root marketplace lists that
 * marketplace in allowCrossMarketplaceDependenciesOn.
 */

import { Rule } from '../../types/rule';
import { MarketplaceMetadataSchema } from '../../validators/schemas';
import { z } from 'zod';

type Marketplace = z.infer<typeof MarketplaceMetadataSchema>;

export const rule: Rule = {
  meta: {
    id: 'plugin-dependency-not-allowlisted',
    name: 'Plugin Dependency Not Allowlisted',
    description: 'Cross-marketplace dependency requires allowCrossMarketplaceDependenciesOn',
    category: 'Plugin',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.6.0',
    docUrl: 'https://claudelint.com/rules/plugin/plugin-dependency-not-allowlisted',
    docs: {
      recommended: true,
      summary:
        'Flags a plugin depending on another marketplace without the root marketplace allowing it.',
      rationale:
        'By default Claude Code refuses to auto-install a dependency from a marketplace the user has ' +
        'not reviewed. This prevents one marketplace from silently pulling in plugins from an ' +
        'unvetted source. Without the allowlist, install fails with a cross-marketplace error.',
      details:
        'Only the root marketplace allowlist is consulted - the marketplace hosting the plugin being ' +
        'installed - so trust does not chain through intermediate marketplaces. This rule can only ' +
        'fire when the marketplace manifest is present in the scanned tree; a plugin published from ' +
        'a separate repository cannot be checked here.',
      examples: {
        incorrect: [
          {
            description: 'Dependency on another marketplace with no allowlist',
            code: '{\n  "name": "acme-tools",\n  "owner": { "name": "Acme" },\n  "plugins": [\n    {\n      "name": "deploy-kit",\n      "source": "./deploy-kit",\n      "dependencies": [{ "name": "audit-logger", "marketplace": "acme-shared" }]\n    }\n  ]\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Target marketplace listed in the allowlist',
            code: '{\n  "name": "acme-tools",\n  "owner": { "name": "Acme" },\n  "allowCrossMarketplaceDependenciesOn": ["acme-shared"],\n  "plugins": [\n    {\n      "name": "deploy-kit",\n      "source": "./deploy-kit",\n      "dependencies": [{ "name": "audit-logger", "marketplace": "acme-shared" }]\n    }\n  ]\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Add the target marketplace name to allowCrossMarketplaceDependenciesOn in marketplace.json.',
      relatedRules: ['plugin-dependency-string-with-marketplace'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    if (!filePath.endsWith('marketplace.json')) {
      return;
    }

    let manifest: Marketplace;
    try {
      manifest = JSON.parse(fileContent) as Marketplace;
    } catch {
      return; // JSON parse errors handled by schema validation
    }

    const allowed = new Set(manifest.allowCrossMarketplaceDependenciesOn ?? []);
    const self = manifest.name;

    for (const entry of manifest.plugins ?? []) {
      for (const dep of entry.dependencies ?? []) {
        if (typeof dep === 'string' || !dep.marketplace) {
          continue; // Same-marketplace by definition
        }
        if (dep.marketplace === self || allowed.has(dep.marketplace)) {
          continue;
        }
        context.report({
          message: `Dependency on marketplace "${dep.marketplace}" is not allowlisted`,
          fix: `Add "${dep.marketplace}" to allowCrossMarketplaceDependenciesOn`,
        });
      }
    }
  },
};
```

Message length check: `Dependency on marketplace "" is not allowlisted` is 46 characters plus one interpolation estimated at 10 = 56. Under the 100 limit.

- [ ] **Step 4: Register the rule and run the test**

Run: `npm run generate:types`
Expected: `Found 116 rule files`.

Run: `npx jest tests/rules/plugin/plugin-dependency-not-allowlisted.test.ts`
Expected: PASS

- [ ] **Step 5: Generate docs and run the full validation suite**

Run: `npm run docs:generate`

Run: `npm run validate`
Expected: PASS. This is lint + format + build + test, and is the real gate before commit.

- [ ] **Step 6: Commit**

```bash
git add src/rules/ tests/rules/ website/rules/ website/data/
git commit -m "feat(rules): add plugin-dependency-not-allowlisted"
```

---

## Phase 2 — Upstream watch

### Task 5: Watchlist module

The set of docs pages to watch, what to extract from each, and the minimum fact count that guards against silent extractor failure.

**Files:**

- Create: `src/upstream/watchlist.ts`
- Create: `src/upstream/extensions.ts`
- Test: `tests/upstream/watchlist.test.ts`

**Interfaces:**

- Produces: `WATCHLIST: WatchEntry[]`, `type WatchEntry`, `type ExtractorId`, and `KNOWN_EXTENSIONS: Record<string, string>`. Tasks 6, 7, and 8 all consume these.

- [ ] **Step 1: Write the failing test**

Create `tests/upstream/watchlist.test.ts`:

```typescript
import { WATCHLIST } from '../../src/upstream/watchlist';

describe('watchlist', () => {
  it('watches the plugin-dependencies page that was previously missed', () => {
    const ids = WATCHLIST.map((e) => e.id);
    expect(ids).toContain('plugin-dependencies');
  });

  it('uses the raw markdown endpoint for every entry', () => {
    expect(WATCHLIST.length).toBeGreaterThan(0);
    for (const entry of WATCHLIST) {
      expect(entry.url).toMatch(/^https:\/\/code\.claude\.com\/docs\/en\/.+\.md$/);
    }
  });

  it('declares a positive minFacts guard for every entry', () => {
    expect(WATCHLIST.length).toBeGreaterThan(0);
    for (const entry of WATCHLIST) {
      expect(entry.minFacts).toBeGreaterThan(0);
    }
  });

  it('has no duplicate page ids', () => {
    const ids = WATCHLIST.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/upstream/watchlist.test.ts`
Expected: FAIL — cannot resolve module `src/upstream/watchlist`.

- [ ] **Step 3: Write the watchlist**

Create `src/upstream/watchlist.ts`:

```typescript
/**
 * Upstream docs watchlist.
 *
 * Pages whose content claudelint models. The refresh script snapshots each one; the
 * conformance check asserts our Zod schemas match what they document.
 *
 * minFacts guards against silent extractor failure: if upstream reformats a table into
 * prose, a naive parser yields zero facts and conformance would pass vacuously. Fewer
 * than minFacts is a hard error, not an empty result.
 */

export type ExtractorId = 'hook-events' | 'field-tables' | 'json-keys';

export interface WatchEntry {
  /** Stable slug; also the baseline filename. */
  id: string;
  /** Raw markdown endpoint. Verified: code.claude.com serves .md for every docs page. */
  url: string;
  /** Which deterministic extractors to run over this page. */
  extractors: ExtractorId[];
  /** Zod schema names this page is authoritative for. */
  governs: string[];
  /** Minimum facts this page must yield. Below this is a detector malfunction. */
  minFacts: number;
}

const DOCS = 'https://code.claude.com/docs/en';

export const WATCHLIST: WatchEntry[] = [
  {
    id: 'hooks',
    url: `${DOCS}/hooks.md`,
    extractors: ['hook-events', 'field-tables'],
    governs: ['HooksConfigSchema'],
    minFacts: 25,
  },
  {
    id: 'plugins-reference',
    url: `${DOCS}/plugins-reference.md`,
    extractors: ['field-tables', 'json-keys'],
    governs: ['PluginManifestSchema', 'LSPConfigSchema'],
    minFacts: 15,
  },
  {
    id: 'plugin-dependencies',
    url: `${DOCS}/plugin-dependencies.md`,
    extractors: ['field-tables', 'json-keys'],
    governs: ['PluginManifestSchema'],
    minFacts: 3,
  },
  {
    id: 'plugin-marketplaces',
    url: `${DOCS}/plugin-marketplaces.md`,
    extractors: ['field-tables', 'json-keys'],
    governs: ['MarketplaceMetadataSchema'],
    minFacts: 5,
  },
  {
    id: 'skills',
    url: `${DOCS}/skills.md`,
    extractors: ['field-tables'],
    governs: ['SkillFrontmatterSchema'],
    minFacts: 8,
  },
  {
    id: 'sub-agents',
    url: `${DOCS}/sub-agents.md`,
    extractors: ['field-tables'],
    governs: ['AgentFrontmatterSchema'],
    minFacts: 4,
  },
  {
    id: 'mcp',
    url: `${DOCS}/mcp.md`,
    extractors: ['field-tables', 'json-keys'],
    governs: ['MCPConfigSchema'],
    minFacts: 3,
  },
  {
    id: 'output-styles',
    url: `${DOCS}/output-styles.md`,
    extractors: ['field-tables'],
    governs: ['OutputStyleFrontmatterSchema'],
    minFacts: 2,
  },
  {
    id: 'settings',
    url: `${DOCS}/settings.md`,
    extractors: ['field-tables', 'json-keys'],
    governs: [],
    minFacts: 10,
  },
  {
    id: 'memory',
    url: `${DOCS}/memory.md`,
    extractors: ['field-tables'],
    governs: ['RulesFrontmatterSchema'],
    minFacts: 1,
  },
];
```

- [ ] **Step 4: Write the extensions allowlist**

Create `src/upstream/extensions.ts`:

```typescript
/**
 * Values claudelint models that the official docs do not document.
 *
 * The conformance check fails on any modeled-but-undocumented value NOT listed here.
 * Adding an entry requires writing down why it exists, which is what makes a
 * hallucinated value visible rather than silently permanent.
 *
 * Key format: "<SchemaName>.<value>".
 *
 * v1 scope: the conformance check consults `HooksConfigSchema.*` keys only. Field-level
 * conformance is deliberately out of scope (see docs/projects/upstream-watch.md,
 * "Scope in v1"), so do NOT seed this with schema-field entries - an entry no consumer
 * reads is worse than no entry, because it implies a guard that does not exist.
 *
 * Empty today: all 30 modeled hook events are documented upstream.
 */
export const KNOWN_EXTENSIONS: Record<string, string> = {};
```

- [ ] **Step 5: Run the test**

Run: `npx jest tests/upstream/watchlist.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/upstream/ tests/upstream/
git commit -m "feat(upstream): add docs watchlist and known-extensions allowlist"
```

---

### Task 6: Extractor with minFacts guard

**Files:**

- Create: `scripts/upstream/extract.ts`
- Create: `tests/upstream/fixtures/hooks-sample.md`
- Create: `tests/upstream/fixtures/hooks-reformatted.md`
- Test: `tests/upstream/extract.test.ts`

**Interfaces:**

- Consumes: `WATCHLIST` from Task 5.
- Produces: `extract(baselineDir: string): Facts` where `type Facts = Record<string, string[]>` — page id to sorted fact strings. Fact strings are namespaced: `hook-event:MessageDisplay`, `field:marketplace`, `json-key:dependencies`. Task 8 consumes this.
- Throws `Error` when a page yields fewer than its `minFacts`.

- [ ] **Step 1: Write the fixtures**

Create `tests/upstream/fixtures/hooks-sample.md` — a table, the shape upstream uses today:

```markdown
# Hooks

| Event | Description |
| :---- | :---------- |
| `PreToolUse` | Before a tool call executes |
| `PostToolUse` | After a tool call succeeds |
| `MessageDisplay` | While assistant message text is displayed |
```

Create `tests/upstream/fixtures/hooks-reformatted.md` — the same content as prose, simulating an upstream reformat that must trip the guard:

```markdown
# Hooks

Claude Code fires several events. `PreToolUse` runs before a tool call executes,
`PostToolUse` runs after one succeeds, and `MessageDisplay` fires while assistant
message text is displayed.
```

- [ ] **Step 2: Write the failing test**

Create `tests/upstream/extract.test.ts`:

```typescript
import { extractHookEvents, assertMinFacts } from '../../scripts/upstream/extract';
import { readFileSync } from 'fs';
import { join } from 'path';

const fixture = (name: string): string =>
  readFileSync(join(__dirname, 'fixtures', name), 'utf8');

describe('extractHookEvents', () => {
  it('pulls event names out of the events table', () => {
    const events = extractHookEvents(fixture('hooks-sample.md'));
    expect(events).toEqual([
      'hook-event:MessageDisplay',
      'hook-event:PostToolUse',
      'hook-event:PreToolUse',
    ]);
  });
});

describe('assertMinFacts', () => {
  it('passes when a page meets its guard', () => {
    expect(() => assertMinFacts('hooks', ['a', 'b', 'c'], 3)).not.toThrow();
  });

  it('throws when upstream reformats a table into prose', () => {
    // The regression this guard exists to catch: extraction silently collapses to
    // near-zero facts and conformance would otherwise pass vacuously.
    const events = extractHookEvents(fixture('hooks-reformatted.md'));
    expect(() => assertMinFacts('hooks', events, 25)).toThrow(/hooks yielded \d+ facts, expected >= 25/);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx jest tests/upstream/extract.test.ts`
Expected: FAIL — cannot resolve module `scripts/upstream/extract`.

- [ ] **Step 4: Write the extractor**

Create `scripts/upstream/extract.ts`:

```typescript
/**
 * Deterministic fact extraction from the docs baseline.
 *
 * No LLM, no judgment. If upstream changes format such that a parser stops finding
 * things, assertMinFacts turns that into a loud failure rather than a silent pass.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { WATCHLIST, WatchEntry } from '../../src/upstream/watchlist';

export type Facts = Record<string, string[]>;

/** Backtick-quoted identifier in the first cell of a markdown table row. */
const TABLE_ROW = /^\|\s*`([A-Za-z][A-Za-z0-9_-]*)`\s*\|/gm;

export function extractHookEvents(markdown: string): string[] {
  const events = new Set<string>();
  for (const match of markdown.matchAll(TABLE_ROW)) {
    // Hook events are PascalCase; field tables in the same page are not.
    if (/^[A-Z][A-Za-z]+$/.test(match[1])) {
      events.add(`hook-event:${match[1]}`);
    }
  }
  return [...events].sort();
}

export function extractFieldTables(markdown: string): string[] {
  const fields = new Set<string>();
  for (const match of markdown.matchAll(TABLE_ROW)) {
    fields.add(`field:${match[1]}`);
  }
  return [...fields].sort();
}

export function extractJsonKeys(markdown: string): string[] {
  const keys = new Set<string>();
  for (const block of markdown.matchAll(/```json[^\n]*\n([\s\S]*?)```/g)) {
    for (const key of block[1].matchAll(/^\s{2}"([A-Za-z$][A-Za-z0-9_-]*)":/gm)) {
      keys.add(`json-key:${key[1]}`);
    }
  }
  return [...keys].sort();
}

/**
 * A page that suddenly yields almost nothing means the parser broke, not that upstream
 * deleted its content. Fail loudly: a detector that quietly stops detecting is worse
 * than no detector.
 */
export function assertMinFacts(id: string, facts: string[], minFacts: number): void {
  if (facts.length < minFacts) {
    throw new Error(
      `Extractor guard tripped: ${id} yielded ${facts.length} facts, expected >= ${minFacts}. ` +
        `Upstream likely changed format. Fix the extractor - do not lower minFacts to make this pass.`
    );
  }
}

function extractPage(markdown: string, entry: WatchEntry): string[] {
  const facts = new Set<string>();
  for (const extractor of entry.extractors) {
    const found =
      extractor === 'hook-events'
        ? extractHookEvents(markdown)
        : extractor === 'field-tables'
          ? extractFieldTables(markdown)
          : extractJsonKeys(markdown);
    found.forEach((f) => facts.add(f));
  }
  return [...facts].sort();
}

export function extract(baselineDir: string): Facts {
  const facts: Facts = {};
  for (const entry of WATCHLIST) {
    const markdown = readFileSync(join(baselineDir, `${entry.id}.md`), 'utf8');
    const pageFacts = extractPage(markdown, entry);
    assertMinFacts(entry.id, pageFacts, entry.minFacts);
    facts[entry.id] = pageFacts;
  }
  return facts;
}
```

- [ ] **Step 5: Run the test**

Run: `npx jest tests/upstream/extract.test.ts`
Expected: PASS (3 tests).

The unit tests run against the committed fixtures, so no network and no baseline are needed. `extract()` itself is not exercised end-to-end until Task 7 writes the refresh script that produces a baseline for it to read.

- [ ] **Step 6: Commit**

```bash
git add scripts/upstream/extract.ts tests/upstream/
git commit -m "feat(upstream): add deterministic fact extractor with minFacts guard"
```

---

### Task 7: Refresh script

Fetches the page index and every watched page, normalizes, and writes the committed baseline. Also diffs the page index — a **new docs page appearing is itself a finding**, and is the mechanism that would have caught `plugin-dependencies` the week it shipped.

**Files:**

- Create: `scripts/upstream/refresh.ts`
- Modify: `package.json` (add `upstream:refresh` script)
- Create: `docs-baseline/.gitkeep`
- Modify: `.npmignore` (exclude `docs-baseline/`; it is repo tooling, not shipped code)

**Interfaces:**

- Consumes: `WATCHLIST` from Task 5, and `extract(baselineDir): Facts` from Task 6.
- Produces: `docs-baseline/<id>.md`, `docs-baseline/_index.json` (shape: `{ pages: string[] }`), and `docs-baseline/facts.json`. Task 8 reads `facts.json`.
- Exports `normalize(markdown: string): string` and `parseIndex(llmsTxt: string): string[]`.

- [ ] **Step 1: Write the failing test**

Create `tests/upstream/refresh.test.ts`:

```typescript
import { normalize } from '../../scripts/upstream/refresh';

describe('normalize', () => {
  it('strips the boilerplate documentation-index preamble', () => {
    const input = [
      '> ## Documentation Index',
      '> Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt',
      '> Use this file to discover all available pages before exploring further.',
      '',
      '# Hooks',
    ].join('\n');
    expect(normalize(input)).toBe('# Hooks');
  });

  it('strips volatile theme attributes from code fences', () => {
    expect(normalize('```json theme={null}\n{}\n```')).toBe('```json\n{}\n```');
  });

  it('strips trailing whitespace and normalizes trailing newlines', () => {
    expect(normalize('# Title   \n\n\n')).toBe('# Title');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/upstream/refresh.test.ts`
Expected: FAIL — cannot resolve module `scripts/upstream/refresh`.

- [ ] **Step 3: Write the refresh script**

Create `scripts/upstream/refresh.ts`:

```typescript
/**
 * Refreshes the committed upstream docs baseline.
 *
 * Network-bound: runs weekly via cron and on demand. The conformance check
 * (scripts/check/upstream.ts) reads the baseline this produces and is fully offline.
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { WATCHLIST } from '../../src/upstream/watchlist';
import { extract } from './extract';

const BASELINE_DIR = join(__dirname, '../../docs-baseline');
const LLMS_TXT = 'https://code.claude.com/docs/llms.txt';

/** Strip volatile artifacts so diffs reflect real content change, not rendering noise. */
export function normalize(markdown: string): string {
  return markdown
    .replace(/^>.*Documentation Index[\s\S]*?(?=\n#)/, '')
    .replace(/```(\w+)\s+theme=\{null\}/g, '```$1')
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n')
    .trim();
}

/** Page slugs referenced by the docs index. A new slug here is itself a finding. */
export function parseIndex(llmsTxt: string): string[] {
  const slugs = new Set<string>();
  for (const match of llmsTxt.matchAll(/code\.claude\.com\/docs\/en\/([a-z0-9-]+)/g)) {
    slugs.add(match[1]);
  }
  return [...slugs].sort();
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Fetch failed: ${url} returned HTTP ${res.status}`);
  }
  return res.text();
}

async function main(): Promise<void> {
  mkdirSync(BASELINE_DIR, { recursive: true });

  const indexPath = join(BASELINE_DIR, '_index.json');
  const previous: string[] = existsSync(indexPath)
    ? (JSON.parse(readFileSync(indexPath, 'utf8')) as { pages: string[] }).pages
    : [];

  const pages = parseIndex(await fetchText(LLMS_TXT));

  const added = pages.filter((p) => !previous.includes(p));
  const removed = previous.filter((p) => !pages.includes(p));
  const watched = new Set(WATCHLIST.map((e) => e.id));

  for (const page of added) {
    const flag = watched.has(page) ? '' : ' (NOT WATCHED - consider adding to watchlist)';
    console.log(`[NEW PAGE] ${page}${flag}`);
  }
  for (const page of removed) {
    console.log(`[REMOVED PAGE] ${page}`);
  }

  writeFileSync(indexPath, `${JSON.stringify({ pages }, null, 2)}\n`);

  for (const entry of WATCHLIST) {
    const markdown = normalize(await fetchText(entry.url));
    writeFileSync(join(BASELINE_DIR, `${entry.id}.md`), `${markdown}\n`);
    console.log(`[OK] ${entry.id} (${markdown.length} bytes)`);
  }

  // Throws if any page yields fewer than its minFacts. See Task 7.
  const facts = extract(BASELINE_DIR);
  writeFileSync(join(BASELINE_DIR, 'facts.json'), `${JSON.stringify(facts, null, 2)}\n`);
  console.log(`[OK] facts.json (${Object.keys(facts).length} pages)`);
}

main().catch((err: Error) => {
  console.error(`[ERROR] ${err.message}`);
  process.exit(1);
});
```

- [ ] **Step 4: Wire up the npm script and packaging**

Add to `package.json` scripts:

```json
    "upstream:refresh": "ts-node scripts/upstream/refresh.ts",
```

Add `docs-baseline/` to `.npmignore` — it is repo tooling and must not ship in the package.

- [ ] **Step 5: Run the test, then generate the real baseline**

Run: `npx jest tests/upstream/refresh.test.ts`
Expected: PASS (3 tests).

Run: `npm run upstream:refresh`
Expected: `[OK]` for each watched page, then `[OK] facts.json`. On a clean repo the first run also prints every page as `[NEW PAGE]`, because there is no previous `_index.json` to diff against. That is expected exactly once.

**If a `minFacts` guard trips here**, the extractor regex from Task 6 does not match that page's real format. Fix the extractor, or correct the `minFacts` value to the true count — but only after confirming by eye that the page genuinely contains that few facts. Never lower a guard just to get green; that silently disables the detector.

- [ ] **Step 6: Commit the script and the baseline**

```bash
git add scripts/upstream/ tests/upstream/ package.json .npmignore docs-baseline/
git commit -m "feat(upstream): add docs baseline refresh script"
```

---

### Task 8: Offline conformance check

The gate. Compares `facts.json` against claudelint's live Zod schemas, offline, on every PR.

**Files:**

- Create: `scripts/check/upstream.ts`
- Create: `docs-baseline/upstream-ignore.json`
- Modify: `package.json` (add `check:upstream`)
- Test: `tests/upstream/conform.test.ts`

**Interfaces:**

- Consumes: `Facts` (Task 7), `WATCHLIST` (Task 5), `KNOWN_EXTENSIONS` (Task 5), `SCHEMA_REGISTRY` (`src/schemas/registry.ts`).
- Produces: `conform(facts: Facts, ignore: IgnoreFile): Finding[]` where `interface Finding { kind: 'documented-not-modeled' | 'modeled-not-documented'; fact: string; schema: string }`.

- [ ] **Step 1: Write the failing test**

Create `tests/upstream/conform.test.ts`:

```typescript
import { conform } from '../../scripts/check/upstream';

const EMPTY_IGNORE = { 'documented-not-modeled': [], 'modeled-not-documented': [] };

describe('conform', () => {
  it('flags a documented hook event that claudelint does not model', () => {
    const findings = conform({ hooks: ['hook-event:TotallyNewEvent'] }, EMPTY_IGNORE);
    expect(findings).toContainEqual({
      kind: 'documented-not-modeled',
      fact: 'hook-event:TotallyNewEvent',
      schema: 'HooksConfigSchema',
    });
  });

  it('does not flag a documented hook event that claudelint already models', () => {
    const findings = conform({ hooks: ['hook-event:PreToolUse'] }, EMPTY_IGNORE);
    expect(findings).toHaveLength(0);
  });

  it('suppresses a finding listed in the ignore file', () => {
    const findings = conform(
      { hooks: ['hook-event:TotallyNewEvent'] },
      {
        'documented-not-modeled': [
          { fact: 'hook-event:TotallyNewEvent', reason: 'tracked in #123' },
        ],
        'modeled-not-documented': [],
      }
    );
    expect(findings).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/upstream/conform.test.ts`
Expected: FAIL — cannot resolve module `scripts/check/upstream`.

- [ ] **Step 3: Write the conformance check**

Create `scripts/check/upstream.ts`:

```typescript
/**
 * Offline conformance check: does claudelint model what the docs baseline documents?
 *
 * Runs on every PR. Never touches the network - it reads only the committed baseline,
 * so drift cannot creep in between weekly refreshes.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { HookEvents } from '../../src/schemas/constants';
import { KNOWN_EXTENSIONS } from '../../src/upstream/extensions';
import type { Facts } from '../upstream/extract';

const BASELINE_DIR = join(__dirname, '../../docs-baseline');

export interface Finding {
  kind: 'documented-not-modeled' | 'modeled-not-documented';
  fact: string;
  schema: string;
}

interface IgnoreEntry {
  fact: string;
  reason: string;
}

export interface IgnoreFile {
  'documented-not-modeled': IgnoreEntry[];
  'modeled-not-documented': IgnoreEntry[];
}

export function conform(facts: Facts, ignore: IgnoreFile): Finding[] {
  const findings: Finding[] = [];
  const suppressed = (kind: Finding['kind'], fact: string): boolean =>
    ignore[kind].some((e) => e.fact === fact);

  const modeledEvents = new Set<string>(HookEvents.options);
  const documentedEvents = new Set<string>();

  for (const pageFacts of Object.values(facts)) {
    for (const fact of pageFacts) {
      if (!fact.startsWith('hook-event:')) {
        continue;
      }
      const event = fact.slice('hook-event:'.length);
      documentedEvents.add(event);
      if (!modeledEvents.has(event) && !suppressed('documented-not-modeled', fact)) {
        findings.push({ kind: 'documented-not-modeled', fact, schema: 'HooksConfigSchema' });
      }
    }
  }

  // Only meaningful once hook events have actually been extracted; an empty documented
  // set means the extractor did not run, not that upstream deleted every event.
  if (documentedEvents.size > 0) {
    for (const event of modeledEvents) {
      const fact = `hook-event:${event}`;
      if (documentedEvents.has(event)) {
        continue;
      }
      if (KNOWN_EXTENSIONS[`HooksConfigSchema.${event}`] || suppressed('modeled-not-documented', fact)) {
        continue;
      }
      findings.push({ kind: 'modeled-not-documented', fact, schema: 'HooksConfigSchema' });
    }
  }

  return findings;
}

function main(): void {
  const factsPath = join(BASELINE_DIR, 'facts.json');
  if (!existsSync(factsPath)) {
    console.error('[ERROR] No baseline. Run: npm run upstream:refresh');
    process.exit(1);
  }

  const facts = JSON.parse(readFileSync(factsPath, 'utf8')) as Facts;
  const ignorePath = join(BASELINE_DIR, 'upstream-ignore.json');
  const ignore = (
    existsSync(ignorePath)
      ? JSON.parse(readFileSync(ignorePath, 'utf8'))
      : { 'documented-not-modeled': [], 'modeled-not-documented': [] }
  ) as IgnoreFile;

  const findings = conform(facts, ignore);

  if (findings.length === 0) {
    console.log('[SUCCESS] claudelint conforms to the upstream docs baseline');
    return;
  }

  console.error(`[ERROR] ${findings.length} conformance finding(s):\n`);
  for (const f of findings) {
    const detail =
      f.kind === 'documented-not-modeled'
        ? 'documented upstream, not modeled by claudelint'
        : 'modeled by claudelint, not documented upstream (hallucinated?)';
    console.error(`  ${f.fact} (${f.schema}): ${detail}`);
  }
  console.error(
    '\nFix the schema, or suppress with a reason in docs-baseline/upstream-ignore.json'
  );
  process.exit(1);
}

if (require.main === module) {
  main();
}
```

- [ ] **Step 4: Create the ignore file**

Create `docs-baseline/upstream-ignore.json`:

```json
{
  "documented-not-modeled": [],
  "modeled-not-documented": []
}
```

- [ ] **Step 5: Wire up the npm script and run it**

Add to `package.json` scripts:

```json
    "check:upstream": "ts-node scripts/check/upstream.ts",
```

Run: `npx jest tests/upstream/conform.test.ts`
Expected: PASS (3 tests).

Run: `npm run check:upstream`
Expected: `[SUCCESS] claudelint conforms to the upstream docs baseline`.

This must pass **because Task 1 already added `MessageDisplay`.** If it reports `MessageDisplay` as documented-not-modeled, Task 1 was skipped — go back and do it.

- [ ] **Step 6: Commit**

```bash
git add scripts/check/upstream.ts docs-baseline/upstream-ignore.json package.json tests/upstream/conform.test.ts
git commit -m "feat(upstream): add offline conformance check against docs baseline"
```

---

### Task 9: Wire conformance into CI

**Files:**

- Modify: `.github/workflows/ci.yml` (the `static-checks` job)

- [ ] **Step 1: Add the step**

In `.github/workflows/ci.yml`, in the `static-checks` job, after the existing check steps:

```yaml
      - name: Check upstream docs conformance
        run: npm run check:upstream
```

This is safe to run on every PR precisely because it is offline — it reads only the committed baseline.

- [ ] **Step 2: Verify locally**

Run: `npm run check:upstream`
Expected: `[SUCCESS]`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: run upstream conformance check on every PR"
```

---

### Task 10: Weekly refresh workflow

**Files:**

- Create: `.github/workflows/upstream-watch.yml`

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/upstream-watch.yml`:

```yaml
name: Upstream Watch

on:
  schedule:
    - cron: '0 7 * * 1'
  workflow_dispatch:

permissions:
  contents: read
  issues: write

jobs:
  watch:
    name: Check upstream docs for drift
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - name: Setup Node.js
        uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Refresh docs baseline
        id: refresh
        run: npm run upstream:refresh 2>&1 | tee refresh.log

      - name: Detect changes
        id: diff
        run: |
          if git diff --quiet -- docs-baseline/; then
            echo "changed=false" >> "$GITHUB_OUTPUT"
          else
            echo "changed=true" >> "$GITHUB_OUTPUT"
            git diff --stat -- docs-baseline/ > diff.txt
          fi

      - name: Run conformance check
        id: conform
        if: steps.diff.outputs.changed == 'true'
        continue-on-error: true
        run: npm run check:upstream 2>&1 | tee conform.log

      - name: Open or update drift issue
        if: steps.diff.outputs.changed == 'true'
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          BODY=$(
            printf '## Upstream docs changed\n\n'
            printf 'The weekly refresh found changes in the Claude Code docs.\n\n'
            printf '### New or removed pages\n\n```text\n'
            grep -E '^\[(NEW|REMOVED) PAGE\]' refresh.log || echo 'None'
            printf '```\n\n### Conformance findings\n\n```text\n'
            cat conform.log
            printf '```\n\n### Baseline diff\n\n```text\n'
            cat diff.txt
            printf '```\n\nTo accept: run `npm run upstream:refresh`, review, and commit.\n'
          )
          EXISTING=$(gh issue list --state open --label upstream-drift --json number --jq '.[0].number')
          if [ -n "$EXISTING" ]; then
            gh issue edit "$EXISTING" --body "$BODY"
          else
            gh issue create --title 'Upstream drift' --label upstream-drift --body "$BODY"
          fi
```

Note: the workflow does **not** commit the baseline. Accepting drift stays a deliberate human act, and the issue keeps nagging until it happens. It uses a single stable-titled, labelled issue so it edits rather than spams. There is no `ANTHROPIC_API_KEY` — triage is deferred to the local skill.

- [ ] **Step 2: Create the label**

Run: `gh label create upstream-drift --description "Claude Code docs changed upstream" --color FBCA04`

- [ ] **Step 3: Validate the workflow file**

Run: `npx prettier --check .github/workflows/upstream-watch.yml`
Expected: PASS. (Repo uses Prettier on workflow YAML; a quote-style mismatch fails CI.)

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/upstream-watch.yml
git commit -m "ci: add weekly upstream docs watch workflow"
```

- [ ] **Step 5: Smoke-test the workflow**

Run: `gh workflow run "Upstream Watch"`

Then: `gh run watch`
Expected: green. On the first run after the baseline was committed in Task 7, there should be no diff, so no issue is opened.

---

### Task 11: Replace `check-schema-drift` with `check-upstream`

The old skill is manual, prose-only, and reads only the 9 registry URLs — structurally blind to a new page like `plugin-dependencies`. The new skill keeps the interpretive work (reading the prose diff, judging what matters) that the deterministic layer deliberately does not attempt.

**Files:**

- Create: `.claude/skills/check-upstream/SKILL.md`
- Delete: `.claude/skills/check-schema-drift/`
- Modify: `docs/projects/upstream-watch.md` (mark status Implemented)

- [ ] **Step 1: Write the new skill**

Create `.claude/skills/check-upstream/SKILL.md`:

```markdown
---
name: check-upstream
description: Refreshes the Claude Code docs baseline, runs the conformance check, and recommends schema and rule updates. Use when asked to "check for upstream changes", "check schema drift", "are our schemas up to date", or "what is new in Claude Code".
version: 1.0.0
allowed-tools:
  - Bash
  - Read
  - Edit
  - Glob
---

# Check Upstream

Detects new Claude Code documentation surface and drift between the official docs
and claudelint's schemas, then recommends concrete updates.

The deterministic half of this system runs in CI. This skill adds the judgment the
scripts deliberately do not attempt: reading the prose diff and deciding what it
means for claudelint.

## Workflow

### Step 1: Refresh the baseline

Run `npm run upstream:refresh`.

Watch for two things in the output:

- `[NEW PAGE] <slug> (NOT WATCHED ...)` - a docs page appeared that claudelint does
  not watch. This is how a whole feature (such as plugin dependencies) arrives. Read
  the page and decide whether it belongs in `src/upstream/watchlist.ts`.
- `Extractor guard tripped` - the extractor stopped finding facts on a page. Upstream
  changed format. Fix the extractor in `scripts/upstream/extract.ts`. Do NOT lower
  `minFacts` to make it pass; that disables the detector.

### Step 2: Read the prose diff

Run `git diff -- docs-baseline/`.

The scripts catch structural change (fields, enum values, new pages). They cannot catch
a *constraint stated only in prose* - and that class of change causes real bugs. The
mintlify-docs install failure came from one sentence: "a bare string with only the
plugin name". Read the diff for sentences like that.

For each meaningful change, ask: does claudelint model this? Could a user violate it
and have us report success?

### Step 3: Run the conformance check

Run `npm run check:upstream`.

- `documented-not-modeled` - upstream has a field or enum value we lack. Add it to the
  Zod schema, the manual schema in `schemas/`, and the website docs, then run
  `npm run check:schema-sync`.
- `modeled-not-documented` - we model something the docs do not. Treat this as a
  probable hallucination. Verify against the official page before assuming it is real.
  If it is a deliberate claudelint extension, add it to `src/upstream/extensions.ts`
  with a reason. Never silence it by deleting the check.

### Step 4: Report

Summarize: new pages, conformance findings, prose constraints worth a new rule, and a
recommended action for each. Do not change schemas without saying what you are changing
and why.

## Important

- Never add a schema field that is not in the official docs. A previous session
  hallucinated five skill frontmatter fields. `src/upstream/extensions.ts` plus the
  `modeled-not-documented` check exist to make that mistake mechanically visible.
- Accepting a baseline refresh is a deliberate act: review `git diff -- docs-baseline/`
  before committing it.

## See also

- `docs/projects/upstream-watch.md` - design and rationale
- `src/upstream/watchlist.ts` - watched pages and their minFacts guards
- `npm run check:upstream` - the offline conformance gate, also run on every PR
```

- [ ] **Step 2: Remove the superseded skill**

```bash
git rm -r .claude/skills/check-schema-drift/
```

- [ ] **Step 3: Check for dangling references**

Run: `grep -rn "check-schema-drift" --exclude-dir=node_modules --exclude-dir=.git .`
Expected: no hits outside `CHANGELOG.md` and the memory file. Update any that appear (notably `MEMORY.md`, which references the skill by name).

- [ ] **Step 4: Validate everything**

Run: `npm run check:self`
Expected: no problems found. claudelint lints its own skills, so the new SKILL.md must pass its own rules.

Run: `npm run validate`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/ docs/projects/upstream-watch.md
git commit -m "feat(skills): replace check-schema-drift with check-upstream"
```

---

## Done criteria

- `npm run check:upstream` passes offline and runs on every PR.
- `npm run upstream:refresh` regenerates the baseline and reports new docs pages.
- A reformatted upstream table trips the `minFacts` guard instead of silently passing.
- A **hook event** documented upstream but not modeled fails CI; a hook event modeled
  but not documented fails CI unless justified in `src/upstream/extensions.ts`.
  (Field-level conformance is explicitly out of scope for v1 — see the spec's
  "Scope in v1" note. Field drift is surfaced by the prose diff and the
  `/check-upstream` skill, not by the deterministic gate.)
- `plugin-dependency-string-with-marketplace` flags the exact manifest that broke
  `mintlify-docs`.
- `plugin-dependency-not-allowlisted` flags a cross-marketplace dependency with no allowlist.
- The weekly workflow opens exactly one labelled issue and updates it in place.
