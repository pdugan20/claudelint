# Size Optimization Strategies

This guide explains how to reduce CLAUDE.md file size when you hit the 30KB warning or 50KB error thresholds.

## Understanding File Size Limits

Claude Code enforces two thresholds for CLAUDE.md:

- **30KB (warning)**: Your file is getting large. Consider optimization.
- **50KB (error)**: Your file is too large. You must reduce it.

**Why these limits?**

- Faster context loading for Claude
- Better organization and maintainability
- Encourages focused, project-specific instructions
- Prevents generic bloat that doesn't add value

## What Causes CLAUDE.md Bloat?

### 1. Generic Advice

Common culprits that add bytes without value:

- "Always write clean code"
- "Follow best practices"
- "Use proper error handling"
- "Write tests for your code"
- "Document your functions"

**Why remove it?** Claude already knows these principles. Generic advice doesn't help Claude understand YOUR project.

### 2. Config Duplication

Repeating information already in `.claude/settings.json`:

- Permission rules (if already in settings.json `allowedCommands`)
- Environment variables (if already in settings.json `env`)
- Tool restrictions (if already in settings.json `disallowedTools`)

**Example of duplication:**

```markdown
<!-- CLAUDE.md -->
Never run `rm -rf` commands.

<!-- .claude/settings.json already has: -->
{
  "disallowedCommands": ["rm -rf"]
}
```

**Fix**: Remove the CLAUDE.md instruction. The settings.json config is enforced.

### 3. Overly Detailed Examples

Long code examples that could be shortened.

DON'T: Include 50 lines of example implementation code in CLAUDE.md.

DO: Use concise examples or link to actual source files:

```typescript
const user = await createUser({ name, email });
// See src/services/user.ts for implementation
```

### 4. Repeated Patterns

Same instructions duplicated across sections:

- Git workflow mentioned in 5 places
- Testing rules repeated for each file type
- Linting instructions in multiple sections

**Fix**: Consolidate into one section or move to @import file.

## Identifying Content to Move to @imports

### Project-Specific Rules

Move these to `.claude/rules/` with @imports:

- **Git workflow** → `.claude/rules/git-workflow.md`
- **Testing standards** → `.claude/rules/testing.md`
- **Code style guide** → `.claude/rules/style-guide.md`
- **API conventions** → `.claude/rules/api-conventions.md`
- **Database patterns** → `.claude/rules/database.md`

### Technology-Specific Rules

Move framework/library-specific rules:

- **React patterns** → `.claude/rules/react.md` with `glob: "**/*.{jsx,tsx}"`
- **Node.js conventions** → `.claude/rules/node.md` with `glob: "**/*.js"`
- **Python guidelines** → `.claude/rules/python.md` with `glob: "**/*.py"`

### File-Type-Specific Rules

Move rules that only apply to certain files:

- **Markdown formatting** → `.claude/rules/markdown.md` with `glob: "**/*.md"`
- **JSON schema rules** → `.claude/rules/json.md` with `glob: "**/*.json"`
- **Shell script safety** → `.claude/rules/shell.md` with `glob: "**/*.sh"`

## Size Reduction Strategies

### Strategy 1: Remove All Generic Content

Scan for obvious advice that Claude already knows:

1. Search for phrases like "always", "never", "best practice", "should"
2. Ask: "Does this tell Claude something specific about MY project?"
3. If no, delete it

**Example cleanup:**

```diff
- Always write clean, maintainable code.
- Follow SOLID principles.
- Use meaningful variable names.
+
+ Use camelCase for local variables, PascalCase for exported classes.
+ Prefix private methods with underscore: _internalMethod()
```

### Strategy 2: Split Large Sections

Identify sections over 100 lines and split them:

```bash
# Before: CLAUDE.md (45KB)
# Git Workflow (500 lines)
# Testing Standards (300 lines)
# Code Style (400 lines)

# After: CLAUDE.md (15KB)
@import .claude/rules/git-workflow.md
@import .claude/rules/testing.md
@import .claude/rules/style-guide.md
```

### Strategy 3: Consolidate Similar Rules

Find repeated patterns and merge:

```markdown
<!-- DON'T: Repeated rules -->
## TypeScript Files
- Use strict mode
- No any types
- Document exports

## JavaScript Files
- Use strict mode
- Document exports

<!-- DO: Consolidated -->
## Code Standards
- Use strict mode in all files
- Document exported functions/classes
- TypeScript only: Avoid `any`, use explicit types
```

### Strategy 4: Use Frontmatter Scoping

Move rules to `.claude/rules/` with glob patterns to scope them:

```markdown
---
glob: "src/**/*.test.ts"
---

# Testing Standards

These rules only apply to test files.

- Use describe/it blocks
- Mock external dependencies
- Test error cases
```

This removes test rules from CLAUDE.md while keeping them active for test files.

## Calculation Tips

### Check File Size

```bash
# On Unix/Mac
wc -c CLAUDE.md
# Output: 45000 CLAUDE.md (45KB)

# On Windows
powershell -command "(Get-Item CLAUDE.md).length"
```

### Estimate @import Impact

Before splitting, check section size:

```bash
# Count bytes in a section (lines 50-150)
sed -n '50,150p' CLAUDE.md | wc -c
# Output: 8000 (8KB saved if moved to @import)
```

### Verify After Changes

```bash
npx claude-code-lint validate-claude-md --verbose
# Shows current size and threshold status
```

## Before/After Example

### Before (45KB - Warning)

```markdown
# CLAUDE.md

## Project Overview
Long description...

## Git Workflow
500 lines of git instructions...

## Testing Standards
300 lines of testing rules...

## Code Style Guide
400 lines of style rules...

## Always Remember
- Write clean code
- Follow best practices
- Test everything
- Document your work
```

### After (18KB - Clean)

```markdown
# CLAUDE.md

## Project Overview
Concise description of project-specific context.

@import .claude/rules/git-workflow.md
@import .claude/rules/testing.md
@import .claude/rules/style-guide.md

## Project-Specific Rules
Actual unique guidance that Claude needs for YOUR project.
```

**Result:**

- Size reduced: 45KB → 18KB (60% reduction)
- Organization improved: Related rules grouped in focused files
- Maintainability improved: Edit rules in dedicated files
- Clarity improved: CLAUDE.md shows only project-specific content

## Quick Wins

Start with these for immediate size reduction:

1. **Delete generic advice** (typical savings: 5-10KB)
2. **Remove config duplication** (typical savings: 2-5KB)
3. **Split largest section to @import** (typical savings: 8-15KB)
4. **Consolidate repeated patterns** (typical savings: 3-7KB)

**Total potential savings**: 18-37KB from these four actions alone.

## When to Stop Optimizing

You've optimized enough when:

- File size is under 30KB (under warning threshold)
- Content is project-specific (no generic advice)
- Structure is clear (organized sections)
- Rules are scoped (using .claude/rules/ with glob patterns)

Don't over-optimize. The goal is clarity and focus, not minimum file size.
