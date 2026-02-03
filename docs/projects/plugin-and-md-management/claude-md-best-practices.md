# CLAUDE.md Best Practices

**Source**: Extracted from Claude Code documentation and Anthropic best practices guide

## What is CLAUDE.md?

CLAUDE.md is a special file that Claude reads at the start of every conversation. It provides persistent context Claude can't infer from code alone.

## Core Principles

### 1. Keep It Concise

**Rule**: Only include things Claude can't figure out by reading your code.

**Good** **Good** - Things to include:

- Bash commands Claude can't guess (`npm run test:integration`)
- Code style rules that differ from defaults (ES modules vs CommonJS)
- Testing instructions and preferred test runners
- Repository etiquette (branch naming, PR conventions)
- Architectural decisions specific to your project
- Developer environment quirks (required env vars)
- Common gotchas or non-obvious behaviors

**Bad** **Bad** - Things to exclude:

- Anything Claude can figure out by reading code
- Standard language conventions Claude already knows
- Detailed API documentation (link to docs instead)
- Information that changes frequently
- Long explanations or tutorials
- File-by-file descriptions of the codebase
- Self-evident practices like "write clean code"

### 2. Avoid Bloat

**Warning**: If CLAUDE.md is too long, Claude ignores parts of it because important rules get lost in noise.

**Target Length**: Under 200 lines (hard limit varies, but shorter is better)

**Symptoms of Bloat**:

- Claude asks questions answered in CLAUDE.md
- Claude does things explicitly forbidden in CLAUDE.md
- Instructions seem to be ignored

**Solution**: Ruthlessly prune. Ask for each line: "Would removing this cause Claude to make mistakes?"

### 3. Use Progressive Disclosure

**Technique**: Split content across multiple files using imports.

#### Import Syntax

```markdown
See @README.md for project overview and @package.json for available npm commands.

# Additional Instructions
- Git workflow: @docs/git-instructions.md
- Personal overrides: @~/.claude/my-project-instructions.md
```

#### Import Rules

- Use `@path/to/file` syntax
- Paths can be absolute (`@~/.claude/file.md`) or relative (`@docs/file.md`)
- Claude loads imports on-demand (progressive disclosure)

### 4. Location Hierarchy

CLAUDE.md can exist in multiple locations. Claude loads ALL that apply:

| Location | Path | Scope | Use Case |
|----------|------|-------|----------|
| **Home** | `~/.claude/CLAUDE.md` | All sessions | Personal preferences across all projects |
| **Project Root** | `./CLAUDE.md` | This project | Team-shared project conventions (check into git) |
| **Project Root (Local)** | `./CLAUDE.local.md` | This project | Personal overrides (add to .gitignore) |
| **Parent Directories** | `../CLAUDE.md` | Monorepo shared | Conventions for monorepo workspace |
| **Child Directories** | `./sub/CLAUDE.md` | Sub-project | Loaded when working in that directory |

**Loading Order**: All applicable files are combined. More specific (child) overrides more general (parent).

## Content Guidelines

### What to Include

#### 1. Bash Commands

Commands Claude can't infer from package.json or standard conventions:

```markdown
# Workflow
- Run tests: `npm run test:integration`
- Build for prod: `npm run build:production`
- Deploy to staging: `./scripts/deploy.sh staging`
```

#### 2. Code Style

Style rules that differ from language defaults:

```markdown
# Code Style
- Use ES modules (import/export), not CommonJS (require)
- Destructure imports: `import { foo } from 'bar'`
- Prefer arrow functions for callbacks
```

#### 3. Testing Instructions

How to run tests, what to test:

```markdown
# Testing
- Run single test file, not whole suite, for performance
- Always test edge cases for authentication flows
- Mock external API calls using `jest.mock()`
```

#### 4. Repository Etiquette

Conventions your team follows:

```markdown
# Git Workflow
- Branch naming: `feature/`, `fix/`, `chore/`
- Always create PR, never push to main
- Squash commits before merging
```

#### 5. Architectural Decisions

Patterns specific to your codebase:

```markdown
# Architecture
- API calls go through `src/services/api/`
- State management uses Context API, not Redux
- All forms use Formik + Yup validation
```

#### 6. Developer Environment

Setup that's not obvious:

```markdown
# Environment
- Requires `DATABASE_URL` in `.env.local`
- Postgres must be running locally
- Use Node 18+
```

### What to Exclude

#### 1. Obvious Things

**Bad** Don't include:

```markdown
# Bad - Claude already knows this
- Write clean code
- Use meaningful variable names
- Add comments to complex logic
```

#### 2. Code That Explains Itself

**Bad** Don't include:

```markdown
# Bad - Claude can read the code
- `src/components/` contains React components
- `src/utils/` contains utility functions
- `App.tsx` is the root component
```

#### 3. Standard Conventions

**Bad** Don't include:

```markdown
# Bad - These are language defaults
- Use camelCase for JavaScript variables
- Use PascalCase for React components
- Use semicolons at end of statements
```

#### 4. Detailed API Docs

**Bad** Don't include:

```markdown
# Bad - Link instead
- API endpoint: POST /api/users
  - Body: { name: string, email: string }
  - Returns: { id: number, ... }
```

**Good** Better:

```markdown
# Good - Link to docs
- API documentation: @docs/api-reference.md
```

## Example CLAUDE.md

