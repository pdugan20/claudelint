# Import Patterns and Best Practices

This guide explains how to organize @imports in CLAUDE.md for better structure and maintainability.

## @import Basics

The @import directive loads content from external files into CLAUDE.md:

```markdown
@import .claude/rules/git-workflow.md
```

**Benefits:**

- Split large CLAUDE.md into focused files
- Organize rules by topic or file type
- Scope rules with glob patterns
- Maintain cleaner file structure

## Directory Structure Recommendations

### Recommended: .claude/rules/

Store all imported files in `.claude/rules/`:

```text
project/
├── CLAUDE.md
└── .claude/
    └── rules/
        ├── git-workflow.md
        ├── testing.md
        ├── style-guide.md
        ├── api-conventions.md
        └── typescript.md
```

**Why .claude/rules/?**

- Conventional location (follows Claude Code patterns)
- Clear separation from skills, hooks, settings
- Easy to find and maintain
- Gitignore-friendly (some teams may not commit)

### Alternative: .claude/context/

Some projects use `.claude/context/` for documentation:

```text
project/
└── .claude/
    └── context/
        ├── architecture.md
        ├── deployment.md
        └── api-design.md
```

Use for **documentation** that provides context, not **rules** that change behavior.

### Avoid: Root-level files

Don't scatter imports across the project:

```text
BAD: project/
   ├── CLAUDE.md
   ├── git-rules.md         # Hard to find
   ├── docs/
   │   └── style-guide.md   # Mixed with user docs
   └── .claude/
```

**Keep imports in .claude/ subdirectories for clarity.**

## File Naming Conventions

Use descriptive, kebab-case names:

- `git-workflow.md` - Git commit, branch, PR rules
- `testing.md` - Test writing standards
- `style-guide.md` - Code formatting, naming
- `api-conventions.md` - REST API patterns
- `database.md` - Schema, query patterns
- `react.md` - React component patterns
- `typescript.md` - TypeScript-specific rules

**Pattern: `{topic}.md` or `{technology}.md`**

Avoid generic names like `rules.md`, `config.md`, or `notes.md`.

## Common Patterns

### Pattern 1: Git Workflow

`.claude/rules/git-workflow.md`:

```markdown
---
glob: "**/*"
---

# Git Workflow

## Commit Messages

Use Conventional Commits format:

- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Code style changes
- refactor: Code refactoring

## Branch Strategy

- main: Production code
- develop: Integration branch
- feature/*: New features
- fix/*: Bug fixes

## Pull Requests

- Require 2 approvals
- All tests must pass
- No merge conflicts
```

### Pattern 2: Testing Standards

`.claude/rules/testing.md`:

```markdown
---
glob: "**/*.test.{ts,js,tsx,jsx}"
---

# Testing Standards

## Test Structure

Use describe/it blocks for test organization.

## Coverage Requirements

- Unit tests: 80% minimum
- Integration tests: Core flows
- E2E tests: Critical user paths

## Mocking

- Mock external APIs
- Mock database calls in unit tests
- Use real database in integration tests
```

### Pattern 3: Technology-Specific Rules

`.claude/rules/typescript.md`:

```markdown
---
glob: "**/*.{ts,tsx}"
---

# TypeScript Standards

## Type Safety

- No `any` types (use `unknown` if needed)
- Enable strict mode in tsconfig.json
- Define interfaces for API responses

## Naming Conventions

- Interfaces: PascalCase (e.g., `UserData`)
- Types: PascalCase (e.g., `UserId`)
- Enums: PascalCase (e.g., `UserRole`)

## Module Structure

- Export public APIs only
- Use barrel exports (index.ts) for modules
- Prefer named exports over default
```

### Pattern 4: Code Style Guide

`.claude/rules/style-guide.md`:

```markdown
---
glob: "src/**/*.{ts,js}"
---

# Code Style Guide

## Formatting

- Use Prettier with default config
- 2 spaces for indentation
- Single quotes for strings
- Trailing commas in objects/arrays

## Naming

- camelCase for variables and functions
- PascalCase for classes and components
- UPPER_SNAKE_CASE for constants
- Prefix private methods with underscore

## Comments

- Use JSDoc for exported functions
- Explain "why", not "what"
- Remove commented-out code before committing
```

### Pattern 5: API Conventions

`.claude/rules/api-conventions.md`:

```markdown
---
glob: "src/api/**/*.ts"
---

# API Conventions

## REST Endpoints

- GET /users - List users
- GET /users/:id - Get user
- POST /users - Create user
- PUT /users/:id - Update user
- DELETE /users/:id - Delete user

## Response Format

Return JSON with success, data, and error fields.

## Error Handling

- 400: Bad Request (validation errors)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

```

## Frontmatter and Glob Patterns

### Using Frontmatter

Add frontmatter to scope rules to specific files:

```markdown
---
glob: "**/*.test.ts"
---

# Testing Rules

These rules only apply to test files.
```

**When Claude reads this file:**

- Rules apply ONLY to files matching `**/*.test.ts`
- Rules are ignored for non-test files
- More efficient context usage

### Glob Pattern Examples

**All TypeScript files:**

```yaml
glob: "**/*.ts"
```

**All test files:**

```yaml
glob: "**/*.test.{ts,js}"
```

**Specific directory:**

```yaml
glob: "src/api/**/*.ts"
```

**Multiple patterns:**

```yaml
glob: "{src,lib}/**/*.{ts,tsx}"
```

**Exclude patterns:**

```yaml
glob: "src/**/*.ts"
exclude: "src/**/*.test.ts"
```

## Import Organization in CLAUDE.md

### Group by Category

Organize imports logically:

```markdown
# CLAUDE.md

## Project Overview

Brief description of project-specific context.

## Development Workflow

@import .claude/rules/git-workflow.md
@import .claude/rules/testing.md

## Code Standards

@import .claude/rules/style-guide.md
@import .claude/rules/typescript.md

## Architecture

@import .claude/rules/api-conventions.md
@import .claude/rules/database.md
```

### Keep Related Imports Together

Group related topics:

```markdown
## Frontend Development

@import .claude/rules/react.md
@import .claude/rules/css.md
@import .claude/rules/components.md

## Backend Development

@import .claude/rules/api.md
@import .claude/rules/database.md
@import .claude/rules/auth.md
```

## Avoiding Circular Imports

### What is a Circular Import?

File A imports B, and B imports A:

```text
CLAUDE.md
  → @import .claude/rules/frontend.md
      → @import .claude/rules/shared.md
          → @import .claude/rules/frontend.md  BAD: Circular!
```

**Error:**

```text
Circular import detected: frontend.md → shared.md → frontend.md
```

### How to Avoid

**1. Use hierarchical structure:**

```text
CLAUDE.md
  → @import .claude/rules/shared.md
  → @import .claude/rules/frontend.md
  → @import .claude/rules/backend.md
```

Shared rules go in their own file, imported by CLAUDE.md directly.

**2. Don't cross-import:**

Files imported from CLAUDE.md should NOT import each other:

```text
GOOD: CLAUDE.md → frontend.md
GOOD: CLAUDE.md → backend.md
BAD: frontend.md → backend.md
```

**3. Consolidate if needed:**

If two files need the same content, extract it:

```text
Before:
  frontend.md → common-utils.md
  backend.md → common-utils.md
  common-utils.md → frontend.md  BAD: Circular!

After:
  CLAUDE.md → common-utils.md
  CLAUDE.md → frontend.md
  CLAUDE.md → backend.md
```

## Import Depth Limits

Claude Code enforces a maximum import depth of **3 levels**:

```text
Level 1: CLAUDE.md
Level 2: @import .claude/rules/frontend.md
Level 3: @import .claude/rules/shared/utils.md
Level 4: BAD: Too deep!
```

### Why the Limit?

- Prevents overly complex nesting
- Keeps structure understandable
- Avoids performance issues

### How to Stay Under Limit

**1. Flatten structure:**

Instead of nested imports, use direct imports from CLAUDE.md:

```markdown
<!-- Instead of deep nesting -->
CLAUDE.md
  → @import .claude/rules/frontend.md
      → @import .claude/rules/react.md
          → @import .claude/rules/hooks.md

<!-- Flatten to -->
CLAUDE.md
  → @import .claude/rules/frontend.md
  → @import .claude/rules/react-hooks.md
```

**2. Consolidate files:**

Merge related files to reduce levels:

```text
Before:
  .claude/rules/testing/
    ├── unit.md
    ├── integration.md
    └── e2e.md

After:
  .claude/rules/testing.md  (all content merged)
```

**3. Use fewer intermediary files:**

Direct imports are better than intermediaries:

```markdown
<!-- Don't create wrapper files -->
BAD: @import .claude/rules/all-rules.md
      (which imports everything else)

<!-- Import directly -->
GOOD: @import .claude/rules/git-workflow.md
GOOD: @import .claude/rules/testing.md
GOOD: @import .claude/rules/style-guide.md
```

## Quick Reference

**Best practices:**

- Use `.claude/rules/` for import files
- Name files descriptively (kebab-case)
- Add frontmatter with glob patterns to scope rules
- Group related imports in CLAUDE.md
- Keep imports hierarchical (no circular references)
- Stay under 3-level import depth
- Document "why" in imported files, not just "what"

**Avoid:**

- Circular imports (A imports B, B imports A)
- Deep nesting (over 3 levels)
- Cross-imports between imported files
- Generic file names (rules.md, config.md)
- Scattering imports across project root
