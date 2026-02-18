# Skill Improvement Guidelines

**Based on**: Anthropic's "Complete Guide to Building Skills for Claude" (Jan 2026)

**Purpose**: Reference document for Phase 2.7 - improving existing skills to follow Anthropic best practices.

## Key Principles from Anthropic Guide

### 1. Description Field is Critical (p11)

**What Anthropic Says**:
> "MUST include BOTH: What the skill does + When to use it (trigger conditions)"
> "Include specific tasks users might say"
> "Under 1024 characters"

**Current Problem**: Our descriptions are implementation-focused, not user-intent focused.

**Bad** (current):

```yaml
description: Validate CLAUDE.md files for size, imports, and structure
```

**Good** (Anthropic pattern):

```yaml
description: Validate CLAUDE.md files for size, imports, and structure. Use when you want to "check my CLAUDE.md", "audit my config", "why is my CLAUDE.md too long", or "validate imports". Checks file size limits, @import directives, frontmatter, and organization.
```

**Pattern**: `[What it does] + [When to use it] + [Trigger phrases] + [Key capabilities]`

### 2. Progressive Disclosure (p5, p13)

**What Anthropic Says**:
> "Skills use a three-level system:
>
> - First level (YAML frontmatter): Always loaded in Claude's system prompt
> - Second level (SKILL.md body): Loaded when Claude thinks skill is relevant
> - Third level (Linked files): Additional files Claude can choose to navigate"

**When to Use**:

- SKILL.md exceeds 5,000 words (p13)
- Detailed API documentation
- Comprehensive examples
- Long reference tables

**How**:

- Move detailed content to `references/` subdirectory
- Link from SKILL.md: "See `references/api-patterns.md` for..."
- Keep SKILL.md focused on core instructions

### 3. Examples Section (p12)

**What Anthropic Says**:
> "Example 1: [common scenario]
> User says: 'Set up a new marketing campaign'
> Actions: [numbered steps]
> Result: [what gets created]"

**Our Pattern**:

```markdown
## Examples

### Example 1: Fix size warnings
**User says**: "My CLAUDE.md is too long"
**Actions**:
1. Run validate-cc-md
2. Show size violations
3. Suggest moving content to @imports
**Result**: User knows which sections to split out

### Example 2: Debug missing imports
**User says**: "Why isn't my import working?"
**Actions**:
1. Check @import directive syntax
2. Verify target file exists
3. Check for circular dependencies
**Result**: Import error resolved with specific fix
```

### 4. Troubleshooting (p13, p25-27)

**What Anthropic Says**:
> "Error: [Common error message]
> Cause: [Why it happens]
> Solution: [How to fix]"

**Important**: NOT generic boilerplate - specific to what that validator checks.

**Our Pattern for validate-cc-md**:

```markdown
## Common Issues

### Error: "File exceeds 50KB"
**Cause**: CLAUDE.md file is too large for Claude's context window
**Solution**: Split content into .claude/rules/ files using @import directives
**Example**: Move testing guidelines to `.claude/rules/testing.md` and add `@import .claude/rules/testing.md`

### Error: "Import not found"
**Cause**: @import directive points to a file that doesn't exist
**Solution**: Check the path is correct relative to CLAUDE.md
**Example**: Use `@import .claude/rules/git.md` not `@import ../rules/git.md`
```

### 5. Standard Fields (Official Schema)

**IMPORTANT**: The official skill schema does NOT support custom `metadata` object. It has `"additionalProperties": false`.

**Available Fields** (from official spec):

```yaml
---
name: skill-name  # Required
description: [improved with triggers]  # Required
version: 1.0.0  # Optional but recommended
tags: [validation, claude-code, linting]  # Optional - for categorization
dependencies: []  # Optional - other skills/tools this depends on
allowed-tools:  # Optional - already present in all our skills
  - Bash
  - Read
# Other optional fields (not currently used):
# argument-hint: "[filename]"  # For skills that take arguments
# model: sonnet  # To specify required model
# context: fork  # To run in subagent
# agent: general-purpose  # Required if context=fork
# user-invocable: true  # Show in / menu (default true)
# disable-model-invocation: false  # Prevent auto-loading (default false)
# hooks: []  # Skill-scoped hooks
---
```

**Fields We'll Add to All Skills**:

