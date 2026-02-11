# Information Architecture Plan

Analysis of ESLint and Prettier documentation structures, and proposed information architecture for claudelint documentation.

## Research Analysis

### ESLint Documentation Structure

**URL**: <https://eslint.org/docs/latest/>

**Organization**: Audience-based segmentation (5 main sections)

```text
1. Use ESLint in Your Project (End Users)
   ├── Getting Started
   ├── Core Concepts / Glossary
   ├── Configuration
   │   ├── Configuration Files
   │   ├── Language Options
   │   ├── Rules
   │   ├── Plugins
   │   ├── Parsers
   │   ├── Combining Configs
   │   ├── Ignoring Files
   │   ├── Debugging
   │   └── Migration Guides
   ├── Command Line Interface Reference
   ├── Rules Reference
   │   ├── Rules by Category
   │   └── Individual Rule Pages
   ├── MCP Server Setup
   ├── Feature Flags
   ├── Formatters Reference
   ├── Bulk Suppressions
   ├── Integrations
   └── Troubleshooting

2. Extend ESLint (Plugin Developers)
   ├── Ways to Extend ESLint
   ├── Plugin Creation
   │   ├── Custom Rules Tutorial
   │   ├── Rules
   │   ├── Processors
   │   ├── Languages
   │   └── Flat Config Migration
   ├── Shareable Configurations
   ├── Custom Formatters
   ├── Custom Parsers
   └── Stats Data

3. Integrate ESLint (Integration Developers)
   ├── Node.js API Tutorial
   └── Node.js API Reference

4. Contribute to ESLint (Contributors)
   ├── Code of Conduct
   ├── Bug Reporting
   ├── Architecture
   ├── Development Environment
   ├── Testing
   ├── Pull Request Workflow
   └── Governance

5. Maintain ESLint (Maintainers)
   ├── Maintenance Overview
   ├── Issue/PR Management
   ├── Release Management
   └── Working Groups
```

**Key Strengths**:

- Clear audience segmentation
- Progressive disclosure (basic → advanced)
- Dedicated troubleshooting section
- Strong separation between using and extending
- Comprehensive API documentation
- Migration guides prominently featured

**Weaknesses**:

- Deep nesting can make navigation harder
- Rules reference is separate from configuration
- No quick reference/cheatsheet

### Prettier Documentation Structure

**URL**: <https://prettier.io/docs/>

**Organization**: Task/topic-based (5 main sections)

```text
1. About
   ├── What is Prettier?
   ├── Why Prettier?
   ├── Prettier vs. Linters
   ├── Option Philosophy
   └── Rationale

2. Usage
   ├── Install
   ├── Ignoring Code
   ├── Integrating with Linters
   ├── Pre-commit Hook
   ├── Plugins
   ├── CLI
   ├── API
   ├── Browser
   └── Run Prettier on CI

3. Configuring Prettier
   ├── Options
   ├── Configuration File
   └── Sharing Configurations

4. Editors
   ├── Editor Integration
   ├── WebStorm Setup
   ├── Vim Setup
   └── Watching For Changes

5. Misc
   ├── Technical Details
   ├── Related Projects
   └── For Enterprise
```

**Key Strengths**:

- Extremely simple, flat structure
- Task-oriented (users think "how do I...")
- Fast to navigate (fewer clicks)
- Opinionated approach = less documentation needed
- Strong integration focus (editors, CI, pre-commit)

**Weaknesses**:

- "Misc" is a catch-all category
- Limited extensibility documentation (intentionally)
- No rules reference (by design - opinionated formatter)

### Comparison Matrix

| Aspect                     | ESLint                     | Prettier          | Best for claudelint        |
| -------------------------- | -------------------------- | ----------------- | -------------------------- |
| **Top-level organization** | Audience-based             | Task-based        | Hybrid (audience + task)   |
| **Navigation depth**       | 3-4 levels                 | 2-3 levels        | 2-3 levels (favor flat)    |
| **Rules documentation**    | Separate section           | N/A (no rules)    | Dedicated section + search |
| **API docs**               | Separate section           | Mixed with CLI    | Separate section           |
| **Getting started**        | Within "Use" section       | Prominent         | Prominent + quick start    |
| **Extensibility**          | Dedicated "Extend" section | Minimal           | Dedicated section          |
| **Integrations**           | Within "Use" section       | Dedicated section | Dedicated section          |
| **Troubleshooting**        | Dedicated section          | Scattered         | Dedicated section          |
| **Migration guides**       | Prominent                  | N/A               | As needed                  |

