---
name: check-schema-drift
description: Compares claudelint schemas against official Claude Code documentation to detect field additions, removals, and changes. Use when asked to "check for schema drift", "compare schemas to docs", "are our schemas up to date", or "check if Claude Code docs changed".
argument-hint: "[schema-name]"
version: 1.0.0
allowed-tools:
  - WebFetch
  - Read
  - Glob
---

# Check Schema Drift Against Official Docs

Compares claudelint's manual reference schemas against the official Claude Code documentation to detect drift: new fields added upstream, fields removed, type changes, or requirement changes.

## Usage

Run the full drift check across all 9 schemas:

```text
/check-schema-drift
```

Run for a specific schema:

```text
/check-schema-drift skills
/check-schema-drift hooks
```

## Workflow

Follow these steps exactly:

### Step 1: Load the schema registry

Read `src/schemas/registry.ts` to get the list of schemas and their official documentation URLs.

The registry maps each schema to:

- `name` - Schema identifier (e.g., `SkillFrontmatterSchema`)
- `manualSchemaFile` - Local reference schema filename (e.g., `skill-frontmatter.schema.json`)
- `officialDocsUrl` - Official Claude Code documentation URL

### Step 2: For each schema, compare docs against local schema

If `$ARGUMENTS` specifies a schema name (e.g., "skills", "hooks", "mcp", "agents", "plugin", "marketplace", "lsp", "output-styles", "rules"), filter to only that schema. Otherwise, check all 9.

For each schema:

#### 2a. Read the local manual schema

Read the file from `schemas/{manualSchemaFile}`. Extract:

- All property names from `properties`
- Each property's `type`
- Each property's `enum` values (if any)
- Which properties are in `required`
- Any nested object properties (recurse)

#### 2b. Fetch the official documentation

Use `WebFetch` on the `officialDocsUrl`. Extract every documented field from the page:

- Field names
- Field types (string, boolean, array, object, etc.)
- Whether the field is required or optional
- Allowed values / enum options
- Any new fields not in our schema

Pay attention to:

- Tables with columns like "Field", "Type", "Required", "Description"
- Frontmatter reference sections with field definitions
- Code examples showing field usage
- YAML/JSON examples that reveal field names and types

#### 2c. Compare and record differences

For each schema, categorize findings:

- **Added in docs**: Fields documented upstream that are NOT in our local schema
- **Removed from docs**: Fields in our local schema that are NOT documented upstream
- **Type changed**: Fields where the documented type differs from our schema
- **Requirement changed**: Fields that changed between required/optional
- **Enum changed**: Fields where allowed values differ (new values added, values removed)
- **No drift**: Fields that match

### Step 3: Output the drift report

Format the report as follows:

```text
## Schema Drift Report

### SkillFrontmatterSchema
Source: https://code.claude.com/docs/en/skills#frontmatter-reference
Local: schemas/skill-frontmatter.schema.json

  ADDED (in docs, not in local schema):
  + new-field-name (string, optional) - Description from docs

  REMOVED (in local schema, not in docs):
  - old-field-name (string)

  CHANGED:
  ~ field-name: type string -> boolean
  ~ field-name: required -> optional

  OK: name, description, model, context, ... (N fields match)

### HooksConfigSchema
...

## Summary
- Schemas checked: 9
- Schemas with drift: 2
- Total additions: 3
- Total removals: 1
- Total changes: 1
```

### Step 4: Recommend next steps

If drift is found:

1. For **added fields**: Suggest adding them to the manual schema in `schemas/` and the Zod schema in `src/schemas/` or `src/validators/schemas.ts`
2. For **removed fields**: Suggest verifying removal is intentional, then updating schemas
3. For **type/enum changes**: Suggest updating the schema to match docs
4. After any changes: Run `npm run generate:json-schemas` then `npm run check:schema-sync`

## Schema Name Mapping

Use this to match `$ARGUMENTS` to registry entries:

| Argument | Registry entry | Docs page |
|----------|---------------|-----------|
| skills | SkillFrontmatterSchema | skills#frontmatter-reference |
| hooks | HooksConfigSchema | hooks |
| mcp | MCPConfigSchema | mcp |
| agents | AgentFrontmatterSchema | sub-agents#supported-frontmatter-fields |
| plugin | PluginManifestSchema | plugins-reference#plugin-manifest-schema |
| marketplace | MarketplaceMetadataSchema | plugin-marketplaces#marketplace-schema |
| lsp | LSPConfigSchema | plugins-reference#lsp-servers |
| output-styles | OutputStyleFrontmatterSchema | output-styles#frontmatter |
| rules | RulesFrontmatterSchema | memory#path-specific-rules |

## Important Notes

- The official docs are unstructured HTML. Field information may appear in tables, lists, code blocks, or prose. Extract fields from all of these.
- Some docs pages cover more than just schema fields (e.g., tutorials, examples). Focus on the reference/schema section identified by the URL anchor.
- If a docs page is unreachable, report the fetch failure and continue with the remaining schemas.
- Our schemas may intentionally be stricter than docs (extra validations). Focus on structural drift: fields, types, enums, required status.

## See Also

- `src/schemas/registry.ts` - Schema registry with official doc URLs
- `npm run check:schema-sync` - Verify Zod and JSON schemas match