1. `version: 1.0.0` - All skills should have versions
2. `tags` - For categorization and discovery
   - validate-* skills: `[validation, claude-code, linting]`
   - format-cc: `[formatting, claude-code, quality]`
3. `dependencies` - Document npm package dependency
   - All skills: `dependencies: ["npm:claude-code-lint"]`

**Source**:

- Official spec: <https://code.claude.com/docs/en/skills#frontmatter-reference>
- Schema file: `/schemas/skill-frontmatter.schema.json` (line 157: `"additionalProperties": false`)

## Skill-by-Skill Improvement Plan

### Priority 1: validate-all (orchestrator)

**Description Update**:

```yaml
description: Run comprehensive claudelint validation on all Claude Code project files. Use when you want to "check everything", "run all validators", "full audit", "validate my entire project", or "what's wrong with my config". Validates CLAUDE.md, skills, settings, hooks, MCP servers, and plugin manifests.
```

**Troubleshooting to Add**:

```markdown
## Common Issues

### Error: "claudelint command not found"
**Cause**: claude-code-lint npm package not installed
**Solution**: Install the package: `npm install --save-dev claude-code-lint`

### Warning: "Multiple validators failed"
**Cause**: Various validation issues across different file types
**Solution**: Run individual validators for detailed errors:
- `claudelint validate-skills` for skill issues
- `claudelint check-claude-md` for CLAUDE.md issues
- `claudelint validate-mcp` for MCP config issues

### Exit code 1 or 2 - what's the difference?
**Exit Code 0**: No errors or warnings
**Exit Code 1**: Warnings found (or warnings treated as errors with --warnings-as-errors)
**Exit Code 2**: Errors found or fatal error (invalid config, crash)
```

**Progressive Disclosure**: Already concise, no changes needed.

### Priority 2: validate-cc-md

**Description Update**:

```yaml
description: Validate CLAUDE.md files for size, imports, and structure. Use when you want to "check my CLAUDE.md", "audit my config", "why is my CLAUDE.md too long", "validate imports", or "fix CLAUDE.md errors". Checks file size limits (30KB warning, 50KB error), @import directives, frontmatter in .claude/rules/, and section organization.
```

**Troubleshooting to Add**:

Add this troubleshooting section to validate-cc-md SKILL.md:

```markdown
## Common Issues

### Error: "File exceeds 50KB"
**Cause**: CLAUDE.md file is too large for Claude's context window
**Solution**: Split content into .claude/rules/ files using @import directives
**Example**: Move testing to .claude/rules/testing.md and add `@import .claude/rules/testing.md`

### Error: "Import not found: .claude/rules/testing.md"
**Cause**: @import directive points to a file that doesn't exist
**Solution**: Check the path is correct relative to CLAUDE.md
**Common mistakes**:
- Using `@import ../rules/testing.md` (wrong - don't use ..)
- Using `@import rules/testing.md` (wrong - missing .claude/)
- Correct: `@import .claude/rules/testing.md`

### Error: "Circular import detected"
**Cause**: File A imports B which imports A (infinite loop)
**Solution**: Reorganize imports to be one-directional
**Example**: CLAUDE.md should import files, but imported files should not import CLAUDE.md back

### Warning: "File exceeds 30KB"
**Cause**: File is approaching the safe limit for Claude's context
**Solution**: Not urgent, but consider splitting large sections into @imports
**Why 30KB?**: Claude can handle up to ~50KB, but staying under 30KB leaves room for growth
```

**Examples to Add**:

```markdown
## Examples

### Example 1: Fix size warnings
**User says**: "My CLAUDE.md is too long"
**What happens**:
1. Skill runs `claudelint check-claude-md`
2. Shows file size (e.g., "35KB / 30KB warning threshold")
3. Lists largest sections that could be split out
**Result**: User knows which sections to move to @imports

### Example 2: Debug missing imports
**User says**: "Why isn't my import working?"
**What happens**:
1. Skill checks @import directive syntax
2. Verifies target file exists
3. Checks for circular dependencies
**Result**: Import error resolved with specific fix suggestion

### Example 3: Validate frontmatter
**User says**: "What's wrong with my .claude/rules/ file?"
**What happens**:
1. Validates YAML frontmatter syntax
2. Checks required `paths` field
3. Ensures frontmatter is properly closed with `---`
**Result**: Frontmatter errors fixed
```

