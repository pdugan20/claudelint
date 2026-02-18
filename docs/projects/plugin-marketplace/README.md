# Plugin Marketplace Setup

Set up a plugin marketplace in this repo (Option A) to distribute claudelint and future plugins, fix the broken version sync pipeline, update all placeholder documentation, and scaffold a new GitHub project for a docs-tools plugin.

## Project Goals

1. **Create marketplace.json**: Add `.claude-plugin/marketplace.json` to this repo with claudelint as the first plugin
2. **Fix release pipeline**: The `sync-versions.ts` script references files that don't exist; fix before next release
3. **Improve installation UX**: Redesign CLI install-plugin command as interactive setup wizard with global/local/project guidance
4. **Update documentation**: Replace all `@marketplace-name` placeholders, document global vs local install, plugin vs npm version sync
5. **Enhance SessionStart hook**: Upgrade dependency checker with version mismatch detection and scope-aware install guidance
6. **Scaffold docs-tools plugin**: Create a new GitHub repo for a documentation plugin with multiple skills (generate, review, scaffold), and list it in this marketplace
7. **Validate end-to-end**: Test marketplace add, plugin install, and skill execution across global and local scenarios

## Architecture Decision: Why Option A

A marketplace is just a catalog with pointers. Each plugin entry has a `source` field that tells Claude Code where to fetch the actual plugin code. Plugins do NOT need to live in the same repo as the marketplace.

**Option A** (marketplace in this repo) was chosen over a standalone marketplace repo because:

- We have 1 plugin today; a separate repo is premature
- The release pipeline already expects `.claude-plugin/marketplace.json` (sync-versions.ts, RELEASING.md)
- Our own validation rules (`plugin-invalid-manifest`, `plugin-marketplace-files-not-found`) dogfood against our own marketplace.json
- Cross-repo plugins work seamlessly via GitHub source type:

```json
{
  "name": "docs-tools",
  "source": { "source": "github", "repo": "pdugan20/claude-docs-tools" }
}
```

When the plugin count grows significantly, we can extract the marketplace into its own repo. The marketplace name stays the same, so users just update their marketplace source.

