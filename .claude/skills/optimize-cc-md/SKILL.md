---
name: optimize-cc-md
description: Interactively help users optimize their CLAUDE.md files. Use when you want to "optimize my CLAUDE.md", "fix my config", "my CLAUDE.md is too long", "improve organization", or "split my CLAUDE.md". Runs validation, explains issues conversationally, and helps create @import files to reduce size and improve structure.
version: 1.0.0
tags:
  - automation
  - claude-code
  - optimization
dependencies:
  - npm:claude-code-lint
allowed-tools:
  - Bash
  - Read
  - Edit
  - Write
  - Grep
---

# Optimize CLAUDE.md

An interactive skill that helps you optimize your CLAUDE.md file through validation, conversational explanation, and guided editing. This skill identifies issues, explains them in plain language, and makes the actual changes for you.

## Core Workflow

When you run this skill, follow this interactive process:

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

Understand the current structure, content, and patterns.

### Step 3: Explain Issues Conversationally

Translate validation errors into plain language:

- "Your CLAUDE.md is 45KB - that's over the 30KB warning threshold"
- "You have generic advice that could be removed"
- "These sections could be split into @import files"

Focus on the "why" not just the "what". Help users understand the impact.

### Step 4: Identify Specific Problems

For each issue, determine the root cause:

- **Size violations**: Generic content, config duplication, obvious advice
- **Import issues**: Missing files, circular references, depth exceeded
- **Organization**: Too many top-level sections, unclear structure

Link to reference files for detailed strategies:

- See `references/size-optimization.md` for reduction strategies
- See `references/import-patterns.md` for @import best practices
- See `references/organization-guide.md` for structural guidance

### Step 5: Ask User What to Fix

Use the AskUserQuestion tool to present options:

```text
What would you like me to fix first?

1. Reduce file size (45KB → under 30KB)
2. Fix circular import in git-workflow.md
3. Split content into organized @imports
4. Remove generic/obvious content
```

Let the user prioritize. Don't assume.

### Step 6: Make the Changes

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

### Step 7: Create @Import Files (If Splitting Content)

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

### Step 8: Show Results

Run validation again to confirm fixes:

```bash
npx claude-code-lint check-claude-md --verbose
```

Show before/after comparison:

- "Before: 45KB with 12 violations"
- "After: 28KB with 0 violations"
- "Changes made: Split 3 sections into @imports, removed 2 generic advice blocks"

## Common Fixes

### File Size Violations

**30KB warning threshold**: Your CLAUDE.md is getting large. Consider:

- Moving project-specific rules to .claude/rules/ with @import
- Removing generic advice that doesn't add value
- Consolidating similar sections

**50KB error threshold**: Your CLAUDE.md is too large. You must:

- Split content into multiple @import files
- Remove all generic/obvious content
- Reorganize into focused, scoped rules

See `references/size-optimization.md` for detailed strategies.

### Import Issues

**Missing imports**: Fix broken @import paths:

```text
Error: .claude/rules/missing.md not found
Fix: Create the file or remove the @import
```

**Circular imports**: A imports B, B imports A:

```text
Error: Circular import detected
Fix: Restructure imports to be hierarchical, not circular
```

**Depth exceeded**: Too many nested imports (limit: 3 levels):

```text
Error: Import depth exceeded (4 levels)
Fix: Flatten import hierarchy or consolidate files
```

See `references/import-patterns.md` for @import best practices.

### Organization Problems

**Too many sections**: CLAUDE.md has 20+ top-level headings:

- Group related sections together
- Move specific topics to @import files
- Use .claude/rules/ for scoped rules

**Generic content**: Remove obvious advice:

- "Always write clean code" (too generic)
- "Follow best practices" (adds no value)
- "Use proper error handling" (obvious)

**Config duplication**: Don't repeat .claude/settings.json in CLAUDE.md:

- If permissions are in settings.json, don't duplicate in CLAUDE.md
- If environment variables are in settings.json, remove from CLAUDE.md

See `references/organization-guide.md` for structural guidance.

## Examples

[Examples will be added in Task 3.6]

## Troubleshooting

[Troubleshooting will be added in Task 3.7]

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

- `references/size-optimization.md` - How to reduce CLAUDE.md file size
- `references/import-patterns.md` - Best practices for organizing @imports
- `references/organization-guide.md` - Structural organization principles

These files are read on-demand when you need specific guidance.