### Priority 3: validate-skills

**Description Update**:

```yaml
description: Validate Claude Code skills for schema, naming, documentation, and security. Use when you want to "check my skill", "validate skill syntax", "why isn't my skill loading", "skill errors", or "dangerous command detected". Validates SKILL.md frontmatter, allowed-tools, file references, directory organization, and shell script security.
```

**Troubleshooting to Add**:

```markdown
## Common Issues

### Error: "Skill name must match directory name"
**Cause**: SKILL.md `name:` field doesn't match the directory name
**Solution**: Rename directory to match, or update the name field
**Example**:
```text
Directory: my-skill/
SKILL.md: name: myskill  [WRONG]

Fix: Change to name: my-skill  [CORRECT]
```

### Warning: "Unknown tool in allowed-tools: bash"

**Cause**: Tool name has incorrect capitalization
**Solution**: Tool names are case-sensitive - use PascalCase
**Valid tool names**: Bash, Read, Write, Edit, Grep, Glob, LSP, WebFetch, WebSearch, Task, TaskOutput, TaskStop, AskUserQuestion, Skill, EnterPlanMode, ExitPlanMode, NotebookEdit
**Example**:

```yaml
# Wrong:
allowed-tools: ["bash", "read"]

# Correct:
allowed-tools: ["Bash", "Read"]
```

### Error: "Dangerous command detected: rm -rf"

**Cause**: Skill contains commands that could damage the system
**Solution**: Review and remove dangerous commands, or use safer alternatives
**Dangerous patterns**:

- `rm -rf /` or `rm -rf *`
- `dd if=/dev/zero of=/dev/sda`
- `mkfs.*`
- `:(){ :|:& };:`
**Safe alternatives**:
- Use specific paths: `rm -rf ./build` instead of `rm -rf *`
- Validate paths before deletion
- Use `rm -ri` for interactive confirmation

### Warning: "Shell script missing shebang"

**Cause**: Shell script doesn't start with `#!/bin/bash`
**Solution**: Add shebang as first line of script
**Example**:

```bash
#!/bin/bash
# My skill script
set -e
...
```

### Warning: "Skill lacks version field"

**Cause**: SKILL.md frontmatter doesn't include `version:`
**Solution**: Add semantic version to frontmatter
**Example**:

```yaml
---
name: my-skill
description: Does something useful
version: 1.0.0  ← Add this
---
```

**Examples to Add**:

```markdown
## Examples

### Example 1: Fix skill naming
**User says**: "My skill isn't loading in Claude"
**What happens**:
1. Checks if directory name matches SKILL.md `name:` field
2. Validates kebab-case naming convention
3. Checks for reserved words (claude, anthropic)
**Result**: Skill renamed correctly and loads properly

### Example 2: Fix tool permissions
**User says**: "Getting 'unknown tool' error"
**What happens**:
1. Validates `allowed-tools` array syntax
2. Checks each tool name against valid tools list
3. Shows correct capitalization
**Result**: allowed-tools field corrected

### Example 3: Security review
**User says**: "Need to validate shell scripts are safe"
**What happens**:
1. Scans scripts for dangerous commands
2. Checks for eval/exec usage
3. Detects path traversal patterns
**Result**: Security issues identified and resolved
```

### Priority 4: validate-plugin

**Description Update**:

```yaml
description: Validate Claude Code plugin manifest files (plugin.json). Use when you want to "check my plugin config", "validate plugin.json", "plugin errors", or "why isn't my plugin loading". Validates JSON syntax, required fields (name, version, description), semantic versioning, and skill file references.
```

**Minimal changes needed** - plugin validation is straightforward, errors are self-explanatory.

### Priority 5: validate-mcp

**Description Update**:

```yaml
description: Validate MCP server configuration files (.mcp.json). Use when you want to "check my MCP config", "why isn't my MCP working", ".mcp.json errors", "validate MCP servers", or "MCP connection failed". Validates transport types (stdio, sse, http, websocket), server names, and environment variables.
```

**Minimal changes needed** - MCP validation is straightforward.

### Priority 6: validate-settings

**Description Update**:

```yaml
description: Validate Claude Code settings.json files for schema, permissions, and security. Use when you want to "check my settings", "validate settings.json", "permission errors", "environment variable issues", or "settings syntax errors". Validates model names, permission rules, hooks configuration, and environment variables.
```