### Minimal Example

```markdown
# Code Style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')

# Workflow
- Be sure to typecheck when you're done making a series of code changes
- Prefer running single tests, not the whole test suite, for performance
```

### Full Example

```markdown
# Project Instructions

See @README.md for project overview and @package.json for available scripts.

## Code Style

- Use ES modules (import/export), not CommonJS (require)
- Prefer arrow functions for callbacks
- Use TypeScript strict mode

## Testing

- Run single test files: `npm test -- path/to/test.ts`
- Always run typecheck after changes: `npm run typecheck`
- Mock external APIs using `src/__mocks__/`

## Git Workflow

- Branch naming: `feature/description`, `fix/issue-number`
- Never push directly to `main`
- Squash commits before merging
- Write conventional commit messages: `feat:`, `fix:`, `docs:`

## Architecture

- API calls through `src/services/api/`
- State management: Context API only
- Routing: React Router v6

## Environment

- Requires Node 18+
- Database: `DATABASE_URL` in `.env.local`
- Start Postgres: `docker-compose up -d postgres`

## Common Issues

- TypeScript errors after pull: `rm -rf node_modules && npm install`
- Test failures: Ensure test database is seeded

## Documentation

- API docs: @docs/api.md
- Architecture: @docs/architecture.md
```

## Validation Rules

### Rules to Implement

1. **File Length** (`claude-md-file-length`)
   - Warn if >200 lines
   - Suggest moving content to imported files
   - Error if >500 lines (too bloated to be effective)

2. **Import Syntax** (`claude-md-import-syntax`)
   - Validate `@path/to/file` syntax
   - Check imported files exist
   - Warn on circular imports
   - Error on malformed paths

3. **Obvious Content** (`claude-md-obvious-content`)
   - Detect phrases like "write clean code", "use meaningful names"
   - Flag standard language conventions
   - Warn on file-by-file descriptions Claude can infer
   - Suggest removal

4. **Hook Commands** (`claude-md-hook-commands`)
   - Validate shell commands are executable
   - Warn on dangerous patterns (rm -rf, dd, mkfs)
   - Check command syntax

5. **Config Location** (`claude-md-config-location`)
   - Detect code style rules that belong in linter configs
   - Suggest moving to .eslintrc, .prettierrc, etc.
   - Check for duplication between CLAUDE.md and config files

## Anti-Patterns

### 1. Kitchen Sink CLAUDE.md

**Bad** **Problem**:

```markdown
# (500+ lines of everything about the project)
```

**Why it's bad**: Claude ignores most of it. Important rules get lost.

**Fix**: Move detailed docs to imported files. Keep only essentials in main file.

### 2. Obvious Instructions

**Bad** **Problem**:

```markdown
- Write clean, maintainable code
- Use meaningful variable names
- Add comments where needed
```

**Why it's bad**: Claude already knows this. Wastes tokens.

**Fix**: Delete these. Trust Claude's defaults.

### 3. Duplicated Configs

**Bad** **Problem**:

```markdown
# CLAUDE.md
- Use 2 spaces for indentation
- Use single quotes for strings

# .prettierrc
{
  "tabWidth": 2,
  "singleQuote": true
}
```

**Why it's bad**: Duplication. Config files are the source of truth.

**Fix**: Delete from CLAUDE.md. Reference the config file if needed.

### 4. Stale Information

**Bad** **Problem**:

```markdown
- Main branch is `master`  (actually changed to `main`)
- Deploy with `./deploy.sh` (script was deleted)
```

**Why it's bad**: Claude follows outdated instructions.

**Fix**: Regularly audit and update. Or better: reference dynamic sources.

### 5. File-by-File Descriptions

**Bad** **Problem**:

```markdown
- src/components/Button.tsx - Button component
- src/components/Input.tsx - Input component
- src/utils/format.ts - Formatting utilities
```

**Why it's bad**: Claude can read the files. Wastes tokens.

**Fix**: Delete. Claude will explore when needed.

## Maintenance Strategy

### 1. Regular Audits

- Review CLAUDE.md monthly
- Ask: "Is Claude still ignoring things in here?"
- If yes, it's too long. Prune.

### 2. Test CLAUDE.md Effectiveness

- Start fresh conversation
- Ask Claude questions answered in CLAUDE.md
- If Claude doesn't know, check if instruction was too buried

### 3. Check for Bloat

```bash
# Count lines
wc -l CLAUDE.md

# If >200, review for pruning opportunities
```

### 4. Use Our Validator

```bash
# Run CLAUDE.md validation
claudelint validate-claude-md

# Or as part of full validation
claudelint validate
```

## Integration with Hooks

CLAUDE.md can reference hooks, but hooks enforce behavior while CLAUDE.md only guides:

### CLAUDE.md (Advisory)

```markdown
# Workflow
- Always run tests before committing
```

**Problem**: Claude might forget or skip.

### Hooks (Enforced)

```json
{
  "hooks": {
    "PreCommit": [
      {
        "command": "npm test",
        "description": "Run tests before commit"
      }
    ]
  }
}
```

**Better**: Hook guarantees it happens.

**Rule**: Use hooks for "must happen every time", CLAUDE.md for "usually do this".

## References

- [Claude Code Best Practices](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md)
- [Memory and Context](https://code.claude.com/docs/en/memory)
- Skills Guide PDF (reviewed in this project)
