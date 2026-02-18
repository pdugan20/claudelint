# Docs Migration Inventory

Complete file-by-file mapping of every document in `docs/` and what happens to it during the VitePress migration.

**Principle**: Single source of truth. After migration, `docs/` is deleted entirely.

## Category Legend

- **MIGRATE**: Move content to `website/`, adapt for VitePress (add frontmatter, update links)
- **MERGE**: Combine with other docs into a single VitePress page
- **AUTO-GEN**: Content replaced by auto-generated output from rule metadata
- **DELETE**: Remove entirely (internal/stale/planning docs)
- **ARCHIVE**: Move to a non-docs location or keep only in git history

---

## Guide Docs (Top-Level)

| Current Path | Action | VitePress Destination | Notes |
|---|---|---|---|
| `docs/getting-started.md` | MIGRATE | `website/guide/getting-started.md` | Add frontmatter |
| `docs/configuration.md` | MIGRATE | `website/guide/configuration.md` | Merge caching.md content |
| `docs/troubleshooting.md` | MIGRATE | `website/guide/troubleshooting.md` | Merge debugging.md content |
| `docs/auto-fix.md` | MIGRATE | `website/guide/auto-fix.md` | |
| `docs/caching.md` | MERGE | `website/guide/configuration.md` | Becomes "Caching" section |
| `docs/debugging.md` | MERGE | `website/guide/troubleshooting.md` | Becomes "Debugging" section |
| `docs/custom-rules.md` | MIGRATE | `website/development/custom-rules.md` | |
| `docs/validation-reference.md` | MIGRATE | `website/validators/overview.md` | Split into per-validator pages |
| `docs/glossary.md` | MIGRATE | `website/reference/glossary.md` | |
| `docs/file-naming-conventions.md` | MIGRATE | `website/reference/file-naming.md` | |
| `docs/rule-options-guide.md` | MERGE | `website/development/rule-development.md` | Becomes "Options" section |
| `docs/rule-development-enforcement.md` | MERGE | `website/development/rule-development.md` | Internal policy, extract relevant parts |
| `docs/architecture.md` | MIGRATE | `website/development/architecture.md` | Update class names (FileValidator, SchemaValidator) |

## API Docs

| Current Path | Action | VitePress Destination | Notes |
|---|---|---|---|
| `docs/api/README.md` | MIGRATE | `website/api/overview.md` | |
| `docs/api/claudelint-class.md` | MIGRATE | `website/api/claudelint-class.md` | |
| `docs/api/types.md` | MIGRATE | `website/api/types.md` | |
| `docs/api/formatters.md` | MIGRATE | `website/api/formatters.md` | |
| `docs/api/MIGRATION.md` | MIGRATE | `website/api/migration.md` | |

## Rule Docs (117 files)

All rule docs become seed content for auto-generation. Examples and descriptions are ported into TypeScript rule metadata, then the docs are auto-generated.

### agents/ (12 rules)

| Current Path | Action | VitePress Destination |
|---|---|---|
| `docs/rules/agents/agent-body-too-short.md` | AUTO-GEN | `website/rules/agents/agent-body-too-short.md` |
| `docs/rules/agents/agent-description.md` | AUTO-GEN | `website/rules/agents/agent-description.md` |
| `docs/rules/agents/agent-disallowed-tools.md` | AUTO-GEN | `website/rules/agents/agent-disallowed-tools.md` |
| `docs/rules/agents/agent-hooks.md` | AUTO-GEN | `website/rules/agents/agent-hooks.md` |
| `docs/rules/agents/agent-hooks-invalid-schema.md` | AUTO-GEN | `website/rules/agents/agent-hooks-invalid-schema.md` |
| `docs/rules/agents/agent-missing-system-prompt.md` | AUTO-GEN | `website/rules/agents/agent-missing-system-prompt.md` |
| `docs/rules/agents/agent-model.md` | AUTO-GEN | `website/rules/agents/agent-model.md` |
| `docs/rules/agents/agent-name.md` | AUTO-GEN | `website/rules/agents/agent-name.md` |
| `docs/rules/agents/agent-name-directory-mismatch.md` | AUTO-GEN | `website/rules/agents/agent-name-directory-mismatch.md` |
| `docs/rules/agents/agent-skills.md` | AUTO-GEN | `website/rules/agents/agent-skills.md` |
| `docs/rules/agents/agent-skills-not-found.md` | AUTO-GEN | `website/rules/agents/agent-skills-not-found.md` |
| `docs/rules/agents/agent-tools.md` | AUTO-GEN | `website/rules/agents/agent-tools.md` |

### claude-md/ (14 rules)

