# Plugin Marketplace - Progress Tracker

**Status:** In Progress
**Created:** 2026-02-18
**Last Updated:** 2026-02-18

---

## Phase 1: Create marketplace.json

Create `.claude-plugin/marketplace.json` with claudelint as the first plugin.

### 1.1 Design marketplace.json content

- [x] Choose marketplace name: `pdugan20-plugins`
- [x] Decide on all fields to include (see field inventory below)
- [x] Decide on `metadata.pluginRoot` — not needed since claudelint is at repo root (`"./"`), but consider for future plugins
- [x] Decide `strict` mode — default `true` is correct (plugin.json is authority)

### 1.2 Create the file

- [x] Create `.claude-plugin/marketplace.json` with this structure:

```json
{
  "name": "pdugan20-plugins",
  "description": "Plugins for validating, linting, and improving Claude Code projects.",
  "version": "0.2.0-beta.1",
  "owner": {
    "name": "Pat Dugan",
    "email": "dugan.pat@gmail.com"
  },
  "metadata": {
    "description": "Plugins for validating, linting, and improving Claude Code projects."
  },
  "plugins": [
    {
      "name": "claudelint",
      "source": "./",
      "description": "A comprehensive linter for Claude Code projects. Validates CLAUDE.md, skills, settings, hooks, MCP servers, plugins, and more.",
      "version": "0.2.0-beta.1",
      "author": {
        "name": "Pat Dugan"
      },
      "homepage": "https://claudelint.com",
      "repository": "https://github.com/pdugan20/claudelint",
      "license": "MIT",
      "keywords": ["validation", "linting", "developer-tools", "code-quality", "claude-code"],
      "category": "developer-tools"
    }
  ]
}
```

### 1.3 Field inventory (completeness check)

