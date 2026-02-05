---
name: optimize-cc-md
description: Interactively help users optimize their CLAUDE.md files. Use when you want to "optimize my CLAUDE.md", "my CLAUDE.md is too long", "improve organization", or "split my CLAUDE.md". Runs validation, explains issues conversationally, and helps create @import files to reduce size and improve structure.
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

### Example 1: Fix Size Violations

**User says:** "My CLAUDE.md is 45KB and I'm getting warnings. How do I reduce it?"

**Actions Claude takes:**

1. Run validation:

   ```bash
   npx claude-code-lint check-claude-md --verbose
   ```

   Output shows: "Warning: CLAUDE.md is 45KB (threshold: 30KB)"

2. Read CLAUDE.md and identify largest sections:
   - Git workflow section: 12KB (500 lines)
   - Testing standards: 8KB (300 lines)
   - Generic advice blocks: 5KB scattered throughout

3. Explain to user:
   "Your file is 45KB - 15KB over the warning threshold. I found:
   - Large git workflow section (12KB) - good candidate for @import
   - Testing standards (8KB) - should move to .claude/rules/
   - Generic advice (~5KB) - can be removed entirely"

4. Ask user what to fix:
   - Option 1: Split git workflow to @import
   - Option 2: Remove all generic advice
   - Option 3: Move testing to .claude/rules/

5. User chooses: "Split git workflow and remove generic advice"

6. Make changes:

   ```text
   Write(.claude/rules/git-workflow.md, content: git workflow section)
   Edit(CLAUDE.md, old: git workflow section, new: @import .claude/rules/git-workflow.md)
   Edit(CLAUDE.md, old: generic advice blocks, new: [removed])
   ```

7. Show results:

   ```bash
   npx claude-code-lint check-claude-md --verbose
   ```

   "Success: CLAUDE.md is now 28KB (under 30KB threshold)"

**Result:** File reduced from 45KB to 28KB by splitting largest section and removing bloat.

### Example 2: Create Import Structure

**User says:** "My CLAUDE.md has everything in one file. Help me organize it better."

**Actions Claude takes:**

1. Run validation and read CLAUDE.md

2. Analyze structure:

   ```markdown
   # CLAUDE.md (current)
   - Git workflow (500 lines)
   - Testing standards (300 lines)
   - TypeScript rules (400 lines)
   - API conventions (250 lines)
   - Code style (200 lines)
   ```

3. Explain organization strategy:
   "I see 5 distinct topics that can each become focused @import files.
   This will make your config more maintainable and easier to update."

4. Suggest structure:

   ```text
   .claude/rules/
   ├── git-workflow.md (glob: "**/*")
   ├── testing.md (glob: "**/*.test.ts")
   ├── typescript.md (glob: "**/*.{ts,tsx}")
   ├── api-conventions.md (glob: "src/api/**/*.ts")
   └── style-guide.md (glob: "src/**/*.ts")
   ```

5. Create import files with frontmatter:

   ```text
   Write(.claude/rules/git-workflow.md)
   Write(.claude/rules/testing.md with glob frontmatter)
   Write(.claude/rules/typescript.md with glob frontmatter)
   Write(.claude/rules/api-conventions.md with glob frontmatter)
   Write(.claude/rules/style-guide.md with glob frontmatter)
   ```

6. Update CLAUDE.md:

   ```markdown
   # CLAUDE.md (after)

   ## Project Overview
   Brief project-specific context.

   ## Development Workflow
   @import .claude/rules/git-workflow.md
   @import .claude/rules/testing.md

   ## Code Standards
   @import .claude/rules/typescript.md
   @import .claude/rules/style-guide.md

   ## Architecture
   @import .claude/rules/api-conventions.md
   ```

7. Run validation to confirm no circular imports or depth issues

**Result:** Well-organized config with 5 focused @import files, each scoped to relevant file types.

### Example 3: Remove Generic Content

**User says:** "Is my CLAUDE.md too generic? It feels bloated."

**Actions Claude takes:**

1. Run validation and read CLAUDE.md

2. Scan for generic patterns:

   ```text
   Grep("always", "best practice", "should", "never")
   ```

   Found 47 instances of generic advice:
   - "Always write clean code"
   - "Follow best practices"
   - "Never commit commented code"
   - "Use meaningful variable names"
   - "Test your code thoroughly"