## Proposed Information Architecture for claudelint

### Philosophy

**Hybrid Approach**: Combine ESLint's audience segmentation with Prettier's task-oriented simplicity

**Design Principles**:

1. **Progressive Disclosure**: Basic info first, advanced topics later
2. **Task-Oriented**: Organize by what users want to accomplish
3. **Flat Navigation**: Minimize depth (prefer 2-3 levels max)
4. **Search-First**: Powerful search for rules and config options
5. **Integration-Focused**: Dedicate space to CI/CD, hooks, plugins

### Site Structure

```text
claudelint.dev/
├── /                              # Homepage
│
├── /guide/                        # Getting Started & Guides
│   ├── /getting-started           # Quick start, installation
│   ├── /why-claudelint            # Philosophy, complementary tools
│   ├── /core-concepts             # Glossary, terminology
│   ├── /configuration             # .claudelintrc.json reference
│   ├── /cli-reference             # All CLI commands
│   ├── /inline-disables           # Comment-based disables
│   ├── /auto-fix                  # Auto-fixing issues
│   └── /troubleshooting           # Common issues & solutions
│
├── /validators/                   # Validator Documentation
│   ├── /overview                  # Validator architecture
│   ├── /claude-md                 # CLAUDE.md validator
│   ├── /skills                    # Skills validator
│   ├── /settings                  # Settings validator
│   ├── /hooks                     # Hooks validator
│   ├── /mcp                       # MCP server validator
│   ├── /lsp                       # LSP config validator
│   ├── /plugin                    # Plugin validator
│   ├── /output-styles             # Output styles validator
│   └── /agents                    # Agents validator
│
├── /rules/                        # Rules Reference
│   ├── /overview                  # Rules overview, categories
│   ├── /claude-md/                # CLAUDE.md rules (14 rules)
│   │   ├── /size-error
│   │   ├── /size-warning
│   │   ├── /import-missing
│   │   ├── /import-circular
│   │   └── /...
│   ├── /skills/                   # Skills rules (45 rules)
│   │   ├── /skill-name
│   │   ├── /skill-description
│   │   ├── /skill-missing-shebang
│   │   └── /...
│   ├── /settings/                 # Settings rules (5 rules)
│   ├── /hooks/                    # Hooks rules (3 rules)
│   ├── /mcp/                      # MCP rules (13 rules)
│   ├── /lsp/                      # LSP rules (8 rules)
│   ├── /plugin/                   # Plugin rules (12 rules)
│   ├── /output-styles/            # Output styles rules (3 rules)
│   ├── /agents/                   # Agents rules (12 rules)
│   └── /commands/                 # Commands rules (2 rules)
│
├── /integrations/                 # Integration Guides
│   ├── /overview                  # Integration options
│   ├── /npm-scripts               # package.json scripts
│   ├── /pre-commit                # Pre-commit hooks
│   ├── /github-actions            # GitHub Actions CI
│   ├── /gitlab-ci                 # GitLab CI
│   ├── /monorepos                 # Monorepo setup (NEW - Feb 2026)
│   ├── /claude-code-plugin        # As Claude Code plugin
│   ├── /claude-code-hooks         # SessionStart hooks
│   ├── /vscode                    # VS Code integration (future)
│   └── /formatting-tools          # Prettier, markdownlint, shellcheck
│
├── /api/                          # Programmatic API
│   ├── /overview                  # API introduction
│   ├── /claudelint-class          # Class-based API
│   ├── /functional-api            # Functional API
│   ├── /formatters                # Built-in formatters
│   ├── /types                     # TypeScript types
│   ├── /migration                 # CLI to API migration
│   └── /examples                  # Code examples
│
├── /development/                  # Extending & Contributing
│   ├── /overview                  # Development overview
│   ├── /custom-rules              # Create custom rules
│   ├── /rule-development          # Rule development guide
│   ├── /architecture              # System architecture
│   ├── /validator-guide           # Build validators
│   ├── /plugin-guide              # Build plugins
│   ├── /testing                   # Testing guidelines
│   └── /contributing              # Contributing guide
│
└── /reference/                    # Quick Reference
    ├── /cheatsheet                # Quick command reference
    ├── /exit-codes                # Exit code reference
    ├── /file-naming               # File naming conventions
    ├── /glossary                  # Terminology
    └── /rule-index                # Searchable rule index
```

### Navigation Structure

#### Primary Navigation (Top Bar)

