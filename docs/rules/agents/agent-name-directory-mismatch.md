# Rule: agent-name-directory-mismatch

**Severity**: Error
**Fixable**: No
**Validator**: Agents
**Category**: File Structure

Agent name must match parent directory name

## Rule Details

The agent name in frontmatter must exactly match its parent directory name. This ensures consistency between file structure and agent configuration, making agents easier to discover, reference, and manage.

Claude Code uses the directory structure to locate and load agents. A mismatch between the directory name and the agent name field can cause confusion, broken references, and unexpected behavior.

### Incorrect

Directory name doesn't match frontmatter name:

File: `.claude/agents/code-reviewer/AGENT.md`

```markdown
---
name: reviewer
description: Reviews code changes
---
```

Typo in name:

File: `.claude/agents/security-scanner/AGENT.md`

```markdown
---
name: security-scaner
description: Scans for security issues
---
```

Wrong case (names are case-sensitive):

File: `.claude/agents/test-agent/AGENT.md`

```markdown
---
name: Test-Agent
description: Testing agent
---
```

### Correct

Name matches directory:

File: `.claude/agents/code-reviewer/AGENT.md`

```markdown
---
name: code-reviewer
description: Reviews code changes
---
```

Exact match with hyphens:

File: `.claude/agents/security-vulnerability-scanner/AGENT.md`

```markdown
---
name: security-vulnerability-scanner
description: Scans code for security vulnerabilities
---
```

Single-word match:

File: `.claude/agents/reviewer/AGENT.md`

```markdown
---
name: reviewer
description: Reviews various content
---
```

## How To Fix

To resolve name-directory mismatches:

1. **Option A: Rename the frontmatter name** to match the directory

   ```markdown
   ---
   name: code-reviewer  # Match directory name
   description: Reviews code changes
   ---
   ```

2. **Option B: Rename the directory** to match the frontmatter name

   ```bash
   mv .claude/agents/old-name .claude/agents/new-name
   ```

3. **Ensure exact match**: Names must match exactly, including:
   - All hyphens in the same positions
   - Same capitalization (typically all lowercase)
   - Same spelling

4. **Verify file location**: Ensure AGENT.md is in `.claude/agents/{name}/AGENT.md`

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Name-directory mismatches cause:

- Agents not loading correctly
- Broken agent references from other configurations
- Confusion when searching for agent files
- Inconsistent agent identification
- Issues with agent discovery in Claude Code UI

Always fix the mismatch by renaming either the directory or the name field.

## Related Rules

- [agent-name](./agent-name.md) - Validates agent name format
- [skill-name-directory-mismatch](../skills/skill-name-directory-mismatch.md) - Similar validation for skills

## Resources

- [Rule Implementation](../../src/rules/agents/agent-name-directory-mismatch.ts)
- [Rule Tests](../../tests/rules/agents/agent-name-directory-mismatch.test.ts)

## Version

Available since: v1.0.0
