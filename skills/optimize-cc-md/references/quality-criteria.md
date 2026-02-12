# CLAUDE.md Quality Criteria

Manual review checklist for evaluating CLAUDE.md quality. Use after running `claudelint validate-claude-md` to catch issues that automated validation cannot detect.

## How to Use

Work through each section. For any "No" answer, consider whether the CLAUDE.md should be updated. Not every project needs a "Yes" on every item — use judgment based on project size and complexity.

## Specificity

- [ ] Does every instruction reference THIS project specifically?
- [ ] Are file paths, command names, and patterns from the actual codebase?
- [ ] Would removing any instruction leave Claude unable to do something project-specific?
- [ ] Are there any instructions that would apply equally to ANY project? (remove those)

**Red flags:**

- "Always write clean code" (generic, remove)
- "Follow best practices" (generic, remove)
- "Use meaningful variable names" (generic, remove)

**Good examples:**

- "Use PascalCase for React components in src/components/"
- "Run `npm run test:integration` before pushing to main"
- "API endpoints follow REST conventions defined in docs/api-spec.md"

## Completeness

- [ ] Does a new developer have enough context to make their first contribution?
- [ ] Are the build, test, and deploy commands documented?
- [ ] Are project-specific conventions explained (naming, patterns, architecture)?
- [ ] Are common pitfalls or gotchas documented?
- [ ] Are environment setup steps included (or linked)?

**Questions to test completeness:** If someone cloned the repo with only the CLAUDE.md for guidance, could they:

1. Build the project?
2. Run tests?
3. Make a code change following conventions?
4. Submit a properly formatted commit/PR?

## Clarity

- [ ] Can each instruction be followed without additional context?
- [ ] Are there contradictory instructions?
- [ ] Is the tone directive ("do X") rather than descriptive ("X is important")?
- [ ] Are examples provided for non-obvious patterns?
- [ ] Are acronyms and project-specific terms defined or linked?

**Directive vs descriptive:**

- Directive: "Use `pnpm` instead of `npm` for all package operations"
- Descriptive: "We prefer pnpm because it's faster" (less actionable)

## Organization

- [ ] Is the most important information near the top?
- [ ] Are related instructions grouped together?
- [ ] Does the structure use headings that match how a developer would search?
- [ ] Are long sections split into @import files in .claude/rules/?
- [ ] Is there a clear hierarchy (overview -> specifics -> edge cases)?

**Recommended section order:**

1. Project overview (what this project is)
2. Quick reference (most common commands)
3. Code standards (language-specific rules)
4. Architecture (directory structure, key patterns)
5. Workflow (git, CI, deployment)

## Maintenance

- [ ] Are version-specific instructions tagged or dated?
- [ ] Do file paths and commands still work?
- [ ] Are deprecated patterns marked or removed?
- [ ] Is there a clear owner or process for keeping instructions current?

**Staleness indicators:**

- Commands that return "not found"
- File paths to files that no longer exist
- References to removed dependencies
- Version numbers that don't match current

## What This Checklist Does NOT Cover

The following are already handled by claudelint programmatic validation:

- File size limits (`claude-md-size-warning`, `claude-md-size-error`)
- Import validation (`claude-md-import-missing`, `claude-md-import-circular`)
- Path validation (`claude-md-paths`, `claude-md-file-not-found`)
- Section count (`claude-md-content-too-many-sections`)
- Glob patterns (`claude-md-glob-pattern-too-broad`, `claude-md-glob-pattern-backslash`)

Run `claudelint validate-claude-md` for these automated checks.