**Reference:** [Plugin marketplaces docs](https://code.claude.com/docs/en/plugin-marketplaces), specifically the "Marketplace sources vs plugin sources" callout.

## Marketplace Name Decision

**Chosen name:** `pdugan20-plugins`

Rationale:

- Matches GitHub username (`pdugan20`), which is the namespace users see in `/plugin marketplace add pdugan20/claudelint`
- Not tied to claudelint specifically, so it works as a multi-plugin catalog
- Reserved names to avoid: `claude-code-marketplace`, `claude-code-plugins`, `claude-plugins-official`, `anthropic-marketplace`, `anthropic-plugins`, `agent-skills`, `life-sciences`

User experience:

```bash
# Add the marketplace (one-time)
/plugin marketplace add pdugan20/claudelint

# Install claudelint
/plugin install claudelint@pdugan20-plugins

# Later, install other plugins from the same marketplace
/plugin install docs-tools@pdugan20-plugins
```

## Key Technical Findings

### Plugin auto-updates

Third-party marketplaces (ours) have **auto-update disabled by default**. Users must either:

- Enable auto-update per marketplace in `/plugin` > Marketplaces > "Enable auto-update"
- Manually run `/plugin marketplace update pdugan20-plugins`

Official Anthropic marketplaces auto-update by default. Our docs should explain this and recommend enabling auto-update.

### Plugin scopes (global install is supported)

Users can install the plugin at three scopes:

| Scope | Meaning | Who sees it |
|-------|---------|-------------|
| **User** (default) | Installed across ALL projects for that user | Just that user |
| **Project** | Written to `.claude/settings.json` | All collaborators on the repo |
| **Local** | In that repo only, not committed | Just that user, just that repo |

The default for `/plugin install` is **user scope** (global). This is the recommended scope for claudelint since it's useful across all projects.

### The npm dependency problem

The plugin is a thin wrapper around the npm package. The dependency chain:

```text
Plugin (user scope, global) --> Skill (validate-all) --> Bash(claudelint check-all) --> npm binary
```

If a user installs the plugin globally but only has the npm package in one project, skills fail in other projects. This is the **same pattern as LSP plugins** (pyright-lsp requires pyright-langserver in PATH).

**Solution**: For user-scope plugin installs, recommend `npm install -g claude-code-lint`. For project-scope, recommend `npm install --save-dev claude-code-lint`.

### Global npm install is safe

Verified: all file discovery uses `process.cwd()`, and package-internal files (presets, version) use `__dirname`. No hardcoded paths assume the package is in the project's `node_modules/`. Key safe patterns:

- `findFiles()`, `findClaudeMdFiles()`, all discovery functions: default to `process.cwd()`
- Config resolution (`findConfigFile`): walks up from `process.cwd()`
- `.claudelintignore`: loaded from `process.cwd()`
- Custom rules: loaded from `.claudelint/rules` relative to `process.cwd()`
- Built-in presets: loaded via `__dirname` (bundled in package)

### Version drift between plugin and npm package

The plugin can auto-update to v0.3.0 while the npm package stays at v0.2.0. No built-in Claude Code mechanism enforces version parity. Our mitigation:

1. **SessionStart hook**: Compare `claudelint --version` against plugin version, warn on mismatch
2. **Documentation**: State that npm package version should match plugin version
3. **Graceful degradation**: Older CLI just won't have newest rules — skills still work

## Current State

### What exists

| Item | Location | Status |
|------|----------|--------|
| Plugin manifest | `.claude-plugin/plugin.json` | Complete |
| 9 skills | `skills/` | Complete |
| Plugin README | `.claude-plugin/README.md` | Complete |
| SessionStart hook | `.claude-plugin/scripts/check-dependency.sh` | Complete |
| Marketplace validation rules | `src/rules/plugin/plugin-invalid-manifest.ts`, `plugin-marketplace-files-not-found.ts` | Complete |
| Marketplace Zod schema | `src/validators/schemas.ts` | Complete |
| Marketplace JSON schema | `schemas/marketplace.schema.json` | Complete |
| Schema tests | `tests/schemas/marketplace.schema.test.ts` (28 cases) | Complete |
| Website schema docs | `website/api/schemas/marketplace.md` | Complete |

### What's broken or missing

| Item | Issue |
|------|-------|
| `.claude-plugin/marketplace.json` | Does not exist. Referenced by sync-versions.ts and RELEASING.md |
| `sync-versions.ts` line 44 | Reads `plugin.json` from repo root, but it lives at `.claude-plugin/plugin.json` |
| RELEASING.md line 88 | References `plugin.json` without path; should be `.claude-plugin/plugin.json` |
| Website plugin page line 34 | Placeholder: `claudelint@marketplace-name` |
| CLI install-plugin command line 30 | Placeholder: `claudelint@marketplace-name` |
| Marketplace install Option 3 | No instructions for adding the marketplace first (`/plugin marketplace add`) |
| No global install guidance | Website and CLI only show `--save-dev`; no guidance for global npm install |
| No scope explanation | Docs don't explain user/project/local plugin scopes or which to choose |
| SessionStart hook limited | Only checks binary presence, not version mismatch or install scope awareness |
| No auto-update docs | Users don't know third-party marketplace auto-update is off by default |
| Getting-started page | Plugin section (lines 70-84) is minimal, no marketplace instructions |
| Plugin README lines 65-71 | Placeholder `claudelint@marketplace-name` |

## Documentation

- **[tracker.md](./tracker.md)** - Phase-by-phase task tracker with checklists
- **[design.md](./design.md)** - marketplace.json design and new plugin repo structure (created during Phase 1)

## Implementation Phases

### Phase 1: Create marketplace.json [Not Started]

Create the marketplace file with claudelint as the initial plugin entry. Use all appropriate optional fields.

**Key files:** `.claude-plugin/marketplace.json`

### Phase 2: Fix Version Sync Pipeline [Not Started]

Fix `sync-versions.ts` to read `.claude-plugin/plugin.json` (not root `plugin.json`). Update marketplace.json version field. Update RELEASING.md references.

**Key files:** `scripts/util/sync-versions.ts`, `RELEASING.md`

### Phase 3: Enhance Installation UX [Not Started]

Redesign the CLI install-plugin command as an interactive setup wizard. Upgrade the SessionStart hook to detect version mismatches and recommend the right install method based on context.

**Key files:** `src/cli/commands/install-plugin.ts`, `.claude-plugin/scripts/check-dependency.sh`

### Phase 4: Update Documentation [Not Started]

Replace all placeholder marketplace references with real install syntax. Add global vs local install guidance, scope explanations, auto-update instructions, and version sync documentation.

**Key files:** `website/integrations/claude-code-plugin.md`, `website/guide/getting-started.md`, `.claude-plugin/README.md`

### Phase 5: Testing and Validation [Not Started]

Run dogfood, schema tests, and manual install flows. Test both global and local npm installs with user-scope and project-scope plugin installs.

**Key files:** `tests/schemas/marketplace.schema.test.ts`

### Phase 6: Scaffold docs-tools Plugin Repo [Not Started]

Create a new GitHub repo (`pdugan20/claude-docs-tools`) with a Claude Code plugin containing multiple documentation skills (generate README, generate CLAUDE.md, scaffold docs site, review docs, update docs). Each skill includes templates, scripts, reference files, and examples.

**Key files:** New repo

### Phase 7: Add docs-tools to Marketplace [Not Started]

Add the new plugin to this marketplace using a GitHub source. Test cross-repo installation.

**Key files:** `.claude-plugin/marketplace.json`

## Success Criteria

- [ ] `marketplace.json` passes our own validation (`npm run check:self` reports 0 errors)
- [ ] `npm run sync:versions` runs without errors
- [ ] `npm run release:dry` completes successfully
- [ ] All website/CLI docs show real marketplace name and install syntax
- [ ] CLI install-plugin provides interactive setup wizard with scope/install choices
- [ ] SessionStart hook detects version mismatches and gives scope-aware guidance
- [ ] Website clearly documents global vs local install, plugin scopes, and auto-update behavior
- [ ] Global npm install + user-scope plugin tested end-to-end across two different projects
- [ ] Local npm install + project-scope plugin tested end-to-end
- [ ] Local marketplace install works: `/plugin marketplace add ./` then `/plugin install claudelint@pdugan20-plugins`
- [ ] docs-tools repo exists on GitHub with valid plugin structure
- [ ] docs-tools appears in marketplace and can be installed

## Resources

- [Discover and install plugins](https://code.claude.com/docs/en/discover-plugins) - User-facing install docs
- [Create and distribute a plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces) - Marketplace creation guide
- [Plugins reference](https://code.claude.com/docs/en/plugins-reference) - Full plugin specification
- [Plugin settings](https://code.claude.com/docs/en/settings#plugin-settings) - Team configuration options
