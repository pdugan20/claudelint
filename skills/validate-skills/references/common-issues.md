# Common Issues

## Error: "Skill name must match directory name"

**Cause**: SKILL.md `name:` field doesn't match the directory name
**Solution**: Rename directory to match, or update the name field
**Example:**

```text
Directory: my-skill/
SKILL.md: name: myskill  [WRONG]

Fix: Change to name: my-skill  [CORRECT]
```

## Warning: "Unknown tool in allowed-tools: bash"

**Cause**: Tool name has incorrect capitalization
**Solution**: Tool names are case-sensitive - use PascalCase
**Valid tool names**: Bash, Read, Write, Edit, Grep, Glob, LSP, WebFetch, WebSearch, Task, TaskOutput, TaskStop, AskUserQuestion, Skill, EnterPlanMode, ExitPlanMode, NotebookEdit
**Example:**

```yaml
# Wrong:
allowed-tools: ["bash", "read"]

# Correct:
allowed-tools: ["Bash", "Read"]
```

## Error: "Dangerous command detected: rm -rf"

**Cause**: Skill contains commands that could damage the system
**Solution**: Review and remove dangerous commands, or use safer alternatives
**Dangerous patterns:**

- `rm -rf /` or `rm -rf *`
- `dd if=/dev/zero of=/dev/sda`
- `mkfs.*`
- `:(){ :|:& };:` (fork bomb)

**Safe alternatives:**

- Use specific paths: `rm -rf ./build` instead of `rm -rf *`
- Validate paths before deletion
- Use `rm -ri` for interactive confirmation

## Warning: "Shell script missing shebang"

**Cause**: Shell script doesn't start with `#!/bin/bash`
**Solution**: Add shebang as first line of script
**Example:**

```bash
#!/bin/bash
# My skill script
set -e
...
```

## Warning: "Skill lacks version field"

**Cause**: SKILL.md frontmatter doesn't include `version:`
**Solution**: Add semantic version to frontmatter
**Example:**

```yaml
---
name: my-skill
description: Does something useful
version: 1.0.0  # Add this
---
```
