---
name: optimize-cc-md
description: Interactively helps users optimize their CLAUDE.md files. Use when user asks to "optimize my CLAUDE.md", "my CLAUDE.md is too long", "improve organization", or "split my CLAUDE.md". Runs validation, explains issues conversationally, and helps create @import files to reduce size and improve structure.
version: 1.0.0
disable-model-invocation: true
allowed-tools:
  - Bash(claudelint:*)
  - Read
  - Edit
  - Write
  - Grep
---

# Optimize CLAUDE.md

An interactive skill that helps you optimize your CLAUDE.md file through a 3-phase workflow: validate, assess quality, then make guided improvements. Each phase builds on the previous one so the user understands what's wrong, why it matters, and what to do about it.

## Workflow Overview

```text
Phase A: Validate         Phase B: Assess Quality     Phase C: Guided Improvement
─────────────────         ───────────────────────     ───────────────────────────
Run claudelint         →  Explain issues plainly   →  Ask user what to fix
Read CLAUDE.md         →  Check quality criteria   →  Make surgical changes
Collect violations     →  Identify opportunities   →  Create @import files
                                                   →  Verify results
```

## Phase A: Validate

Run automated validation and read the file to understand its current state.

### Step 1: Run Validation

Use the Bash tool to run claudelint validation with verbose output:

```bash
npx claude-code-lint check-claude-md --verbose
```

This identifies all CLAUDE.md issues including:

- File size violations (30KB warning, 50KB error)
- Missing or circular @imports
- Organization problems
- Invalid frontmatter in .claude/rules/ files
- Glob pattern issues

### Step 2: Read the CLAUDE.md File

Use the Read tool to examine the user's CLAUDE.md:

```text
Read(file_path: "CLAUDE.md")
```

Understand the current structure, content, and patterns. Note:

- Total file size and number of sections
- Which sections are project-specific vs generic
- Existing @import structure (if any)
- Content that could be scoped with globs

## Phase B: Assess Quality

Go beyond automated checks. Explain issues conversationally and evaluate quality using criteria that linting can't catch.

### Step 3: Explain Issues Conversationally

Translate validation errors into plain language:

- "Your CLAUDE.md is 45KB - that's over the 30KB warning threshold"
- "You have generic advice that could be removed"
- "These sections could be split into @import files"

Focus on the "why" not just the "what". Help users understand the impact.

### Step 4: Assess Against Quality Criteria

Walk through the key quality dimensions from [quality criteria](./references/quality-criteria.md):

- **Specificity**: Is every instruction project-specific? Flag generic advice ("always write clean code")
- **Completeness**: Can a new developer build, test, and contribute?
- **Clarity**: Are instructions directive ("do X") vs descriptive ("X is important")?
- **Organization**: Is the most important info near the top? Are related items grouped?
- **Maintenance**: Do commands and paths still work? Any stale content?

Present a brief assessment to the user:

```text
"Your CLAUDE.md has 3 validation errors and some quality gaps:
- 45KB (over 30KB threshold) - needs splitting
- 12 generic statements that should be removed
- Testing section is thorough but git workflow is missing
- Good: all commands are current and paths are valid"
```

### Step 5: Identify Improvement Opportunities

For each issue, determine the root cause and link to reference files:

- **Size violations**: See [size optimization](./references/size-optimization.md)
- **Import issues**: See [import patterns](./references/import-patterns.md)
- **Organization**: See [organization guide](./references/organization-guide.md)
- **Templates**: See [templates](./references/templates.md) for good CLAUDE.md examples

## Phase C: Guided Improvement

Let the user choose what to fix, then make the changes and verify results.

### Step 6: Ask User What to Fix

Use the AskUserQuestion tool to present prioritized options:

```text
What would you like me to fix first?

1. Reduce file size (45KB → under 30KB)
2. Fix circular import in git-workflow.md
3. Split content into organized @imports
4. Remove generic/obvious content
```

Let the user prioritize. Don't assume.

### Step 7: Make the Changes

Use the Edit tool for surgical changes to CLAUDE.md:

```text
Edit(
  file_path: "CLAUDE.md",
  old_string: "existing content to replace",
  new_string: "new content"
)
```

For removing content:

- Delete generic advice ("always write clean code")
- Remove config duplication (if same rules in .claude/settings.json)
- Clean up obvious statements that add no value

### Step 8: Create @Import Files (If Splitting Content)

Use the Write tool to create new files in .claude/rules/:

```text
Write(
  file_path: ".claude/rules/git-workflow.md",
  content: "---\nglob: \"**/*.{ts,js}\"\n---\n\n# Git Workflow\n\n..."
)
```

Then update CLAUDE.md to import the file:

```text
Edit(
  file_path: "CLAUDE.md",
  old_string: "# Git Workflow\n\nLong content here...",
  new_string: "@import .claude/rules/git-workflow.md"
)
```

**Best practices for @imports:**

- Use .claude/rules/ for project-specific rules
- Add frontmatter with glob patterns to scope rules
- Keep import depth under 3 levels
- Avoid circular imports

### Step 9: Verify Results

Run validation again to confirm fixes:

