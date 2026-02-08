# Content Specifications

Detailed specifications for new reference files and documentation to be created as part of this project. Use these specs when implementing Sprint 2 tasks.

---

## quality-criteria.md

**File**: `skills/optimize-cc-md/references/quality-criteria.md`
**Task**: T1-3
**Purpose**: Manual review checklist for CLAUDE.md quality, covering aspects that programmatic linting cannot evaluate.

### Design Principles

- This is a **checklist**, not a scoring rubric
- Complements programmatic validation (don't duplicate what the linter already checks)
- Questions should be answerable with yes/no
- Focus on aspects that require human judgment

### Structure

```markdown
# CLAUDE.md Quality Criteria

Manual review checklist for evaluating CLAUDE.md quality.
Use after running `claudelint check-claude-md` to catch issues
that automated validation cannot detect.

## Specificity

- [ ] Does every instruction reference THIS project specifically?
- [ ] Are file paths, command names, and patterns from the actual codebase?
- [ ] Would removing any instruction leave Claude unable to do something project-specific?
- [ ] Are there any instructions that would apply equally to ANY project? (remove those)

## Completeness

- [ ] Does a new developer have enough context to make their first contribution?
- [ ] Are the build, test, and deploy commands documented?
- [ ] Are project-specific conventions explained (naming, patterns, architecture)?
- [ ] Are common pitfalls or gotchas documented?

## Clarity

- [ ] Can each instruction be followed without additional context?
- [ ] Are there contradictory instructions?
- [ ] Is the tone directive ("do X") rather than descriptive ("X is important")?
- [ ] Are examples provided for non-obvious patterns?

## Organization

- [ ] Is the most important information near the top?
- [ ] Are related instructions grouped together?
- [ ] Does the structure use headings that match how a developer would search?
- [ ] Is the @import structure logical (scoped rules in .claude/rules/)?

## Maintenance

- [ ] Is there a process for keeping instructions current?
- [ ] Are version-specific instructions tagged or dated?
- [ ] Do file paths and commands still work?
- [ ] Are deprecated patterns marked or removed?
```

### What NOT to Include

Do not duplicate these checks (already handled by linter rules):

- File size checks (`claude-md-size-warning`, `claude-md-size-error`)
- Import validation (`claude-md-import-missing`, `claude-md-import-circular`)
- Path validation (`claude-md-paths`, `claude-md-file-not-found`)
- Section count (`claude-md-content-too-many-sections`)

---

## templates.md

**File**: `skills/optimize-cc-md/references/templates.md`
**Task**: T1-4
**Purpose**: Annotated, copy-paste-ready CLAUDE.md templates at different complexity levels.

### Design Principles

- Each template is self-contained and copy-pasteable
- Annotations explain WHY each section exists
- Templates progress from simple to complex
- Use realistic project examples, not generic placeholders

### Structure

```markdown
# CLAUDE.md Templates

Annotated templates for creating well-structured CLAUDE.md files.
Copy the template that matches your project complexity and customize.

## Template 1: Minimal (Personal Project)

For small projects with straightforward workflows.

Target: 10-20 lines.

## Template 2: Standard (Team Project)

For team projects with established conventions.

Target: 30-60 lines.

## Template 3: Complex (Multi-Package Project)

For projects with multiple packages, build systems, or deployment targets.

Target: 60-100 lines, with @import references.

## Template 4: Monorepo Root

For monorepo root CLAUDE.md that delegates to workspace-level files.

Target: 20-40 lines at root, workspace files handle specifics.

## Anti-patterns

Common mistakes to avoid when writing CLAUDE.md files.
```

### Template 1 Content Outline (Minimal)

```markdown
# Project Instructions

## Build & Test
- `npm test` to run tests
- `npm run build` to build

## Code Style
- TypeScript strict mode
- Use functional patterns over classes

## Project-Specific Notes
- API keys are in .env (never commit)
- Database migrations run automatically on deploy
```

### Template 2 Content Outline (Standard)

```markdown
# Project Instructions

## Overview
Brief project description and architecture.

## Development Workflow
Build, test, lint commands.
Branch naming and commit conventions.

## Code Standards
Language-specific patterns.
Error handling approach.
Testing requirements.

## Architecture
Key directories and their purposes.
Important design decisions.

## Deployment
Environment-specific notes.
```

### Template 3 Content Outline (Complex)

```markdown
# Project Instructions

## Overview
Architecture and key decisions.

## Quick Reference
Most common commands.

## Standards
@import .claude/rules/typescript.md
@import .claude/rules/testing.md
@import .claude/rules/git-workflow.md

## Architecture
@import .claude/rules/api-conventions.md
@import .claude/rules/database.md
```

### Anti-patterns Section

Include 3-5 common mistakes with before/after:

1. Generic advice ("write clean code")
2. Duplicating tool configs (repeating ESLint rules in CLAUDE.md)
3. Instructions that contradict each other
4. Stale commands that no longer work
5. Over-documenting obvious patterns

---

## file-type-taxonomy.md

**File**: `skills/optimize-cc-md/references/file-type-taxonomy.md`
**Task**: T4-18
**Purpose**: Complete reference of all Claude Code configuration files and their relationships.

### Structure

```markdown
# Claude Code File Type Taxonomy

Complete reference for all configuration files in the Claude Code ecosystem.

## Core Configuration

### CLAUDE.md
- Location: Project root, `.claude/CLAUDE.md`, `~/.claude/CLAUDE.md`
- Purpose: Project instructions and conventions
- Format: Markdown with optional @import directives
- Validated by: `claudelint check-claude-md`

### .claude/settings.json
- Location: `.claude/settings.json`
- Purpose: Permissions, environment variables, hooks
- Format: JSON
- Validated by: `claudelint check-settings`

### .mcp.json
- Location: Project root
- Purpose: MCP server configuration
- Format: JSON
- Validated by: `claudelint check-mcp`

## Skills

### SKILL.md
- Location: `.claude/skills/<name>/SKILL.md` or `skills/<name>/SKILL.md`
- Purpose: Skill definition and instructions
- Format: Markdown with YAML frontmatter
- Validated by: `claudelint validate-skills`

### Reference files
- Location: `<skill-dir>/references/*.md`
- Purpose: Detailed content for progressive disclosure
- Format: Markdown

## Agents

### AGENT.md
- Location: `.claude/agents/<name>/AGENT.md` or `agents/<name>/AGENT.md`
- Purpose: Agent definition and system prompt
- Format: Markdown with YAML frontmatter
- Validated by: `claudelint check-agents`

## Output Styles

### OUTPUT_STYLE.md
- Location: `.claude/output_styles/<name>/OUTPUT_STYLE.md`
- Purpose: Custom output formatting rules
- Format: Markdown with YAML frontmatter
- Validated by: `claudelint check-output-styles`

## Plugin

### plugin.json
- Location: Project root
- Purpose: Plugin manifest for Claude Code plugin system
- Format: JSON
- Validated by: `claudelint check-plugin`

## Rules Files

### .claude/rules/*.md
- Location: `.claude/rules/`
- Purpose: Scoped rules imported via @import
- Format: Markdown with optional glob frontmatter
- Validated by: Part of `claudelint check-claude-md`

## Relationships

[Diagram showing how files reference each other]

CLAUDE.md ──@import──> .claude/rules/*.md
CLAUDE.md ──references──> .claude/settings.json
plugin.json ──declares──> skills/, agents/, hooks
SKILL.md ──links──> references/*.md
.claude/settings.json ──configures──> hooks, permissions
.mcp.json ──configures──> MCP servers
```

### Key Points to Document

1. **Discovery order**: How Claude Code finds and loads config files
2. **Precedence**: What happens when configs conflict (project > user > default)
3. **Scope**: Which files are project-level vs user-level vs global
4. **Validation**: Which `claudelint` command validates each file type

---

## common-fixes.md

**File**: `skills/optimize-cc-md/references/common-fixes.md`
**Task**: Part of T1-2 (trim optimize-cc-md)
**Purpose**: Extracted from SKILL.md lines 152-214

### Content

Move verbatim from SKILL.md:

- File Size Violations section
- Import Issues section
- Organization Problems section

Add a note at the top:

```markdown
# Common Fixes

Quick reference for the most common CLAUDE.md issues and their solutions.
For the full optimization workflow, see the [main skill](../SKILL.md).
```

---

## troubleshooting.md

**File**: `skills/optimize-cc-md/references/troubleshooting.md`
**Task**: Part of T1-2 (trim optimize-cc-md)
**Purpose**: Extracted from SKILL.md lines 394-507

### Content

Move verbatim from SKILL.md:

- All 7 troubleshooting entries with Problem/Cause/Solution structure
- "Skill won't run" through "Skill creates too many small files"

Add a note at the top:

```markdown
# Troubleshooting

Solutions for common problems when using the optimize-cc-md skill.
For the full optimization workflow, see the [main skill](../SKILL.md).
```