Verify all useful fields from the [marketplace schema](https://code.claude.com/docs/en/plugin-marketplaces#marketplace-schema) are used:

**Marketplace-level fields:**

| Field | Include? | Value | Notes |
|-------|----------|-------|-------|
| `name` | Yes | `pdugan20-plugins` | Required. Kebab-case, no spaces. |
| `description` | Yes | Multi-plugin catalog description | Top-level optional field |
| `version` | Yes | Synced from package.json | For version sync pipeline |
| `owner.name` | Yes | `Pat Dugan` | Required |
| `owner.email` | Optional | TBD | Consider adding for contact |
| `metadata.description` | Yes | Same as top-level | Claude Code reads this field |
| `metadata.version` | Skip | Redundant with top-level `version` | |
| `metadata.pluginRoot` | Skip | Not needed — only 1 local plugin at root | Would be useful if plugins were in subdirs |

**Plugin entry fields:**

| Field | Include? | Value | Notes |
|-------|----------|-------|-------|
| `name` | Yes | `claudelint` | Required. Must match plugin.json name |
| `source` | Yes | `"./"` | Relative path — plugin is at repo root |
| `description` | Yes | From plugin.json | Shown in Discover tab |
| `version` | Yes | Synced from package.json | Version sync pipeline |
| `author.name` | Yes | `Pat Dugan` | |
| `homepage` | Yes | `https://claudelint.com` | Links to docs site |
| `repository` | Yes | GitHub URL | Links to source |
| `license` | Yes | `MIT` | Matches package.json |
| `keywords` | Yes | Relevant search terms | Helps plugin discovery |
| `category` | Yes | `developer-tools` | Organization in Discover tab |
| `tags` | Skip | Nearly identical to `keywords` per docs; official examples don't use it | Redundant |
| `strict` | Skip | Default `true` is correct | plugin.json is the authority |
| `commands` | Skip | Auto-discovered from plugin.json | Not needed in strict mode |
| `agents` | Skip | None defined | |
| `hooks` | Skip | Defined in plugin.json | Not needed in strict mode |
| `mcpServers` | Skip | None defined | |
| `lspServers` | Skip | None defined | |
| `outputStyles` | Skip | None defined | |

### 1.4 Validate the file

- [x] Run `npm run build && npm run check:self` — marketplace.json should be picked up by plugin validator
- [x] Verify no `plugin-invalid-manifest` violations
- [x] Verify no `plugin-marketplace-files-not-found` violations
- [x] Run schema tests: `npm test -- tests/schemas/marketplace.schema.test.ts`

---

## Phase 2: Fix Version Sync Pipeline

The release pipeline will crash on the next release because of incorrect file references.

### 2.1 Fix sync-versions.ts

Current bug: line 44 reads `path.join(rootDir, 'plugin.json')` but plugin.json lives at `.claude-plugin/plugin.json`.

- [x] Update line 44: change `path.join(rootDir, 'plugin.json')` to `path.join(rootDir, '.claude-plugin', 'plugin.json')`
- [x] Verify marketplace.json sync at line 64 is correct (it already reads from `.claude-plugin/marketplace.json`)
- [x] Add marketplace version sync: the script syncs top-level `version`, but also needs to sync `plugins[0].version` for the claudelint entry
- [x] Run `npm run sync:versions` to verify it completes without errors
- [x] Run `npm run sync:versions:check` to verify it detects sync state correctly
- [x] Fix same bug in `scripts/check/version-sync.ts` (line 45 had same wrong path)
- [x] Add `plugins[0].version` check to version-sync.ts
- [x] Make integration example check graceful when `examples/integration/` doesn't exist

### 2.2 Update RELEASING.md

- [x] Line 88: change `plugin.json` to `.claude-plugin/plugin.json`
- [x] Verify line 89 (`.claude-plugin/marketplace.json`) is already correct
- [x] Add note that marketplace plugin entry version is also synced

### 2.3 Verify release dry run

- [x] Run `npm run release:dry` — reaches npm publish step (fails at auth, expected in local dev)
- [x] Verify the `after:bump` hook triggers sync-versions correctly

---

## Phase 3: Enhance Installation UX

Redesign the CLI install-plugin command and upgrade the SessionStart dependency hook.

### 3.1 Redesign CLI install-plugin command

File: `src/cli/commands/install-plugin.ts`

The current command just prints static text. Redesign as an interactive setup wizard using AskUserQuestion-style prompts (or structured output at minimum).

**New flow:**

```text
$ claudelint install-plugin

  claudelint Plugin Setup
  =======================

  Step 1: Install the npm package

  How will you use claudelint?

  > Across all projects (recommended)     npm install -g claude-code-lint
  > In this project only                   npm install --save-dev claude-code-lint

  Step 2: Install the Claude Code plugin

  How do you want to install the plugin?

  > From marketplace (recommended)
    1. Add the marketplace:  /plugin marketplace add pdugan20/claudelint
    2. Install the plugin:   /plugin install claudelint@pdugan20-plugins

  > For development/testing
    claude --plugin-dir ./node_modules/claude-code-lint

  Step 3: Verify

  Run inside Claude Code:  /validate-all
```

Tasks:

- [x] Restructure install-plugin as a multi-step guided output
- [x] Present global vs local npm install options with clear recommendations
- [x] Show marketplace add + install as the primary method (not plugin-dir)
- [x] Add scope explanation (user/project/local) for the plugin install step
- [x] Auto-detect: if `claudelint` is already in PATH or node_modules, say so
- [x] Auto-detect: if running inside a project with `claude-code-lint` in package.json, tailor the output
- [x] Add `--json` flag support for programmatic consumption (optional, low priority)
- [x] Add verification step showing how to test the install worked
- [x] After install steps, remind user that auto-update is off by default for third-party marketplaces
- [x] Show how to enable: `/plugin` > Marketplaces > select `pdugan20-plugins` > "Enable auto-update"

### 3.2 Upgrade SessionStart hook

File: `.claude-plugin/scripts/check-dependency.sh`

Current hook only checks if the binary exists. Enhance to:

- [x] Check for version mismatch between plugin and npm package
- [x] Read plugin version from hardcoded PLUGIN_VERSION (synced by sync-versions.ts)
- [x] Compare against `claudelint --version` output
- [x] If binary not found: recommend both global and local install
- [x] If binary found but version mismatch: warn with upgrade command
- [x] Keep output concise — single-line for success, 3-4 lines for warnings

**Enhanced script structure:**

```bash
#!/usr/bin/env bash
# SessionStart hook: verify claudelint CLI is available and version-compatible.

PLUGIN_VERSION="0.2.0-beta.1"  # Updated by sync-versions

# Check global install
if command -v claudelint >/dev/null 2>&1; then
  CLI_VERSION=$(claudelint --version 2>/dev/null || echo "unknown")
  if [ "$CLI_VERSION" != "$PLUGIN_VERSION" ] && [ "$CLI_VERSION" != "unknown" ]; then
    echo "[claudelint] Version mismatch: plugin=$PLUGIN_VERSION, CLI=$CLI_VERSION"
    echo "[claudelint] Update with: npm install -g claude-code-lint@$PLUGIN_VERSION"
  fi
  exit 0
fi

# Check local install
if npx --no-install claudelint --version >/dev/null 2>&1; then
  CLI_VERSION=$(npx --no-install claudelint --version 2>/dev/null || echo "unknown")
  if [ "$CLI_VERSION" != "$PLUGIN_VERSION" ] && [ "$CLI_VERSION" != "unknown" ]; then
    echo "[claudelint] Version mismatch: plugin=$PLUGIN_VERSION, CLI=$CLI_VERSION"
    echo "[claudelint] Update with: npm install --save-dev claude-code-lint@$PLUGIN_VERSION"
  fi
  exit 0
fi

echo "[claudelint] The claude-code-lint package is not installed."
echo "[claudelint] Plugin skills require it. Install with:"
echo ""
echo "  All projects:      npm install -g claude-code-lint"
echo "  This project only: npm install --save-dev claude-code-lint"
echo ""
exit 0
```

- [x] Update sync-versions.ts to also update `PLUGIN_VERSION` in check-dependency.sh
- [x] Test hook with: global install + matching version, global install + mismatched version, local install only, no install (tested in Phase 7)

### 3.3 Build and verify

- [x] Run `npm run build` — ensure install-plugin.ts changes compile
- [x] Run `npm run lint` — no new violations (99 pre-existing Vue warnings unrelated)
- [x] Test `claudelint install-plugin` output manually
- [x] Test `claudelint install-plugin --json` output

---

## Phase 4: Update Documentation

Replace all placeholders and add comprehensive installation guidance.

### 4.1 Update website plugin guide

File: `website/integrations/claude-code-plugin.md`

This is the primary plugin documentation page. Major updates needed:

**Installation section (lines 9-37) — full rewrite:**

- [x] Add "Prerequisites" as first subsection with npm install (global AND local options)
- [x] Explain when to use global vs local npm install:
  - Global: you want claudelint in every project, you're an individual developer
  - Local (devDependency): you want the team to use a pinned version, CI integration
- [x] Replace "From a Marketplace" section with step-by-step marketplace install:

````markdown
### From the Marketplace

1. Add the marketplace (one-time):

   ```bash
   /plugin marketplace add pdugan20/claudelint
   ```

2. Install the plugin:

   ```bash
   /plugin install claudelint@pdugan20-plugins
   ```

Choose your installation scope when prompted:

- **User scope** (default, recommended) — available in all your projects
- **Project scope** — available to all collaborators on this repo
- **Local scope** — available only to you, only in this repo
````

- [x] Keep "Local Development / Testing" section for contributors
- [x] Add "Team Setup" subsection with `.claude/settings.json` example:

```json
{
  "extraKnownMarketplaces": {
    "pdugan20-plugins": {
      "source": {
        "source": "github",
        "repo": "pdugan20/claudelint"
      }
    }
  },
  "enabledPlugins": {
    "claudelint@pdugan20-plugins": true
  }
}
```

**New section: "Keeping Up to Date":**

- [x] Add section explaining auto-update behavior for third-party marketplaces
- [x] Show how to enable auto-update: `/plugin` > Marketplaces > select > "Enable auto-update"
- [x] Show manual update: `/plugin marketplace update pdugan20-plugins`
- [x] Explain that plugin updates and npm package updates are independent
- [x] Recommend updating both when upgrading:

```bash
# Update npm package
npm install -g claude-code-lint@latest
# or for project-local:
npm install --save-dev claude-code-lint@latest

# Update plugin (inside Claude Code)
/plugin marketplace update pdugan20-plugins
```

- [x] Note the SessionStart hook will warn about version mismatches

**New section: "Global vs Project Install":**

- [x] Add a clear decision guide:

| Scenario | npm Install | Plugin Scope |
|----------|------------|--------------|
| Individual developer, all projects | `npm install -g` | User scope |
| Team project, pinned version | `npm install --save-dev` | Project scope |
| Trying it out | `npm install --save-dev` | Local scope |

**Update Troubleshooting section:**

- [x] Add "Skills work in one project but not another" — explain global vs local npm install
- [x] Add "Version mismatch warning" — explain how to resolve
- [x] Add "Auto-update not working" — explain third-party marketplace default

### 4.2 Update website getting-started guide

File: `website/guide/getting-started.md`

- [x] Lines 70-84 "Use with Claude Code" section — expand with marketplace install steps
- [x] Add brief mention of plugin scopes (link to plugin guide for details)
- [x] Show the recommended path: global npm install + marketplace plugin install
- [x] Keep the section concise (it should defer to the plugin guide for full details)

Proposed update:

````markdown
## Use with Claude Code

claudelint is also available as a Claude Code plugin, giving you slash commands
directly inside Claude Code sessions.

**Quick setup:**

1. Install the npm package (if you haven't already):
   ```bash
   npm install -g claude-code-lint
   ```

2. Add the marketplace and install (inside Claude Code):
   ```bash
   /plugin marketplace add pdugan20/claudelint
   /plugin install claudelint@pdugan20-plugins
   ```

Key skills include:

- `/validate-all` — Run all validators at once
- `/optimize-cc-md` — Interactively optimize your CLAUDE.md
- `/format-cc` — Auto-format Claude Code files

See the [Claude Code Plugin Guide](/integrations/claude-code-plugin) for
team setup, plugin scopes, and troubleshooting.
````

### 4.3 Update .claude-plugin/README.md

File: `.claude-plugin/README.md`

- [x] Lines 65-71: Replace placeholder `claudelint@marketplace-name` with real syntax
- [x] Add the marketplace add step before the install step
- [x] Update "Prerequisites" section to show both global and local npm install options
- [x] Add a "Keeping Up to Date" section that includes:
  - Auto-update is off by default for third-party marketplaces — recommend enabling it
  - How to enable: `/plugin` > Marketplaces > select `pdugan20-plugins` > "Enable auto-update"
  - Manual update command: `/plugin marketplace update pdugan20-plugins`
  - Link to website plugin guide for full details on version sync

### 4.4 Update website marketplace schema docs

File: `website/api/schemas/marketplace.md`

- [x] Update example at bottom to use our actual marketplace.json (or a close variant)
- [x] Verify field documentation matches current schema (added `url` to owner and author)

### 4.5 Build and verify

- [x] Run `npm run docs:build` — ensure website builds without errors
- [x] Run `npm run lint` — ensure no lint violations introduced
- [x] Visually review key pages in `npm run docs:dev`

---

## Phase 5: Automated Testing

### 5.1 Dogfood validation

- [x] Run `npm run check:self` — verify marketplace.json passes our own rules
- [x] Confirm 0 errors, 0 warnings related to marketplace/plugin validation

### 5.2 Schema tests

- [x] Run `npm test -- tests/schemas/marketplace.schema.test.ts` — all existing tests pass (29/29)
- [x] Add a test case that validates our actual marketplace.json against the schema
- [x] Run full test suite: `npm test` (1679/1679 pass, 203 suites)

### 5.3 Sync versions test

- [x] Temporarily change version in package.json (set to 9.9.9-test)
- [x] Run `npm run sync:versions`
- [x] Verify `.claude-plugin/plugin.json` version updated
- [x] Verify `.claude-plugin/marketplace.json` version updated (top-level AND plugins[0].version)
- [x] Verify `check-dependency.sh` PLUGIN_VERSION updated
- [x] Revert test changes

---

## Phase 6: Release and Deploy

### 6.1 Push and make repo public

- [x] Push all commits to GitHub
- [x] Make repo public: `gh repo edit pdugan20/claudelint --visibility public`

### 6.2 Version bump and publish

- [x] Decide version: `0.2.0-beta.2` (graduate to `0.2.0` after all testing)
- [x] Run release: `npx release-it 0.2.0-beta.2`
- [x] Verify npm package published
- [x] Create GitHub Release with changelog
- [x] Fix sync-versions.ts to run prettier after writing JSON (prevents CI formatting drift)
- [x] Auto-set GITHUB_TOKEN from `gh auth token` in all release scripts

### 6.3 Deploy website

- [x] Deploy docs to claudelint.com (auto-deploys on push via Vercel)
- [x] Verify plugin guide page is live with marketplace instructions
- [x] Verify getting-started page is live with updated "Use with Claude Code" section

---

## Phase 7: End-to-End Manual Testing

Test everything as a real developer would, against the published package and public repo.

### 7.1 CLI smoke test

- [x] Open a project that does NOT have `claude-code-lint` installed
- [x] Install globally: `npm install -g claude-code-lint`
- [x] Run `claudelint install-plugin` — verify output matches docs
- [x] Run `claudelint init` — verify config setup works
- [x] Run `claudelint` — verify it scans the project
- [x] Run `claudelint install-plugin` from a project WITHOUT it — verify appropriate guidance
- [x] Verify config resolution: create `.claudelintrc.json` in the target project, confirm it's picked up
- [x] Verify `.claudelintignore` in the target project works

Bugs found and fixed:

- Cache invalidation bug: `areFingerprintsValid({})` returned `true` for empty fingerprints, so validators that found 0 files never re-checked. Fixed in `src/utils/cache.ts` — empty fingerprints now return `false`.
- Version prefix bug: `claudelint --version` outputs `claudelint v0.2.0-beta.2` but hook compared against bare `0.2.0-beta.2`. Fixed with `sed 's/^claudelint v//'` in check-dependency.sh.

### 7.2 Marketplace install from GitHub

- [x] Open Claude Code in the test project
- [x] Run `/plugin marketplace add pdugan20/claudelint`
- [x] Verify marketplace resolves from GitHub (not local)
- [x] Run `/plugin install claudelint@pdugan20-plugins`
- [x] Choose User scope — verify plugin installs successfully
- [x] Verify plugin appears in `/plugin` > Installed tab

### 7.3 Plugin functionality

- [x] Run `/validate-all` — verify skill executes (39 findings on nextup-backend, as expected)
- [ ] Try natural language: "Check my Claude Code project" — verify skill triggers
- [ ] Verify all skills appear: `/skills` (filter by "claudelint")

Note: Skills show as `/skill-name` (e.g., `/validate-all`), NOT `/claudelint:skill-name`. All references have been updated — see Phase 7 bugs below.

### 7.4 SessionStart hook

- [x] Start a new Claude Code session — verify hook fires without errors (confirmed via debug logs)
- [x] With matching versions: no output (silent, correct)
- [x] With mismatched versions: Claude mentions mismatch and offers to fix it
- [x] With no npm install: verified locally (outputs install guidance)

Bugs found and fixed:

- Hook path mismatch: `hooks/hooks.json` pointed to `scripts/check/check-dependency.sh` (a simple 14-line CI check) instead of `.claude-plugin/scripts/check-dependency.sh` (the full version-checking hook). Fixed path and deleted the duplicate CI script.
- Hook output mechanism: SessionStart hook stdout/stderr is not shown to users in the terminal. Discovered that JSON `additionalContext` injects into Claude's context, so Claude naturally mentions the warning on the user's first message. Switched from plain text stderr to JSON `additionalContext` output.
- Added hook path validation to `scripts/check/version-sync.ts` — verifies the hook command resolves to a file containing `PLUGIN_VERSION`.

### 7.5 Cross-project and auto-update

- [ ] Open Claude Code in a SECOND project — verify plugin is available (User scope)
- [ ] Test auto-update toggle: `/plugin` > Marketplaces > pdugan20-plugins > Enable auto-update
- [ ] Uninstall and clean up

### Phase 7 bugs requiring follow-up

- [x] **Slash command syntax audit:** Updated all references from `/claudelint:skill-name` to `/skill-name` across docs, CLI output, website, tests, skills, and README. Also added `argument-hint` and `$ARGUMENTS` support to all 9 skills.
- [x] **Hooks documentation audit:** Rewrote `website/integrations/pre-commit.md` — SessionStart command hook stdout goes to Claude's context, not the terminal. Removed misleading format options section. Added prompt hook alternative. Removed duplicate hooks code block from plugin page (replaced with link). Fixed version mismatch troubleshooting on plugin page and troubleshooting guide. Added missing `async` field to hooks schema docs.
- [ ] **Publish new release:** The published plugin on GitHub/npm still has all pre-Phase 7 bugs (hook path, version prefix, output mechanism). Needs a new release after all fixes are complete.

---

## Phase 8: Scaffold docs-tools Plugin Repo

Create a new GitHub repo with a documentation plugin containing multiple skills, each with supporting files.

### 8.1 Define plugin scope

- [ ] Plugin name: `docs-tools` (repo: `pdugan20/claude-docs-tools`)
- [ ] Purpose: A Claude Code plugin with multiple documentation skills
- [ ] This plugin is pure-skill (no npm dependency required) — unlike claudelint, it uses Claude's built-in capabilities
- [ ] Skills to include:

| Skill | Purpose | Key supporting files |
|-------|---------|---------------------|
| `generate-readme` | Generate README.md from project analysis | Templates per project type (library, CLI, app), example outputs |
| `generate-claude-md` | Create CLAUDE.md tailored to project structure | Templates (monorepo, standard), analysis script, best practices reference |
| `scaffold-docs` | Scaffold full documentation site structure | Framework-specific templates (VitePress, Docusaurus, MkDocs), detection script |
| `review-docs` | Review existing docs for quality and completeness | Quality criteria reference, common issues checklist, example review output |
| `update-docs` | Update project docs after code changes | Changelog conventions reference, diff analysis prompts |

### 8.2 Create GitHub repo

- [ ] Create repo: `pdugan20/claude-docs-tools`
- [ ] Set description: "Claude Code plugin for generating, reviewing, and maintaining project documentation"
- [ ] Initialize with MIT license
- [ ] Add `.gitignore`

### 8.3 Set up plugin structure

```text
claude-docs-tools/
├── .claude-plugin/
│   ├── plugin.json
│   └── README.md
├── skills/
│   ├── generate-readme/
│   │   ├── SKILL.md
│   │   ├── templates/
│   │   │   ├── readme-library.md
│   │   │   ├── readme-cli.md
│   │   │   └── readme-app.md
│   │   └── examples/
│   │       └── sample-output.md
│   ├── generate-claude-md/
│   │   ├── SKILL.md
│   │   ├── templates/
│   │   │   ├── claude-md-standard.md
│   │   │   └── claude-md-monorepo.md
│   │   ├── scripts/
│   │   │   └── analyze-project.sh
│   │   └── references/
│   │       └── best-practices.md
│   ├── scaffold-docs/
│   │   ├── SKILL.md
│   │   ├── templates/
│   │   │   ├── vitepress-scaffold.md
│   │   │   ├── docusaurus-scaffold.md
│   │   │   └── mkdocs-scaffold.md
│   │   └── scripts/
│   │       └── detect-framework.sh
│   ├── review-docs/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   │   ├── quality-criteria.md
│   │   │   └── common-issues.md
│   │   └── examples/
│   │       └── review-output.md
│   └── update-docs/
│       ├── SKILL.md
│       └── references/
│           └── changelog-conventions.md
├── CLAUDE.md
├── LICENSE
└── README.md
```

- [ ] Create `.claude-plugin/plugin.json`:

```json
{
  "name": "docs-tools",
  "version": "0.1.0",
  "description": "Generate, review, and maintain project documentation. Includes skills for README, CLAUDE.md, doc site scaffolding, and doc review.",
  "author": {
    "name": "Pat Dugan",
    "url": "https://github.com/pdugan20"
  },
  "homepage": "https://github.com/pdugan20/claude-docs-tools",
  "repository": "https://github.com/pdugan20/claude-docs-tools",
  "license": "MIT",
  "keywords": ["documentation", "scaffolding", "readme", "claude-md", "developer-tools"]
}
```

- [ ] Create each skill's SKILL.md with proper frontmatter (name, description, allowed-tools)
- [ ] Create templates — each should be a well-structured markdown file Claude fills in based on project analysis
- [ ] Create scripts (analyze-project.sh, detect-framework.sh) — used via `!`command`` syntax or `allowed-tools: Bash(...)`
- [ ] Create reference files — detailed guidance loaded on demand (keep SKILL.md under 500 lines per docs recommendation)
- [ ] Create `.claude-plugin/README.md` with usage guide for all 5 skills
- [ ] Create project `CLAUDE.md` with development instructions
- [ ] Push to GitHub

### 8.4 Validate plugin structure

- [ ] Run `claudelint check-all` against the new repo
- [ ] Verify plugin.json passes validation
- [ ] Verify all SKILL.md files pass validation (frontmatter, allowed-tools, file references)
- [ ] Fix any issues

---

## Phase 9: Add docs-tools to Marketplace

### 9.1 Add plugin entry to marketplace.json

- [ ] Add new entry to `.claude-plugin/marketplace.json` plugins array:

```json
{
  "name": "docs-tools",
  "source": {
    "source": "github",
    "repo": "pdugan20/claude-docs-tools"
  },
  "description": "Generate, review, and maintain project documentation. Includes skills for README, CLAUDE.md, doc site scaffolding, and doc review.",
  "version": "0.1.0",
  "author": {
    "name": "Pat Dugan"
  },
  "homepage": "https://github.com/pdugan20/claude-docs-tools",
  "repository": "https://github.com/pdugan20/claude-docs-tools",
  "license": "MIT",
  "keywords": ["documentation", "scaffolding", "readme", "claude-md"],
  "category": "developer-tools",
  "tags": ["docs", "readme", "claude-md", "scaffold", "review"]
}
```

### 9.2 Validate marketplace update

- [ ] Run `npm run check:self` — verify marketplace.json still passes validation
- [ ] Check that `plugin-marketplace-files-not-found` does NOT flag the GitHub source (it should only check relative paths)
- [ ] Run schema tests

### 9.3 Test cross-repo installation

- [ ] Add marketplace locally: `/plugin marketplace add ./`
- [ ] Verify docs-tools appears in Discover tab
- [ ] Install: `/plugin install docs-tools@pdugan20-plugins`
- [ ] Verify Claude Code clones the separate repo and installs successfully
- [ ] Verify all 5 skills from docs-tools are available (`/docs-tools:generate-readme`, etc.)
- [ ] Test at least one skill end-to-end
- [ ] Uninstall and clean up

### 9.4 Update documentation

- [ ] Update website plugin page to mention the marketplace has multiple plugins
- [ ] Consider a dedicated "marketplace" page on the website listing all available plugins
- [ ] Update the marketplace.json example on the schema docs page

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| sync-versions crashes on release | Release blocked | Phase 2 fixes this before next release |
| marketplace name conflicts | Users can't install | Verified `pdugan20-plugins` isn't reserved |
| Relative source `"./"` doesn't resolve | Plugin install fails | Test in Phase 7.2 marketplace install |
| Cross-repo install requires public repo | docs-tools install fails | Ensure repo is public before Phase 9 |
| Plugin entry version drift | Wrong version cached | sync-versions updates plugins[0].version too |
| Global npm install breaks file discovery | Linting wrong files | Verified: all discovery uses `process.cwd()` (safe) |
| User installs plugin globally but npm locally | Skills fail in other projects | SessionStart hook warns + docs guide users to match scopes |
| Plugin auto-updates but npm doesn't | Version mismatch, confusing errors | SessionStart hook compares versions + docs explain update process |
| check-dependency.sh version hardcode drifts | Wrong mismatch warnings | sync-versions updates the script too |

---

## Notes

- The official Claude docs state: "When possible, avoid setting the version in both places. The plugin manifest always wins silently." Since we use `strict: true` (default), the plugin.json version is authoritative. The marketplace entry version is informational/for cache key purposes.
- Auto-updates: Third-party marketplaces have auto-update disabled by default. Users must manually run `/plugin marketplace update pdugan20-plugins` or enable auto-update in the UI.
- The `metadata.pluginRoot` field would let us write `"source": "claudelint"` instead of `"source": "./"` — but with only one local plugin this adds no value. Revisit if we add more local plugins.
- The docs-tools plugin (Phase 8) is a **pure-skill plugin** with no npm dependency. This is an important distinction from claudelint — it demonstrates that not all plugins in our marketplace have the npm sync concern.
- The LSP plugin pattern (pyright-lsp, rust-analyzer-lsp) in the official marketplace validates our "plugin + external binary" architecture. Their approach: plugin installs, binary must be in PATH, errors show in `/plugin` Errors tab.
