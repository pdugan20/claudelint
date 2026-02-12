# Preset System — Technical Design

**Last Updated**: 2026-02-11

---

## 1. Architecture Overview

The preset system layers on top of the existing `extends` infrastructure. No new resolution mechanism is needed — built-in presets are special-cased identifiers that resolve to generated JSON config files bundled in the npm package.

```text
User config (.claudelintrc.json)
  └── extends: "claudelint:recommended"
        └── resolves to: <package>/presets/recommended.json
              └── generated from RuleMetadata at build time
```

### Resolution Flow

```text
1. User writes:       { "extends": "claudelint:recommended" }
2. Config loader sees "claudelint:" prefix
3. Resolves to bundled preset file (not node_modules)
4. Loads preset JSON as base config
5. Merges user overrides on top (existing merge logic)
```

---

## 2. Preset Definitions

### `claudelint:recommended`

The curated subset. Rules included must meet ALL of these criteria:

- **Correctness**: Catches real bugs, broken configs, or security issues
- **Low false-positive rate**: Does not fire on valid configurations
- **Stable**: The rule's behavior won't change semantically between minor versions
- **Broadly applicable**: Relevant to most Claude Code projects, not niche use cases

Rules NOT included:

- Style preferences (naming conventions, length limits)
- Rules requiring project-specific context to be useful
- Rules with known false-positive edge cases
- Newly added rules (must prove stability for one minor version first)

**Severity tuning**: The preset may override a rule's source severity. For example, a rule defined as `error` in source may be `warn` in recommended if it's important but has edge cases.

### `claudelint:all`

Every registered rule at its source-defined severity. Equivalent to running with no config file. Exists for:

- Explicitness: "I want everything, and I know it"
- Base for override: `extends: "claudelint:all"` then turn off specific rules

### No config (default behavior)

Unchanged. All rules run at source severity. This is identical to `claudelint:all` but implicit.

---

## 3. Implementation Details

### 3a. Move `recommended` to RuleMetadata

Currently `recommended` lives in `docs.recommended` (the `RuleDocumentation` interface). Move it to the top-level `RuleMetadata` interface so it's accessible without the docs payload.

**File:** `src/types/rule.ts`

```typescript
export interface RuleMetadata {
  id: RuleId;
  name: string;
  description: string;
  category: RuleCategory;
  severity: RuleSeverity;
  fixable: boolean;
  deprecated?: boolean | DeprecationInfo;
  since: string;
  recommended: boolean;        // NEW — was docs.recommended
  docUrl?: string;
  schema?: z.ZodType;
  defaultOptions?: Record<string, unknown>;
  docs?: RuleDocumentation;
}
```

Remove `recommended` from `RuleDocumentation` interface in `src/types/rule-metadata.ts`.

### 3b. Preset JSON Generation

Add a build step (alongside existing rule docs generation) that produces preset JSON files from registry metadata.

**Output files:**

- `presets/recommended.json` — generated from `meta.recommended === true` rules
- `presets/all.json` — generated from all registered rules

**Generator:** `scripts/generate/presets.ts`

```typescript
// Pseudocode
function generateRecommendedPreset(): ClaudeLintConfig {
  const rules: Record<string, string> = {};
  for (const rule of RuleRegistry.getAllRules()) {
    if (rule.meta.recommended) {
      rules[rule.meta.id] = rule.meta.severity; // or tuned severity from overrides map
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

### 3c. Preset Resolution in Config Loader

**File:** `src/utils/config/extends.ts`

Add built-in preset resolution before the existing `require.resolve` fallback:

```typescript
const BUILTIN_PRESETS: Record<string, string> = {
  'claudelint:recommended': path.join(__dirname, '../../../presets/recommended.json'),
  'claudelint:all': path.join(__dirname, '../../../presets/all.json'),
};

export function resolveConfigPath(extendsValue: string, fromDir: string): string {
  // Check built-in presets first
  if (BUILTIN_PRESETS[extendsValue]) {
    return BUILTIN_PRESETS[extendsValue];
  }

  // Existing resolution logic...
}
```

### 3d. Init Wizard Update

**File:** `src/cli/init-wizard.ts`

Replace the hardcoded rule list with a preset selection prompt:

```text
? Which configuration would you like to start with?
  > Recommended (curated rules for most projects)
    All rules (everything enabled)
    Manual (start from scratch)