```text
Guide | Validators | Rules | Integrations | API | Development
```

#### Secondary Navigation (Sidebar)

Contextual based on current section (auto-generated from file structure)

#### Utility Navigation

```text
Search | Dark Mode Toggle | GitHub | npm
```

### Content Mapping

Map existing documentation to new structure:

#### Existing → New Structure

```text
CURRENT DOCS/                           NEW DOCS/

docs/getting-started.md           →     /guide/getting-started
docs/configuration.md             →     /guide/configuration
docs/cli-reference.md             →     /guide/cli-reference
docs/inline-disables.md           →     /guide/inline-disables
docs/auto-fix.md                  →     /guide/auto-fix
docs/troubleshooting.md           →     /guide/troubleshooting
docs/glossary.md                  →     /reference/glossary

docs/validation-reference.md      →     /validators/overview
(split by validator type)         →     /validators/{validator-name}

docs/rules/*.md                   →     /rules/{category}/{rule-name}
docs/rules/index.md               →     /rules/overview

docs/formatting-tools.md          →     /integrations/formatting-tools
docs/hooks.md                     →     /integrations/claude-code-hooks
docs/plugin-usage.md              →     /integrations/claude-code-plugin
docs/projects/archive/monorepo-support/user-guide.md → /integrations/monorepos (NEW)
(new integration guides)          →     /integrations/*

docs/api/README.md                →     /api/overview
docs/api/claudelint-class.md      →     /api/claudelint-class
docs/api/functional-api.md        →     /api/functional-api
docs/api/formatters.md            →     /api/formatters
docs/api/types.md                 →     /api/types
docs/api/migration.md             →     /api/migration

docs/custom-rules.md              →     /development/custom-rules
docs/rule-development.md          →     /development/rule-development
docs/contributing-rules.md        →     /development/rule-development
docs/rule-development-enforcement.md → /development/rule-development
docs/architecture.md              →     /development/architecture
CONTRIBUTING.md                   →     /development/contributing

docs/file-naming-conventions.md  →     /reference/file-naming
docs/debugging.md                 →     /guide/troubleshooting
docs/caching.md                   →     /guide/configuration
docs/rule-options-guide.md        →     /development/rule-development
```

#### Content Consolidation

**Merge these documents** (duplicate/overlapping content):

- `rule-development.md` + `contributing-rules.md` + `rule-development-enforcement.md`
  → Single `/development/rule-development` guide

- `debugging.md` + parts of `troubleshooting.md`
  → Enhanced `/guide/troubleshooting`

- `caching.md` content
  → Merge into `/guide/configuration` (caching section)

- `rule-options-guide.md`
  → Merge into `/development/rule-development` (options section)

## Domain Strategy

**Single domain, no subdomain.** Based on research of ESLint, Prettier, Biome, Oxc, and Stylelint, no major project uses a docs subdomain. All use a single domain with path prefixes:

- `claudelint.dev/` - Marketing landing page (hero, features, install snippet)
- `claudelint.dev/guide/` - Getting started, configuration, CLI
- `claudelint.dev/rules/` - Auto-generated rule reference
- `claudelint.dev/api/` - Programmatic API documentation

See [landing-page-spec.md](./landing-page-spec.md) for complete landing page design.

## Homepage Design

### Hero Section

````markdown
# claudelint

Comprehensive linter for Claude Code projects