| Current Path | Action | VitePress Destination |
|---|---|---|
| `docs/rules/claude-md/claude-md-size-error.md` | AUTO-GEN | `website/rules/claude-md/claude-md-size-error.md` |
| `docs/rules/claude-md/claude-md-size-warning.md` | AUTO-GEN | `website/rules/claude-md/claude-md-size-warning.md` |
| `docs/rules/claude-md/claude-md-content-too-many-sections.md` | AUTO-GEN | `website/rules/claude-md/claude-md-content-too-many-sections.md` |
| `docs/rules/claude-md/claude-md-file-not-found.md` | AUTO-GEN | `website/rules/claude-md/claude-md-file-not-found.md` |
| `docs/rules/claude-md/claude-md-filename-case-sensitive.md` | AUTO-GEN | `website/rules/claude-md/claude-md-filename-case-sensitive.md` |
| `docs/rules/claude-md/claude-md-glob-pattern-backslash.md` | AUTO-GEN | `website/rules/claude-md/claude-md-glob-pattern-backslash.md` |
| `docs/rules/claude-md/claude-md-glob-pattern-too-broad.md` | AUTO-GEN | `website/rules/claude-md/claude-md-glob-pattern-too-broad.md` |
| `docs/rules/claude-md/claude-md-import-circular.md` | AUTO-GEN | `website/rules/claude-md/claude-md-import-circular.md` |
| `docs/rules/claude-md/claude-md-import-depth-exceeded.md` | AUTO-GEN | `website/rules/claude-md/claude-md-import-depth-exceeded.md` |
| `docs/rules/claude-md/claude-md-import-in-code-block.md` | AUTO-GEN | `website/rules/claude-md/claude-md-import-in-code-block.md` |
| `docs/rules/claude-md/claude-md-import-missing.md` | AUTO-GEN | `website/rules/claude-md/claude-md-import-missing.md` |
| `docs/rules/claude-md/claude-md-import-read-failed.md` | AUTO-GEN | `website/rules/claude-md/claude-md-import-read-failed.md` |
| `docs/rules/claude-md/claude-md-paths.md` | AUTO-GEN | `website/rules/claude-md/claude-md-paths.md` |
| `docs/rules/claude-md/claude-md-rules-circular-symlink.md` | AUTO-GEN | `website/rules/claude-md/claude-md-rules-circular-symlink.md` |

### skills/ (45 rules) - AUTO-GEN all

All 45 skill rule docs follow the same pattern: content ported to metadata, then auto-generated.

### mcp/ (13 rules) - AUTO-GEN all

### plugin/ (12 rules) - AUTO-GEN all

### lsp/ (8 rules) - AUTO-GEN all

### settings/ (5 rules) - AUTO-GEN all

### hooks/ (3 rules) - AUTO-GEN all

### output-styles/ (3 rules) - AUTO-GEN all

### commands/ (2 rules) - AUTO-GEN all

### Other Rule Files

| Current Path | Action | Notes |
|---|---|---|
| `docs/rules/TEMPLATE.md` | DELETE | Development template, not user-facing |
| `docs/rules/index.md` | MIGRATE | `website/rules/overview.md` (hand-written rules index) |

## Project Docs (Internal Planning)

| Current Path | Action | Notes |
|---|---|---|
| `docs/projects/vitepress-docs/*` | DELETE | Planning docs, not migrated to public site |
| `docs/projects/roadmap.md` | ARCHIVE | Move key content to `ROADMAP.md` at repo root if desired |
| `docs/projects/archive/*` | DELETE | Archived project planning docs |

## Summary

| Category | File Count | Action |
|---|---|---|
| Guide docs | 13 | MIGRATE/MERGE into `website/` |
| API docs | 5 | MIGRATE into `website/api/` |
| Rule docs | 117 | AUTO-GEN from metadata |
| Rule index/template | 2 | MIGRATE index, DELETE template |
| Project planning docs | ~20 | DELETE (internal) |
| **Total** | **~157** | **All migrated or deleted** |

## Migration Workflow

### For Each Guide/API Doc

1. Copy file to `website/` destination
2. Add VitePress frontmatter (`title`, `description`)
3. Convert relative links to absolute VitePress paths (`/guide/configuration` not `../configuration.md`)
4. Add VitePress containers where appropriate (`::: tip`, `::: warning`)
5. Test in dev server

### For Rule Docs

1. Read existing rule doc for examples, descriptions, options
2. Port content into TypeScript `meta.docs` on the rule implementation
3. Run `npm run docs:generate` to create VitePress page
4. Verify generated output matches or improves on original
5. Repeat for all 117 rules

### Post-Migration

1. Verify all content is accessible in VitePress
2. Run link checker across entire site
3. Delete `docs/` directory: `git rm -r docs/`
4. Add CI check to prevent `docs/` recreation
5. Update CLAUDE.md, CONTRIBUTING.md, README.md
