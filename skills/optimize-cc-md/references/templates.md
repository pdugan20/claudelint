# CLAUDE.md Templates

Annotated templates for creating well-structured CLAUDE.md files. Copy the template that matches your project complexity and customize.

## Template 1: Minimal (Personal/Small Project)

For small projects with straightforward workflows. Target: 10-20 lines.

```markdown
# Project Instructions

## Build & Test

- `npm test` to run tests
- `npm run build` to compile TypeScript

## Code Style

- TypeScript strict mode, no `any` types
- Prefer functional patterns over classes
- Use named exports, not default exports

## Project Notes

- Environment variables are in `.env` (never commit this file)
- Database seeds: `npm run db:seed`
```

**Why this works:** Every instruction is project-specific and actionable. No generic advice. A developer can immediately start contributing.

## Template 2: Standard (Team Project)

For team projects with established conventions. Target: 30-60 lines.

```markdown
# Project Instructions

## Overview

Express API serving the mobile app backend. Deployed to AWS ECS.
Main entry: `src/server.ts`. Routes in `src/routes/`.

## Development

- `npm run dev` starts dev server with hot reload (port 3000)
- `npm test` runs Jest tests (must pass before push)
- `npm run lint` checks ESLint + Prettier

## Code Standards

- All endpoints return `{ data, error, meta }` response shape
- Use Zod schemas for request validation (see `src/schemas/`)
- Database queries go in `src/repositories/`, not in route handlers
- Errors use custom AppError class from `src/utils/errors.ts`

## Git Workflow

- Branch naming: `feature/JIRA-123-description` or `fix/JIRA-456-description`
- Commits follow Conventional Commits: `feat:`, `fix:`, `chore:`
- PRs require 1 approval and passing CI

## Architecture

- `src/routes/` - Express route handlers (thin, delegate to services)
- `src/services/` - Business logic
- `src/repositories/` - Database access (Prisma)
- `src/middleware/` - Auth, logging, error handling
- `src/schemas/` - Zod validation schemas

## Common Pitfalls

- Always use `transaction()` for multi-table writes
- Redis cache keys must be namespaced: `app:entity:id`
- The `/health` endpoint is excluded from auth middleware
```

**Why this works:** Covers the full workflow from setup to deployment. Architecture section gives Claude the mental model of the codebase. Common pitfalls prevent repeated mistakes.

## Template 3: Complex (Multi-Package Project)

For projects with multiple packages, build systems, or deployment targets. Target: 60-100 lines, with @import references.

```markdown
# Project Instructions

## Overview

Monorepo containing the web dashboard, API server, and shared packages.
Uses pnpm workspaces. Deploy via GitHub Actions.

## Quick Reference

- `pnpm install` - Install all dependencies
- `pnpm test` - Run all workspace tests
- `pnpm build` - Build all packages
- `pnpm dev` - Start web + API in parallel

## Workspace Structure

- `packages/web/` - Next.js dashboard (port 3000)
- `packages/api/` - Express API server (port 4000)
- `packages/shared/` - Shared types, utils, and constants
- `packages/db/` - Prisma schema and migrations

## Standards

@import .claude/rules/typescript.md
@import .claude/rules/testing.md
@import .claude/rules/git-workflow.md

## Architecture

@import .claude/rules/api-conventions.md
@import .claude/rules/database.md

## Deployment

- Staging: Push to `develop` branch triggers auto-deploy
- Production: Create release tag `v*` triggers deploy
- Feature previews: PRs get preview URLs via Vercel
- Database migrations: Run `pnpm db:migrate` before deploy
```

**Why this works:** Root CLAUDE.md stays concise with @imports for details. Each @import file is scoped (glob patterns in frontmatter). The structure mirrors the workspace layout.

**Example @import file** (`.claude/rules/typescript.md`):

```markdown
---
glob: "**/*.{ts,tsx}"
---

# TypeScript Standards

- Strict mode, no `any` (use `unknown` + type guards)
- Prefer interfaces over types for object shapes
- Use branded types for IDs: `type UserId = string & { __brand: 'UserId' }`
- Barrel exports in each package: `packages/*/src/index.ts`
```

## Template 4: Monorepo Root (Delegating)

For monorepo roots that delegate most instructions to workspace-level files. Target: 20-40 lines at root.

```markdown
# Project Instructions

## Overview

pnpm monorepo with 4 apps and 3 shared packages.

## Global Commands

- `pnpm install` - Install all workspace dependencies
- `pnpm build` - Build all packages in dependency order
- `pnpm test` - Run all tests across workspaces
- `pnpm lint` - Lint entire monorepo

## Workspace Navigation

Each workspace has its own CLAUDE.md with specific instructions:

- `apps/web/CLAUDE.md` - Next.js frontend
- `apps/api/CLAUDE.md` - Express backend
- `apps/admin/CLAUDE.md` - Admin dashboard
- `apps/mobile/CLAUDE.md` - React Native app

## Cross-Workspace Rules

- Shared types go in `packages/types/`, never duplicated
- Inter-package imports use workspace protocol: `@myorg/types`
- Version bumps: Use `pnpm changeset` for coordinated releases
- CI runs affected tests only: `pnpm test --filter ...[origin/main]`
```

**Why this works:** Root file is minimal but provides the navigation map. Each workspace CLAUDE.md handles its own conventions. Cross-workspace rules prevent the most common monorepo mistakes.

## Anti-patterns

Common mistakes to avoid when writing CLAUDE.md files.

### 1. Generic Advice

```markdown
BAD:
- Always write clean, maintainable code
- Follow SOLID principles
- Write tests for your code

GOOD:
- Components in src/components/ use the Container/Presenter pattern
- Use dependency injection via the DI container in src/container.ts
- Integration tests required for all API endpoints (see tests/api/)
```

### 2. Duplicating Tool Config

```markdown
BAD:
- Use 2-space indentation (already in .prettierrc)
- No unused variables (already in .eslintrc)
- Sort imports alphabetically (already in eslint-plugin-import)

GOOD:
- ESLint and Prettier handle formatting (see config files)
- Additional conventions not covered by tooling:
  - Group imports: external, internal, relative (with blank lines between)
  - File naming: kebab-case for files, PascalCase for React components
```

### 3. Contradictory Instructions

```markdown
BAD:
"Use functional components exclusively"
(later in the same file)
"The BaseComponent class should be extended for all new components"

FIX: Remove one, or clarify when each applies
```

### 4. Stale Commands

```markdown
BAD:
- Run `yarn test` (project migrated to pnpm 6 months ago)
- Deploy with `./deploy.sh` (script was deleted)

FIX: Periodically verify all commands still work
```

### 5. Over-Documenting the Obvious

```markdown
BAD:
- `git add .` stages all files
- `git commit -m "message"` creates a commit
- TypeScript files use the .ts extension

GOOD: (just skip these entirely)
```