**Minimal changes needed** - settings validation is straightforward.

### Priority 7: validate-hooks

**Description Update**:

```yaml
description: Validate Claude Code hooks.json files for schema, events, and commands. Use when you want to "check my hooks", "validate hooks.json", "hook errors", "why isn't my hook firing", or "hook event types". Validates hook events, types (command, prompt, agent), matcher patterns, and command script references.
```

**Minimal changes needed** - hooks validation is straightforward.

### Priority 8: format-cc

**Description Update**:

```yaml
description: Format Claude Code files with markdownlint, prettier, and shellcheck. Use when you want to "format my files", "fix markdown formatting", "clean up CLAUDE.md", "prettier my config", or "check shell scripts". Auto-fixes markdown, JSON, YAML formatting and analyzes shell script quality.
```

**Already excellent** - has clear modes, options, examples, integration guides.

## Testing Checklist (For Phase 5)

Based on Anthropic guide Chapter 3 (p15-17):

### 1. Triggering Tests

For EACH skill, test:

- [x] Triggers on obvious tasks
- [x] Triggers on paraphrased requests
- [ ] Doesn't trigger on unrelated topics

**Example test suite for validate-cc-md**:

```text
Should trigger:
- "check my CLAUDE.md"
- "validate my config file"
- "why is my CLAUDE.md too long"
- "audit my CLAUDE.md"
- "fix my imports"

Should NOT trigger:
- "what is CLAUDE.md?" (informational, not validation)
- "help me write code" (unrelated)
- "validate my Python code" (wrong domain)
```

### 2. Functional Tests

- [x] Skill executes correct claudelint command
- [x] Dependency checks work (npm package installed)
- [x] Error messages are clear
- [x] Examples in SKILL.md are accurate

### 3. Performance Comparison (p16)

Track for validate-all:

```text
Without skill:
- User provides instructions each time
- 5-10 back-and-forth messages
- Manual command typing

With skill:
- Automatic workflow execution
- 0-1 clarifying questions
- Claude knows exactly what to run
```

## Standard Field Guidelines

All skills should include these fields (where applicable):

```yaml
---
name: skill-name  # Required - kebab-case, max 64 chars
description: [updated with triggers]  # Required - min 10 chars
version: 1.0.0  # Recommended - semantic versioning
tags: [validation, claude-code, linting]  # Recommended - for categorization
dependencies: ["npm:claude-code-lint"]  # Document npm dependency
allowed-tools:  # Already present in all our skills
  - Bash
  - Read
---
```

**Tag Categories** (use relevant tags):

- **Type**: validation, formatting, automation, optimization
- **Platform**: claude-code
- **Domain**: linting, quality, testing, documentation

**Examples**:

- validate-* skills: `[validation, claude-code, linting]`
- format-cc: `[formatting, claude-code, quality]`
- optimize-cc-md: `[automation, claude-code, optimization]`

**Dependencies Format**:

- npm packages: `"npm:package-name"`
- Other skills: `"skill-name"`
- Tools: `"tool-name"`

All our skills depend on the npm package:

```yaml
dependencies: ["npm:claude-code-lint"]
```

## Progressive Disclosure for optimize-cc-md (Phase 3)

**Directory structure**:

```text
optimize-cc-md/
├── SKILL.md (core instructions, <5000 words)
├── references/
│   ├── size-optimization.md (strategies for reducing file size)
│   ├── import-patterns.md (best practices for @import)
│   └── organization-guide.md (section organization)
└── examples/ (optional)
    ├── before-optimization.md
    └── after-optimization.md
```

**SKILL.md stays focused**:

- Core workflow (run validator → explain → ask → edit → verify)
- Link to references for deep dives
- Users can ask Claude to read references if needed

**References contain**:

- Detailed strategies
- Multiple examples
- Edge cases
- Advanced patterns

## Success Criteria

After Phase 2.7 completion:

- [ ] All 8 skills have improved descriptions with trigger phrases
- [ ] Top 3 skills (validate-all, validate-cc-md, validate-skills) have troubleshooting sections
- [ ] Top 3 skills have scenario-based examples
- [ ] All skills have metadata fields (author, category, documentation)
- [ ] validate-all uses progressive disclosure if needed (check word count)
- [ ] Documentation updated to reference new skill quality standards
