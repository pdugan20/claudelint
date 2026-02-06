# Troubleshooting

Solutions for common problems when using the optimize-cc-md skill.
For the full optimization workflow, see the [main skill](../SKILL.md).

## Skill won't run - "claudelint command not found"

**Problem:** You see "Error: claudelint CLI not installed" when running the skill.

**Solution:** Install the claudelint npm package:

```bash
npm install --save-dev claude-code-lint
```

The optimize-cc-md skill requires the claudelint CLI to run validation. The skill checks for this dependency automatically.

## @import paths don't work after creating files

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

## Validation still shows size violation after optimization

**Problem:** You split content to @imports but CLAUDE.md still reports 45KB.

**Possible causes:**

1. **@import content counts toward total:** Imported files add to total size. The goal is to stay under 30KB total (CLAUDE.md + all imports).

2. **Large imports:** Check individual import file sizes:

   ```bash
   wc -c .claude/rules/*.md
   ```

3. **Didn't remove generic content:** Size violations often require both splitting AND removing bloat.

**Fix:** Remove more generic content, or split largest import files into smaller focused files.

## Skill suggests removing content I want to keep

**Problem:** Skill identifies "generic advice" that's actually important for your project.

**Solution:** Tell Claude which content to keep:

- "Keep the git workflow section, it's project-specific"
- "Don't remove the testing rules, our project has unique requirements"

Claude will adjust recommendations based on your feedback. The skill suggests removals but always asks before making changes.

## Circular import error after creating @imports

**Problem:** Validation shows "Circular import detected: A.md -> B.md -> A.md"

**Cause:** One of the import files imports another file that imports the first one back.

**Solution:**

1. Keep imports hierarchical - CLAUDE.md should import everything, but import files should NOT import each other:

   ```text
   GOOD: CLAUDE.md -> git-workflow.md
   GOOD: CLAUDE.md -> testing.md
   BAD: git-workflow.md -> testing.md -> git-workflow.md
   ```

2. If two files need shared content, extract it to a third file:

   ```text
   Before (circular):
   git-workflow.md -> shared.md
   testing.md -> shared.md
   shared.md -> git-workflow.md  BAD

   After (hierarchical):
   CLAUDE.md -> shared.md
   CLAUDE.md -> git-workflow.md
   CLAUDE.md -> testing.md  GOOD
   ```

## Skill creates too many small files

**Problem:** Skill split content into 15 small @import files, making it hard to maintain.

**Solution:** Ask Claude to consolidate related files:

- "Merge the three git files into one git-workflow.md"
- "Combine testing-unit.md and testing-integration.md"

Aim for 5-10 focused import files, not 20+ tiny ones. Each file should cover a complete topic.