```

- **Recommended** → `{ "extends": "claudelint:recommended" }`
- **All rules** → `{ "extends": "claudelint:all" }` (or no extends, same effect)
- **Manual** → `{ "rules": {} }` (current behavior)

### 3e. Severity Override Map (Optional)

Some rules may warrant a different severity in `recommended` than their source definition. For example, `skill-body-too-long` is `warn` in source but might be excluded from recommended entirely.

**File:** `scripts/generate/presets.ts`

```typescript
// Optional overrides for recommended preset
const RECOMMENDED_SEVERITY_OVERRIDES: Partial<Record<RuleId, RuleSeverity>> = {
  'skill-missing-changelog': 'off',      // Too noisy for most projects
  'skill-body-word-count': 'warn',        // Useful but not error-worthy
};
```

These overrides live alongside the generator, not in rule source files, keeping the preset curation centralized.

---

## 4. Build & Distribution

### Package Contents

Preset JSON files ship in the npm package under `presets/`:

```text
claude-code-lint/
├── presets/
│   ├── recommended.json
│   └── all.json
├── dist/
│   └── ...
└── package.json
```

**package.json updates:**

```json
{
  "files": [
    "dist",
    "presets",
    "bin"
  ]
}
```

### Generation Pipeline

```text
npm run build
  └── 1. tsc (compile TypeScript)
  └── 2. generate-presets (create presets/*.json from registry)
  └── 3. generate-rule-docs (existing)
```

Add `"generate:presets": "ts-node scripts/generate/presets.ts"` to package.json scripts.

---

## 5. User-Facing Behavior

### Using a Preset

```json
{
  "extends": "claudelint:recommended"
}
```

### Extending a Preset with Overrides

```json
{
  "extends": "claudelint:recommended",
  "rules": {
    "skill-missing-changelog": "off",
    "skill-body-too-long": "error"
  }
}
```

### Combining Presets (Possible but Unusual)

```json
{
  "extends": ["claudelint:recommended", "./team-overrides.json"]
}
```

### No Change for Existing Users

Users without a config file see zero behavior change. All rules still run at source severity.

---

## 6. Documentation Updates

| Document | Changes |
|----------|---------|
| `docs/configuration.md` | Add "Presets" section documenting built-in presets, extend syntax, override pattern |
| `website/guide/getting-started.md` | Add preset selection to quickstart |
| `website/guide/rules-overview.md` | Explain recommended vs all |
| Website rule pages | Add "Recommended" badge back to `<RuleHeader>` for recommended rules |
| `CONTRIBUTING.md` or rule author guide | Document how to mark new rules as recommended |
| `docs/custom-rules.md` | Note that custom rules can set `recommended` field |

---

## 7. Migration Path

**For existing users (no config):** No change. All rules remain on.

**For users who want the curated experience:** Add one line to config:

```json
{ "extends": "claudelint:recommended" }
```

**For CI pipelines:** Can switch to `recommended` to reduce noise, then selectively add strict rules back:

```json
{
  "extends": "claudelint:recommended",
  "rules": {
    "skill-hardcoded-secrets": "error"
  }
}
```

---

## 8. Testing Strategy

### Unit Tests

- `resolveConfigPath` resolves `claudelint:recommended` and `claudelint:all` to correct file paths
- `loadConfigWithExtends` loads preset JSON and merges with user overrides
- Preset JSON contains exactly the rules marked `recommended: true` in registry
- Severity overrides are applied correctly in recommended preset

### Integration Tests

- `claudelint --config recommended.json` runs only recommended rules
- Extending recommended + turning a rule off works
- Extending recommended + turning an extra rule on works
- No config behavior unchanged (all rules run)

### Regression Tests

- Generated preset JSON matches snapshot (detect unintentional rule additions/removals)
- Preset files are included in `npm pack` output
- Init wizard generates valid config for each option

---

## 9. Future Work (Out of Scope for 0.3.0)

- **Shareable preset packages** (`@acme/claudelint-config`) — extends already supports node_modules resolution, just needs documentation
- **Category presets** (`claudelint:skills-strict`, `claudelint:security`) — generated from category + severity filters
- **`--preset` CLI flag** — shorthand for `--config` with built-in preset, useful for one-off runs
- **Preset composition** — `claudelint:recommended` + `claudelint:strict-security` with proper merge ordering
