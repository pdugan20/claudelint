# Preset System (Slim) -- Technical Design

**Last Updated**: 2026-02-14

---

## Architecture Overview

The preset system layers on top of the existing `extends` infrastructure. Built-in presets are `claudelint:`-prefixed identifiers that resolve to generated JSON config files bundled in the npm package.

```text
User config (.claudelintrc.json)
  extends: "claudelint:recommended"
    resolves to: <package>/presets/recommended.json
      generated from docs.recommended flags at build time
```

---

## 1. Preset JSON Generation

A build-time script reads the rule registry and generates two JSON files.

**Script:** `scripts/generate/presets.ts`

**Output:**

- `presets/recommended.json` -- rules where `meta.docs.recommended === true`
- `presets/all.json` -- all registered rules at source severity

```typescript
// Pseudocode
function generateRecommendedPreset(): ClaudeLintConfig {
  const rules: Record<string, string> = {};
  for (const rule of RuleRegistry.getAllRules()) {
    if (rule.meta.docs?.recommended) {
      rules[rule.meta.id] = rule.meta.severity;
    }
  }
  return { rules };
}

function generateAllPreset(): ClaudeLintConfig {
  const rules: Record<string, string> = {};
  for (const rule of RuleRegistry.getAllRules()) {
    rules[rule.meta.id] = rule.meta.severity;
  }
  return { rules };
}
```

Rules without `docs.recommended` set are excluded from recommended (treated as not-recommended).

---

## 2. Preset Resolution in Config Loader

**File:** `src/utils/config/extends.ts`

Add built-in preset resolution before the existing `require.resolve` fallback:

```typescript
import { join } from 'path';

const BUILTIN_PRESETS: Record<string, string> = {
  'claudelint:recommended': join(__dirname, '../../../presets/recommended.json'),
  'claudelint:all': join(__dirname, '../../../presets/all.json'),
};

export function resolveConfigPath(extendsValue: string, fromDir: string): string {
  // Check built-in presets first
  if (extendsValue.startsWith('claudelint:')) {
    const presetPath = BUILTIN_PRESETS[extendsValue];
    if (!presetPath) {
      throw new ConfigError(
        `Unknown built-in preset: ${extendsValue}\n` +
        `Available presets: ${Object.keys(BUILTIN_PRESETS).join(', ')}`
      );
    }
    return presetPath;
  }

  // Existing resolution logic (relative paths, node_modules)...
}
```

---

## 3. Package Distribution

Preset JSON files ship in the npm package under `presets/`:

**package.json changes:**

```json
{
  "files": [
    "dist",
    "presets",
    "bin"
  ]
}
```

**Build pipeline:**

```text
npm run build
  1. tsc (compile TypeScript)
  2. generate-presets (create presets/*.json from registry)
  3. generate-rule-docs (existing)
```

Add `"generate:presets": "ts-node scripts/generate/presets.ts"` to package.json scripts.

---

## 4. Init Wizard Update

**File:** `src/cli/init-wizard.ts`

The wizard already uses `buildRulesFromRegistry()` checking `docs?.recommended`. Add an option to generate `extends`-based config:

```text
? Which configuration would you like to start with?
  > Recommended (curated rules for most projects)
    All rules (everything enabled)
    Manual (start from scratch)
```

- **Recommended** generates `{ "extends": "claudelint:recommended" }`
- **All rules** generates `{ "extends": "claudelint:all" }` (or no extends)
- **Manual** generates `{ "rules": {} }` (current behavior)

---

## 5. User-Facing Behavior

### Using a preset

```json
{
  "extends": "claudelint:recommended"
}
```

### Extending with overrides

```json
{
  "extends": "claudelint:recommended",
  "rules": {
    "skill-missing-changelog": "off",
    "skill-body-too-long": "error"
  }
}
```

### No change for existing users

Users without a config file see zero behavior change. All rules still run at source severity.

---

## 6. Testing Strategy

### Unit Tests

- `resolveConfigPath` resolves `claudelint:recommended` to correct file path
- `resolveConfigPath` resolves `claudelint:all` to correct file path
- `resolveConfigPath` throws `ConfigError` for `claudelint:unknown`
- Preset JSON contains exactly the rules with `docs.recommended === true`
- `presets/all.json` contains all 116 rules

### Integration Tests

- Config with `extends: "claudelint:recommended"` loads and merges correctly
- Config with `extends: "claudelint:recommended"` + user overrides merge correctly
- No config behavior unchanged (all rules run)

### Snapshot Tests

- Generated `presets/recommended.json` matches snapshot (catches unintentional changes)
- Generated `presets/all.json` matches snapshot

---

## 7. Website Documentation

| Page | Changes |
|------|---------|
| `website/guide/configuration.md` | Add "Built-in Presets" subsection under Extends, with examples |
| `website/guide/getting-started.md` | Mention `claudelint:recommended` in quickstart setup |

Future work (not in this project):

- "Recommended" badge on `<RuleHeader>` component
- Rules overview page explaining recommended vs all
- Rule author guide for `docs.recommended` criteria

---

## 8. Future Work (Out of Scope)

- Move `recommended` to top-level `meta.recommended` (when needed for perf/API reasons)
- Severity override map (recommended preset overrides source severity)
- Shareable preset packages (`@company/claudelint-config`)
- Category presets (`claudelint:skills-strict`, `claudelint:security`)
- `--preset` CLI flag
- CI freshness check for generated preset files
- "Recommended" badge on website rule pages
