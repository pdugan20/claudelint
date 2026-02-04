# Organization Guide

This guide explains how to structure CLAUDE.md and .claude/rules/ files for maintainability and clarity.

## Section Organization Principles

### Principle 1: Specific Before General

Put project-specific content first, general guidance last:

```markdown
# CLAUDE.md

## Project Overview
Unique context about THIS project.

## Project-Specific Rules
Rules that only apply here.

@import .claude/rules/git-workflow.md
@import .claude/rules/testing.md

## General Development Guidance
(If needed, but prefer removing generic advice)
```

**Why?** Claude sees project-specific context first, making responses more relevant.

### Principle 2: Logical Grouping

Group related sections together:

```markdown
## Development Workflow
@import .claude/rules/git-workflow.md
@import .claude/rules/testing.md
@import .claude/rules/deployment.md

## Code Standards
@import .claude/rules/style-guide.md
@import .claude/rules/typescript.md
@import .claude/rules/naming-conventions.md

## Architecture
@import .claude/rules/api-design.md
@import .claude/rules/database-schema.md
```

### Principle 3: Progressive Detail

Start broad, then narrow:

```markdown
## Overview
High-level project description.

## Architecture
System design and patterns.

## Implementation Details
Specific coding rules.

## Deployment
Environment-specific guidance.
```

## When to Split vs. Consolidate

### Split When

**1. Section exceeds 100 lines:**

```markdown
<!-- Split this -->
## Git Workflow
(500 lines of git rules)

<!-- Into -->
@import .claude/rules/git-workflow.md
```

**2. Content is file-type-specific:**

```markdown
<!-- Split TypeScript rules -->
@import .claude/rules/typescript.md  (glob: "**/*.ts")
```

**3. Topic is self-contained:**

```markdown
<!-- API design is independent topic -->
@import .claude/rules/api-design.md
```

**4. File size exceeds 30KB:**

Must split to reduce CLAUDE.md size.

### Consolidate When

**1. Sections are too small:**

```markdown
<!-- DON'T: Too granular -->
@import .claude/rules/git-commits.md (20 lines)
@import .claude/rules/git-branches.md (15 lines)
@import .claude/rules/git-pull-requests.md (25 lines)

<!-- DO: Consolidate -->
@import .claude/rules/git-workflow.md (60 lines)
```

**2. Content is tightly coupled:**

```markdown
<!-- DON'T: Artificially split -->
@import .claude/rules/database-schema.md
@import .claude/rules/database-queries.md
@import .claude/rules/database-migrations.md

<!-- DO: Keep related content together -->
@import .claude/rules/database.md
```

**3. You have 10+ import files:**

Too many files becomes hard to maintain. Consolidate similar topics.

## Frontmatter Best Practices

### Using Glob Patterns

Scope rules to specific files with glob frontmatter:

```markdown
---
glob: "**/*.test.ts"
---

# Testing Standards

These rules apply only to test files.
```

**Benefits:**

- Claude only sees rules when working on matching files
- More efficient context usage
- Clearer rule applicability

### Common Glob Patterns

**Technology-specific:**

```yaml
# TypeScript files
glob: "**/*.{ts,tsx}"

# JavaScript files
glob: "**/*.{js,jsx}"

# Python files
glob: "**/*.py"

# Test files
glob: "**/*.test.{ts,js}"
```

**Directory-specific:**

```yaml
# API layer
glob: "src/api/**/*.ts"

# Frontend components
glob: "src/components/**/*.tsx"

# Database layer
glob: "src/db/**/*.ts"
```

**Multiple patterns:**

```yaml
# Source and library directories
glob: "{src,lib}/**/*.ts"

# All markdown except README
glob: "**/*.md"
exclude: "README.md"
```

### When to Use Frontmatter

**Use frontmatter when:**

- Rules only apply to specific file types
- Rules are directory-scoped
- You want to reduce context for unrelated files

**Don't use frontmatter when:**

- Rules apply globally (git workflow, commit messages)
- Rules are general project guidance
- File is imported for context, not rules

## File Naming Conventions for .claude/rules/

### Descriptive Names

Use clear, kebab-case names that describe content:

- `git-workflow.md` - Git processes
- `testing.md` - Testing standards
- `api-design.md` - API patterns
- `database-schema.md` - Database rules
- `style-guide.md` - Code formatting

