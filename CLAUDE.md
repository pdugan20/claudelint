# Claude Code Instructions

## Project Guidelines

### CHANGELOG Management

**CRITICAL: NEVER manually edit `/CHANGELOG.md` (project root)**

- The root CHANGELOG.md is **AUTO-GENERATED** by release-it from Conventional Commits
- Any manual edits will be overwritten on next release
- Only `npm run release` should modify this file

**How to update the CHANGELOG:**
1. Write proper Conventional Commits (feat:, fix:, docs:, etc.)
2. Run `npm run release` when ready to publish
3. release-it auto-generates the CHANGELOG entry from commits

**Skill CHANGELOGs are different:**
- Skill-level CHANGELOG.md files (`.claude/skills/*/CHANGELOG.md`) are **manually maintained**
- These follow Keep a Changelog format
- These should be updated when making changes to skills

### Commit Message Format

All commits must follow Conventional Commits format (enforced by commitlint):

```text
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Test changes
- `build:` - Build system changes
- `ci:` - CI/CD changes
- `chore:` - Other changes (not in changelog)

**Examples:**
```bash
feat: add new rule for validating skill dependencies
fix: resolve workspace detection edge case
docs: update API documentation for ClaudeLint class
```

### Release Process

```bash
# Dry run to preview changes
npm run release:dry

# Create a release (prompts for version)
npm run release

# Create specific version types
npm run release:patch  # 0.2.0 -> 0.2.1
npm run release:minor  # 0.2.0 -> 0.3.0
npm run release:major  # 0.2.0 -> 1.0.0

# Pre-release versions
npm run release:beta   # 0.2.0 -> 0.3.0-beta.0
npm run release:alpha  # 0.2.0 -> 0.3.0-alpha.0
npm run release:rc     # 0.2.0 -> 0.3.0-rc.0
```

**What happens during release:**
1. Runs lint, test, and build
2. Analyzes commits since last release
3. Auto-generates CHANGELOG section
4. Bumps version in package.json
5. Runs `npm run sync:versions` to sync skill versions
6. Creates git commit and tag
7. Pushes to GitHub
8. Creates GitHub release
9. Publishes to npm

### File Naming Conventions

- Use kebab-case for all files: `my-file.ts`
- Test files: `my-file.test.ts`
- Rule files: `rule-name.ts` in `src/rules/<category>/`
- Rule docs: `rule-name.md` in `docs/rules/<category>/`