[Get Started](/guide/getting-started) [View on GitHub](https://github.com/pdugan20/claudelint)

```bash
npm install -g claude-code-lint
claudelint init
claudelint check-all
```
````

### Feature Highlights

#### Fast & Efficient

- Parallel validation (~3.5x speedup)
- Smart caching (~2.4x on warm cache)
- Typical project: <200ms

#### Comprehensive

- 105 validation rules across 10 categories
- Validates CLAUDE.md, skills, settings, hooks, MCP, plugins
- Auto-fix common issues

#### Developer-Friendly

- Interactive setup wizard
- Inline disable comments
- Multiple output formats
- Programmatic API

### Quick Links

- [Why claudelint?](/guide/why-claudelint)
- [CLI Reference](/guide/cli-reference)
- [Browse Rules](/rules/overview)
- [API Documentation](/api/overview)

### Integrations

Visual showcase:

- npm / package.json
- Pre-commit hooks
- GitHub Actions
- Claude Code plugin
- VS Code (coming soon)

## Page Templates

### Rule Page Template

Each of the 117 rules gets its own page following this structure:

````markdown
# rule-name

<Badge type="error">Error</Badge> <Badge type="tip">Auto-fixable</Badge>

Brief one-sentence description.

## Rule Details

Detailed explanation of what this rule checks and why it matters.

## Examples

### [ ] Incorrect

```markdown
(example of code that violates the rule)
```
````

### [x] Correct

```markdown
(example of code that passes the rule)
```

## Options

```json
{
  "rules": {
    "rule-name": ["error", { "option": "value" }]
  }
}
```

## When Not To Use It

Situations where you might want to disable this rule.

## Related Rules

- [other-related-rule](/rules/category/other-related-rule)

## Further Reading

- Links to Claude Code docs
- Related documentation

```text
```

### Validator Page Template

Each of the 10 validators gets its own page:

```markdown
# Validator Name

What this validator checks and why.

## What It Validates

- Feature 1
- Feature 2
- Feature 3

## Rules

List of all rules in this validator with brief descriptions:

| Rule | Severity | Description | Auto-fix |
|------|----------|-------------|----------|
| [rule-name](/rules/category/rule-name) | Error | Description | ✓ |

## Configuration

Example configuration for this validator.

## Examples

Real-world examples and common patterns.

## Troubleshooting

Common issues specific to this validator.
````

### Integration Guide Template

Each integration gets a dedicated guide:

```markdown
# Integration Name

How to integrate claudelint with [tool/platform].

## Prerequisites

- Required tools
- Versions

## Installation

Step-by-step setup instructions.

## Configuration

Configuration examples with explanations.

## Usage

How to use in this context.

## Examples

Complete working examples.

## Troubleshooting

Common issues and solutions.
```

## Special Features

### Interactive Rule Explorer

**Component**: `<RuleExplorer />`

Features:

- Filter by category
- Filter by severity (error/warning)
- Filter by auto-fixable
- Search by name/description
- Sort by name/category

### Configuration Generator

**Component**: `<ConfigGenerator />`

Visual builder for `.claudelintrc.json`:

- Select validators to enable
- Configure rule severity
- Set options visually
- Export JSON config

### Rule Playground

**Component**: `<RulePlayground />`

Try rules with live validation:

- Input CLAUDE.md content
- See validation results
- Toggle rules on/off
- View auto-fix preview

## Search Strategy

### Built-in Search (Phase 1)

VitePress built-in local search (minisearch):

- Fast, offline
- Indexes all content
- No external dependencies

### Algolia DocSearch (Phase 2 - Future)

For better search experience:

- Advanced filtering
- Results ranking
- Mobile-optimized

## Mobile Responsiveness

### Breakpoints

- **Mobile**: < 768px (single column, hamburger menu)
- **Tablet**: 768px - 1024px (collapsible sidebar)
- **Desktop**: > 1024px (full layout)

### Mobile Optimizations

- Sticky search bar
- Simplified navigation
- Code blocks with horizontal scroll
- Touch-friendly interactive components

## Performance Targets

### Build Performance

- Development server start: <1s
- Hot Module Replacement: <100ms
- Production build: <30s for 150+ pages

### Runtime Performance

- Lighthouse score: 95+ all metrics
- First Contentful Paint: <1s
- Time to Interactive: <2s
- Total bundle size: <200KB initial load

## Content Migration Plan

### Phase 1: Core Structure (Week 1)

1. Set up VitePress project
2. Create navigation structure
3. Migrate /guide/ section (8 pages)
4. Create homepage

### Phase 2: Rules & Validators (Week 2)

1. Migrate /validators/ section (10 pages)
2. Create rule page template
3. Migrate all 117 rule pages
4. Build rule index/search

### Phase 3: API & Advanced (Week 3)

1. Migrate /api/ section (6 pages)
2. Migrate /development/ section (7 pages)
3. Migrate /integrations/ section (8 pages)
4. Create /reference/ section (5 pages)

### Phase 4: Interactive Features (Week 4)

1. Build RuleExplorer component
2. Build ConfigGenerator component
3. Build RulePlayground component
4. Add code examples

### Phase 5: Polish & Launch (Week 5)

1. Review all pages
2. Fix broken links
3. Optimize images
4. Set up deployment
5. Configure custom domain
6. Launch claudelint.dev

## Content Guidelines

### Writing Style

- **Tone**: Professional but friendly
- **Voice**: Second person ("you"), active voice
- **Tense**: Present tense
- **Length**: Concise (aim for < 500 words per page)

### Code Examples

- Use syntax highlighting
- Provide both incorrect and correct examples
- Include output/results where relevant
- Keep examples minimal but realistic

### Cross-linking

- Link to related rules
- Link to relevant guides
- Link to API docs from examples
- Keep navigation intuitive

## SEO Strategy

### Meta Tags

```html
<meta name="description" content="Comprehensive linter for Claude Code projects" />
<meta property="og:title" content="claudelint - Lint your Claude Code projects" />
<meta
  property="og:description"
  content="Validate CLAUDE.md, skills, settings, hooks, MCP servers, and plugins"
/>
<meta property="og:image" content="https://claudelint.dev/og-image.png" />
<meta name="twitter:card" content="summary_large_image" />
```

### Sitemap

Auto-generated by VitePress, submitted to:

- Google Search Console
- Bing Webmaster Tools

### Schema.org Markup

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "claudelint",
  "description": "Comprehensive linter for Claude Code projects",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Cross-platform"
}
```

## Next Steps

### Decision Point

#### Option 1: Extend vitepress-docs project

- Add this IA plan to existing project
- Update implementation tracker
- Start building

#### Option 2: Create new docs-ia-research project

- Separate planning from implementation
- Keep detailed research/analysis
- Reference from vitepress-docs

**Recommendation**: Option 1 (extend existing project)

- We already have project structure in place
- This IA plan enhances existing design doc
- Avoids project fragmentation
- Can start implementation immediately

### Immediate Actions

1. Review this IA plan
2. Get feedback on structure
3. Update vitepress-docs/plan.md with refined structure
4. Update implementation-tracker.md with content migration tasks
5. Begin Phase 1 implementation

## Open Questions

1. **Versioning**: Do we need version selector (v1.x, v2.x docs)? ESLint has this, Prettier doesn't.
   - **Recommendation**: Not initially. Add when we have multiple major versions.

2. **Changelog placement**: In docs or keep as CHANGELOG.md in repo?
   - **Recommendation**: Both. Link from docs to GitHub CHANGELOG.md.

3. **Examples location**: Separate `/examples/` section or embedded in guides?
   - **Recommendation**: Embedded in guides + dedicated `/examples/` for complete projects.

4. **API reference generation**: Auto-generate from TypeScript or hand-write?
   - **Recommendation**: Hand-write initially, explore TypeDoc integration later.

5. **Multi-language docs**: Support for non-English?
   - **Recommendation**: English only initially. VitePress supports i18n when needed.

## Success Metrics

### Quantitative

- **Page load time**: <1s (measured via Lighthouse)
- **Search speed**: <100ms (local search response)
- **Build time**: <30s (full site build)
- **Bundle size**: <200KB (initial load)

### Qualitative

- **Findability**: Users can find rule docs in <2 clicks
- **Clarity**: Rule examples are clear and actionable
- **Completeness**: All 117 rules documented
- **Consistency**: Same format across all pages

### User Feedback

- GitHub issues/discussions
- Analytics (page views, search queries)
- Community feedback

## Docs Cleanup Strategy

**After migration, delete the entire `docs/` folder.** See [docs-migration-inventory.md](./docs-migration-inventory.md) for the complete file-by-file mapping.

### Principle

Every piece of documentation exists in exactly one place. The `website/` folder becomes the single source of truth.

### What Goes Where

| Source | Destination |
|---|---|
| `docs/getting-started.md`, `docs/configuration.md`, etc. | `website/guide/` |
| `docs/api/*.md` | `website/api/` |
| `docs/rules/**/*.md` (117 files) | Auto-generated from metadata |
| `docs/architecture.md` | `website/development/architecture.md` |
| `docs/projects/*` | Deleted (internal planning) |
| `docs/rules/TEMPLATE.md` | Deleted (dev template) |

### Migration Approach

**Hard cutover** (recommended over gradual sync):

1. Build VitePress site with all content in `website/`
2. Delete entire `docs/` directory
3. Add CI check to prevent new files in `docs/`
4. Update CLAUDE.md: "Documentation lives in `website/`"

This avoids the "dual docs" problem where content exists in both places during a transition period.

## Conclusion

This information architecture balances ESLint's comprehensive, audience-based approach with Prettier's task-oriented simplicity. The result is:

- **Intuitive navigation** for both new users and power users
- **Comprehensive coverage** of all 117 rules and 10 validators
- **Task-focused guides** for common integrations
- **Powerful search** for quick reference
- **Extensibility** for custom rules and plugins

The structure is designed to scale as claudelint grows while maintaining fast navigation and excellent DX.
