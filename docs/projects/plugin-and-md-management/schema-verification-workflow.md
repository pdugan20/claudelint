# Schema Verification Workflow

**Created**: 2026-02-02
**Status**: In Development

## Overview

This document describes how claudelint verifies its schemas stay synchronized with official Claude Code specifications.

## The Verification Problem

**Challenge**: Most Claude Code schemas exist only as prose documentation on code.claude.com, not machine-readable specs.

**Risk**: Our Zod validation schemas can drift from official specs without detection.

**Evidence**: During schema verification setup, discovered SkillFrontmatterSchema missing 4 fields from official docs.

## Our Approach: Dual Schema System

We maintain two types of schemas that work together:

### 1. Manual Reference JSON Schemas (`schemas/*.schema.json`)

**Purpose**: Encode "what the official documentation says" as machine-readable test fixtures

**Created by**: Human reading official Claude Code docs and translating to JSON Schema

**Hosted at**: `https://raw.githubusercontent.com/pdugan20/claudelint/main/schemas/*.schema.json`

**Examples**:

- `plugin-manifest.schema.json` - Based on <https://code.claude.com/docs/en/plugins-reference#plugin-manifest-schema>
- `skill-frontmatter.schema.json` - Based on <https://code.claude.com/docs/en/skills#frontmatter-reference>

**Role**: Reference implementation, not source of truth

### 2. Implementation Zod Schemas (`src/schemas/*.ts`, `src/validators/schemas.ts`)

**Purpose**: Runtime validation in claudelint validators

**Features**:

- TypeScript type safety
- Custom refinements (noXMLTags, noReservedWords, thirdPerson, etc.)
- Can be **stricter** than official specs (extra validations OK)
- Cannot be **looser** (missing fields BAD)

**Role**: Actual implementation used by validators

## Verification Workflow

```text
Official Claude Code Docs (prose)
    ↓ [human reads and interprets]
Manual JSON Schema (reference)
    ↓ [zod-to-json-schema library]
Auto-Generated JSON Schema from Zod
    ↓ [automated comparison]
Drift Report
    ↓ [if drift found]
Fix Zod Schema
```

### Step 1: Create Manual Reference Schema

1. Human reads official documentation
2. Extracts all fields, types, required/optional status
3. Creates `schemas/{name}.schema.json` in JSON Schema format
4. Documents source URL in schema description

**Example**: Created `skill-frontmatter.schema.json` with 14 fields from official docs.

### Step 2: Generate JSON Schema from Zod

Using `zod-to-json-schema` library:

```typescript
import { zodToJsonSchema } from 'zod-to-json-schema';
import { SkillFrontmatterSchema } from './src/schemas/skill-frontmatter.schema';

const generated = zodToJsonSchema(SkillFrontmatterSchema);
```

### Step 3: Compare Schemas

Automated comparison checks:

**Field Comparison**:

- PASS Same field names?
- PASS Same types?
- PASS Same required/optional?
- PASS Same enum values?

**Strictness Rules**:

- PASS **Extra validations in Zod OK** (e.g., noXMLTags, thirdPerson)
- FAIL **Missing fields in Zod BAD** (official spec has it, we don't)
- FAIL **Wrong types BAD** (string vs number)
- WARN **Different enums WARNING** (may be intentional)

### Step 4: Report Drift

When drift detected:

```text
Schema drift detected: SkillFrontmatterSchema

Missing fields (in official, not in Zod):
  - argument-hint (string, optional)
  - disable-model-invocation (boolean, optional)
  - user-invocable (boolean, optional)
  - hooks (array, optional)

Action required: Update src/schemas/skill-frontmatter.schema.ts
```

### Step 5: Fix Zod Schema

1. Review drift report
2. Determine if difference is intentional or bug
3. Update Zod schema if needed
4. Re-run verification
5. Document any intentional deviations in code comments

## Schemas Being Verified

### Automated (JSON Schema + Zod)

1. **SettingsSchema** - Has official JSON Schema on schemastore.org
2. **PluginManifestSchema** - Manual reference created
3. **SkillFrontmatterSchema** - Manual reference created (FOUND DRIFT)
4. **HooksConfigSchema** - Manual reference needed
5. **MCPConfigSchema** - Manual reference needed
6. **LSPConfigSchema** - Manual reference needed
7. **AgentFrontmatterSchema** - Manual reference needed
8. **OutputStyleFrontmatterSchema** - Manual reference needed
9. **ClaudeMdFrontmatterSchema** - Manual reference needed

### Manual Only

Some schemas don't have machine-readable specs, so comparison is impossible. These require quarterly human review.

## Why Not Just Use JSON Schema?

**Question**: Why not use JSON Schema as source of truth and generate Zod from it?

**Answer**: Our validators need Zod's custom refinements that JSON Schema can't express:

- `noXMLTags()` - Prevents `<xml>` tags in strings
- `noReservedWords()` - Rejects "claude", "anthropic" in names
- `thirdPerson()` - Ensures descriptions use third person
- `lowercaseHyphens()` - Validates kebab-case format

These are **claudelint-specific** validations beyond what official specs require. We want to be stricter than the minimum.

## Why Not Just Generate JSON Schema from Zod?

**Question**: Why manually create reference schemas if we're generating from Zod anyway?

**Answer**: That would be circular - "does my schema match my schema?" always passes.

The manual JSON Schemas encode **what the official docs say**, independent of our implementation. This catches drift like the 4 missing fields we just found.

## Verification Schedule

- **Pre-commit**: Run schema-sync on every commit (via CI)
- **Weekly**: CI job fetches official schemas and compares
- **Quarterly**: Human review of manual-only schemas
- **On Claude Code releases**: Re-verify all schemas

## Tools

- **`npm run check:schema-sync`** - Run verification locally
- **`scripts/check/schema-sync.ts`** - Verification script
- **`zod-to-json-schema`** - Generate JSON Schema from Zod (TODO: add)
- **`schemas/*.schema.json`** - Reference implementations

## Next Steps

1. Finish creating manual reference schemas (6 more to go)
2. Fix drift in SkillFrontmatterSchema (add 4 missing fields)
3. Install `zod-to-json-schema` library
4. Update verification script to generate + compare
5. Add to CI/CD pipeline

## References

- [Schema Inventory](./schema-inventory.md)
- [Official Claude Code Docs](https://code.claude.com/docs)
- [JSON Schema Spec](https://json-schema.org/)
- [Zod Documentation](https://zod.dev/)