### Technology Prefixes

When multiple techs exist, use prefixes:

- `react-components.md` - React patterns
- `vue-components.md` - Vue patterns
- `node-server.md` - Node.js backend
- `python-api.md` - Python API layer

### Scope Suffixes

Indicate scope when needed:

- `typescript-strict.md` - TypeScript strict mode rules
- `testing-unit.md` - Unit testing only
- `api-rest.md` - REST API conventions
- `api-graphql.md` - GraphQL conventions

### Avoid Generic Names

Don't use vague names:

- ❌ `rules.md` - What rules?
- ❌ `config.md` - What config?
- ❌ `notes.md` - What notes?
- ❌ `misc.md` - Too generic

Use specific names:

- ✅ `commit-message-format.md`
- ✅ `code-review-checklist.md`
- ✅ `deployment-procedure.md`

## Structuring for Maintainability

### Keep Files Focused

Each file should have one clear purpose:

```text
✅ git-workflow.md
   - Commit format
   - Branch strategy
   - PR process

❌ git-and-testing-and-deployment.md
   - Too many topics
   - Hard to find specific guidance
```

### Use Consistent Formatting

Within .claude/rules/ files, use consistent structure:

```markdown
---
glob: "pattern"
---

# Title

## Overview
Brief description of rules.

## Section 1
Specific guidance.

## Section 2
More guidance.

## Examples
Concrete examples.
```

### Document "Why" Not Just "What"

Explain reasoning behind rules.

DON'T: Just list rules

```markdown
## Naming

- Use camelCase for variables
- Use PascalCase for classes
```

DO: Explain reasoning

```markdown
## Naming Conventions

Use camelCase for variables and functions for consistency.

Use PascalCase for classes and components to distinguish types.

**Why?** Consistent naming makes code searchable and reduces
cognitive load when reading unfamiliar code.
```

## Project-Specific vs. Global Rules

### Project-Specific Rules (in CLAUDE.md or .claude/rules/)

Content unique to YOUR project:

- Architecture decisions for THIS app
- API endpoints THIS project uses
- Database schema for THIS database
- Team conventions for THIS team
- Deployment process for THIS infrastructure

### Global Rules (avoid or minimize)

Content Claude already knows:

- General programming principles
- Language syntax rules
- Framework documentation
- Industry best practices
- Generic advice

**Keep project-specific, remove global.**

## Organizational Anti-Patterns

### Anti-Pattern 1: Too Many Top-Level Sections

```markdown
❌ CLAUDE.md with 25 headings:
# Git
# Testing
# Linting
# Formatting
# Deployment
# Database
# API
...
(20 more headings)
```

**Fix:** Group related sections, use @imports.

### Anti-Pattern 2: Deeply Nested Imports

```markdown
❌ CLAUDE.md
  → @import .claude/rules/all-rules.md
      → @import .claude/rules/backend.md
          → @import .claude/rules/api.md
              (Too deep!)
```

**Fix:** Flatten structure, import directly from CLAUDE.md.

### Anti-Pattern 3: Scattered Import Files

```text
❌ project/
   ├── rules/git.md
   ├── docs/testing.md
   ├── .claude/api-rules.md
   └── style-guide.md
```

**Fix:** Consolidate all imports in `.claude/rules/`.

### Anti-Pattern 4: Duplicate Content

```markdown
❌ Same git workflow in:
- CLAUDE.md
- .claude/rules/git-workflow.md
- .claude/rules/backend.md
```

**Fix:** Define once, reference via @import.

## Quick Decision Tree

**Should I split this section?**

```text
Is section > 100 lines?
├─ Yes: Split to @import
└─ No: Keep in CLAUDE.md (if < 30KB total)

Is content file-type-specific?
├─ Yes: Split with glob frontmatter
└─ No: Keep in CLAUDE.md

Is topic self-contained?
├─ Yes: Consider @import
└─ No: Keep inline

Is CLAUDE.md > 30KB?
├─ Yes: Must split largest sections
└─ No: Splitting is optional
```

**Should I consolidate these files?**

```text
Are files < 50 lines each?
├─ Yes: Consolidate
└─ No: Keep separate

Is content tightly coupled?
├─ Yes: Consolidate
└─ No: Keep separate

Do I have 10+ import files?
├─ Yes: Look for consolidation opportunities
└─ No: Current structure OK
```
