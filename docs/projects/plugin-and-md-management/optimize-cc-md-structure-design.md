# optimize-cc-md Skill Structure Design

**Date**: 2026-02-04
**Status**: Design Phase
**Target**: Progressive disclosure (3-level system)

## Overview

Interactive skill to help users optimize their CLAUDE.md files through validation, conversational explanation, and actual file editing.

## Progressive Disclosure Design

### Level 1: YAML Frontmatter (Always Loaded)

**Purpose**: Tell Claude when to load this skill

**Content** (~150 chars of 1024 max):

```yaml
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
```

### Level 2: SKILL.md Body (Loaded When Relevant)

**Target**: <3,000 words (conservative, limit is 5,000)

**Structure**:

1. **Brief Introduction** (~50 words)
   - What this skill does
   - When to use it
   - What to expect

2. **Core Workflow** (~400-500 words)
   - Step 1: Run validation
   - Step 2: Read CLAUDE.md
   - Step 3: Explain issues conversationally
   - Step 4: Ask user what to fix
   - Step 5: Make edits
   - Step 6: Create @imports if needed
   - Step 7: Show results

3. **Common Fixes** (~300 words)
   - File size violations (30KB warning, 50KB error)
   - Import issues (missing, circular)
   - Organization problems (too many sections)
   - Generic content removal
   - Link to references/ for strategies

4. **Examples** (~600 words)
   - Example 1: Fix size violations
   - Example 2: Create import structure
   - Example 3: Remove obvious content
   - Format: User says → Actions → Result

5. **Troubleshooting** (~200 words)
   - Common issues USING the skill (not issues it fixes)
   - Skill-specific errors

6. **Important Notes** (~100 words)
   - When NOT to use this skill
   - Dependencies required
   - Links to references/

Estimated total: ~1,650-1,850 words

### Level 3: references/ (Loaded As Needed)

**Purpose**: Detailed strategies Claude can read when needed

#### references/size-optimization.md (~800-1000 words)

**Content**:

- What causes CLAUDE.md bloat
- Generic advice vs. project-specific
- Config duplication patterns
- Obvious content to remove
- How to identify sections to split
- Size calculation strategies
- Before/after examples

**When Claude reads**: User asks "how do I reduce size?" or validation shows size violations

#### references/import-patterns.md (~800-1000 words)

**Content**:

- Best practices for @import organization
- Directory structure recommendations (.claude/rules/)
- Common patterns (git workflow, testing, linting, style guides)
- File naming conventions
- How to split content logically
- Avoiding circular imports
- Import depth limits

**When Claude reads**: User asks about imports or needs to split content

#### references/organization-guide.md (~600-800 words)

**Content**:

- Section organization principles
- When to split vs. consolidate
- Frontmatter best practices
- glob pattern usage in .claude/rules/
- How to structure for maintainability
- Project-specific vs. global rules

**When Claude reads**: User asks about organization or has too many sections

## Tool Usage Design

### Bash Tool

- Run `claudelint check-claude-md --verbose`
- Get structured validation output
- Parse results to explain conversationally

### Read Tool

- Read current CLAUDE.md
- Read existing @import files
- Read references/ when needed
- Check .claude/rules/ directory

### Grep Tool (Optional)

- Search for specific patterns in CLAUDE.md
- Find duplicated content
- Identify generic advice patterns

### Edit Tool

- Make surgical edits to CLAUDE.md
- Remove bloat
- Fix import paths
- Update content

### Write Tool

- Create new @import files in .claude/rules/
- Generate organized, focused files
- Ensure proper frontmatter if needed

## Word Count Budget

- SKILL.md: <3,000 words (targeting ~1,850)
- references/size-optimization.md: ~900 words
- references/import-patterns.md: ~900 words
- references/organization-guide.md: ~700 words
- **Total**: ~4,350 words across all files
- **Progressive disclosure savings**: References only loaded when needed

## Design Rationale

### Why This Structure?

1. **Frontmatter is minimal** - Just trigger phrases, under 1024 chars
2. **SKILL.md is focused** - Core workflow only, no deep details
3. **References are targeted** - Specific strategies, read on demand
4. **Tools are appropriate** - Uses Edit/Write for actual changes (not just advice)
5. **Interactive by design** - Asks user what to fix, doesn't assume

### Following Anthropic Patterns

- Progressive disclosure (3 levels)
- Clear trigger phrases
- Conversational approach
- Actionable instructions
- Error handling
- Examples with specific scenarios
- References for deep dives

## Next Steps

1. Create directory structure (Task 3.2)
2. Write SKILL.md frontmatter (Task 3.3)
3. Write core workflow (Task 3.4)
4. Create reference documents (Task 3.5)
5. Add examples (Task 3.6)
6. Add troubleshooting (Task 3.7)
7. Test iteratively (Task 3.8)