3. Explain to user:
   "I found 47 generic statements that Claude already knows. These add ~5KB
   without providing project-specific value. For example:

   Generic: 'Always write clean code'
   vs
   Project-specific: 'Use PascalCase for React components, camelCase for hooks'"

4. Show examples of what will be removed:

   ```diff
   - Always write clean, maintainable code
   - Follow SOLID principles
   - Use descriptive variable names
   - Write tests for all new features
   - Document your functions
   + (removed - Claude already knows these principles)
   ```

5. Ask user: "Remove all 47 generic statements?"

6. User confirms. Make edits:

   ```text
   Edit(CLAUDE.md, remove all generic advice blocks)
   ```

7. Show comparison:

   ```text
   Before: 38KB with generic advice
   After: 33KB, all project-specific
   Removed: 5KB of obvious/generic content
   ```

**Result:** Focused config with only project-specific guidance. File size reduced by 5KB.

## Troubleshooting

### Skill won't run - "claudelint command not found"

**Problem:** You see "Error: claudelint CLI not installed" when running the skill.

**Solution:** Install the claudelint npm package:

```bash
npm install --save-dev claude-code-lint
```

The optimize-cc-md skill requires the claudelint CLI to run validation. The skill checks for this dependency automatically.

### @import paths don't work after creating files

**Problem:** Skill created `.claude/rules/git-workflow.md` but CLAUDE.md shows import error.

**Possible causes:**

1. **Incorrect path in @import:** Check that the import path matches the file location exactly:

   ```markdown
   BAD: @import .claude/git-workflow.md
   GOOD: @import .claude/rules/git-workflow.md
   ```

2. **File wasn't created:** Verify the file exists:

   ```bash
   ls .claude/rules/git-workflow.md
   ```

3. **Missing frontmatter in rules file:** Files in `.claude/rules/` may need frontmatter:

   ```markdown
   ---
   glob: "**/*.ts"
   ---

   # Your rules content
   ```

**Fix:** Re-run the skill and verify file paths, or manually correct the @import directive.

### Validation still shows size violation after optimization

**Problem:** You split content to @imports but CLAUDE.md still reports 45KB.

**Possible causes:**

1. **@import content counts toward total:** Imported files add to total size. The goal is to stay under 30KB total (CLAUDE.md + all imports).

2. **Large imports:** Check individual import file sizes:

   ```bash
   wc -c .claude/rules/*.md
   ```

3. **Didn't remove generic content:** Size violations often require both splitting AND removing bloat.

**Fix:** Remove more generic content, or split largest import files into smaller focused files.

### Skill suggests removing content I want to keep

**Problem:** Skill identifies "generic advice" that's actually important for your project.

**Solution:** Tell Claude which content to keep:

- "Keep the git workflow section, it's project-specific"
- "Don't remove the testing rules, our project has unique requirements"

Claude will adjust recommendations based on your feedback. The skill suggests removals but always asks before making changes.

### Circular import error after creating @imports

**Problem:** Validation shows "Circular import detected: A.md → B.md → A.md"

**Cause:** One of the import files imports another file that imports the first one back.

**Solution:**

1. Keep imports hierarchical - CLAUDE.md should import everything, but import files should NOT import each other:

   ```text
   GOOD: CLAUDE.md → git-workflow.md
   GOOD: CLAUDE.md → testing.md
   BAD: git-workflow.md → testing.md → git-workflow.md
   ```

2. If two files need shared content, extract it to a third file:

   ```text
   Before (circular):
   git-workflow.md → shared.md
   testing.md → shared.md
   shared.md → git-workflow.md  BAD:

   After (hierarchical):
   CLAUDE.md → shared.md
   CLAUDE.md → git-workflow.md
   CLAUDE.md → testing.md  GOOD:
   ```

### Skill creates too many small files

**Problem:** Skill split content into 15 small @import files, making it hard to maintain.

**Solution:** Ask Claude to consolidate related files:

- "Merge the three git files into one git-workflow.md"
- "Combine testing-unit.md and testing-integration.md"

Aim for 5-10 focused import files, not 20+ tiny ones. Each file should cover a complete topic.

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