```bash
npx claude-code-lint check-claude-md --verbose
```

Show before/after comparison:

- "Before: 45KB with 12 violations"
- "After: 28KB with 0 violations"
- "Changes made: Split 3 sections into @imports, removed 2 generic advice blocks"

## Common Fixes

For detailed fix strategies, see [common fixes reference](./references/common-fixes.md).

Quick reference:

- **Size violations**: Move content to @imports, remove generic advice. See [size optimization](./references/size-optimization.md)
- **Import issues**: Check paths, avoid circular imports, limit depth to 3. See [import patterns](./references/import-patterns.md)
- **Organization**: Group related sections, use .claude/rules/ for scoped rules. See [organization guide](./references/organization-guide.md)

## Examples

### Example 1: Full 3-Phase Workflow (Size Reduction)

**User says:** "My CLAUDE.md is 45KB and I'm getting warnings. How do I reduce it?"

**Phase A** - Run validation and read the file:

```bash
npx claude-code-lint check-claude-md --verbose
```

Output shows: "Warning: CLAUDE.md is 45KB (threshold: 30KB)". Read the file and note the largest sections: git workflow (12KB), testing standards (8KB), generic advice (~5KB scattered).

**Phase B** - Assess quality and explain:

"Your file is 45KB - 15KB over the warning threshold. I found:

- Large git workflow section (12KB) - good candidate for @import
- Testing standards (8KB) - should move to .claude/rules/
- Generic advice (~5KB) - can be removed entirely
- Quality: commands are current, but 12 statements are generic rather than project-specific"

**Phase C** - Fix with user guidance:

Ask user what to fix. User chooses: "Split git workflow and remove generic advice."

```text
Write(.claude/rules/git-workflow.md, content: git workflow section)
Edit(CLAUDE.md, old: git workflow section, new: @import .claude/rules/git-workflow.md)
Edit(CLAUDE.md, old: generic advice blocks, new: [removed])
```

Re-run validation: "CLAUDE.md is now 28KB (under 30KB threshold)."

**Result:** File reduced from 45KB to 28KB by splitting largest section and removing bloat.

### Example 2: Create Import Structure

**User says:** "My CLAUDE.md has everything in one file. Help me organize it better."

**Phase A** - Validate and read. Find 5 distinct topics totaling 1,650 lines.

**Phase B** - Assess: "I see 5 distinct topics that can each become focused @import files. This will make your config more maintainable. All content is project-specific (good), but nothing is scoped by file type."

**Phase C** - Suggest structure, create files with glob frontmatter, update CLAUDE.md:

```text
.claude/rules/
├── git-workflow.md (glob: "**/*")
├── testing.md (glob: "**/*.test.ts")
├── typescript.md (glob: "**/*.{ts,tsx}")
├── api-conventions.md (glob: "src/api/**/*.ts")
└── style-guide.md (glob: "src/**/*.ts")
```

Re-run validation to confirm no circular imports or depth issues.

**Result:** Well-organized config with 5 focused @import files, each scoped to relevant file types.

### Example 3: Remove Generic Content

**User says:** "Is my CLAUDE.md too generic? It feels bloated."

**Phase A** - Validate and read. Use Grep to find generic patterns ("always", "best practice", "should", "never"). Find 47 instances.

**Phase B** - Assess: "I found 47 generic statements that Claude already knows. These add ~5KB without project-specific value. Example - Generic: 'Always write clean code' vs Project-specific: 'Use PascalCase for React components, camelCase for hooks'"

**Phase C** - Show the user what will be removed, ask for confirmation, then edit. Re-run validation.

**Result:** Focused config with only project-specific guidance. File size reduced by 5KB.

## Troubleshooting

For solutions to common problems, see [troubleshooting guide](./references/troubleshooting.md).

Common issues: CLI not found (install claude-code-lint), broken @import paths, size violations persisting after splits, circular imports.

## Important Notes

### When NOT to Use This Skill

- **For initial CLAUDE.md creation**: Use the built-in `/init` command instead
- **For general validation only**: Use `/claudelint:validate-cc-md` for just checking
- **When you know exactly what to change**: Make direct edits instead

### Dependencies Required

This skill requires the claudelint npm package:

```bash
npm install --save-dev claude-code-lint
```

The skill checks for this dependency and will show installation instructions if missing.

### Reference Files

For detailed strategies, see:

- [size optimization](./references/size-optimization.md) - How to reduce CLAUDE.md file size
- [import patterns](./references/import-patterns.md) - Best practices for organizing @imports
- [organization guide](./references/organization-guide.md) - Structural organization principles
- [common fixes](./references/common-fixes.md) - Quick reference for common issues and solutions
- [troubleshooting](./references/troubleshooting.md) - Solutions for common skill problems
- [quality criteria](./references/quality-criteria.md) - Manual review checklist for CLAUDE.md quality
- [templates](./references/templates.md) - Annotated examples of well-structured CLAUDE.md files
- [file type taxonomy](./references/file-type-taxonomy.md) - Complete Claude Code config ecosystem reference

These files are read on-demand when you need specific guidance.
