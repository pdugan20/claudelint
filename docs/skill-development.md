# Skill Development Guide

Guide for developing high-quality Claude Code skills for the claudelint plugin.

## Table of Contents

- [Quick Start](#quick-start)
- [Skill Quality Standards](#skill-quality-standards)
- [Skill Structure](#skill-structure)
- [Testing Requirements](#testing-requirements)
- [Contributing Skills](#contributing-skills)

## Quick Start

### Creating a New Skill

1. Create skill directory:

```bash
mkdir -p .claude/skills/my-skill
cd .claude/skills/my-skill
```

1. Create SKILL.md with frontmatter:

```markdown
---
name: my-skill
description: [What it does] + [When to use] + [Trigger phrases] + [Key capabilities]
version: 1.0.0
tags:
  - validation
  - claude-code
dependencies:
  - npm:claude-code-lint
allowed-tools:
  - Bash(claudelint *)
  - Read
---

# Usage

[Core instructions for Claude]
```

1. Test your skill:

```bash
# Validate structure
claudelint validate-skills .claude/skills/my-skill

# Test manually (see docs/skill-testing.md)
```

## Skill Quality Standards

Based on [Anthropic's Complete Guide to Building Skills for Claude](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf) (Jan 2026).

### 1. Description Field (CRITICAL)

**Requirement**: Description must include ALL of these:

1. What the skill does
2. When to use it (trigger conditions)
3. Specific user phrases that should trigger it
4. Key capabilities

**Pattern**: `[What] + [When] + [Triggers] + [Capabilities]`

**Character limit**: Under 1024 characters

**Bad** (implementation-focused):

```yaml
description: Validate CLAUDE.md files for size, imports, and structure
```

**Good** (user-intent focused):

```yaml
description: Validate CLAUDE.md files for size, imports, and structure. Use when you want to "check my CLAUDE.md", "audit my config", "why is my CLAUDE.md too long", "validate imports", or "fix CLAUDE.md errors". Checks file size limits (30KB warning, 50KB error), @import directives, frontmatter in .claude/rules/, and section organization.
```

**Why this matters**: The description field determines when Claude loads your skill. Poor descriptions = skill never triggers.

### 2. Naming Conventions

Skills MUST follow naming rules to avoid conflicts:

**Required patterns**:

- Be specific about what the skill does
- Use suffixes to clarify scope:
  - `-all` for comprehensive actions (`validate-all`)
  - `-cc` for Claude Code operations (`format-cc`, `validate-cc-md`)
  - Specific targets: `-hooks`, `-settings`, `-skills`
- Multi-word names preferred over single words

**Forbidden patterns**:

- Reserved words: `claude`, `anthropic` (Anthropic policy)
- Single-word verbs: `format`, `validate`, `test`, `build` (causes wrong skill triggers)
- Generic nouns: `helper`, `utils`, `tool`, `manager`

**Examples**:

- `validate-all` (not `validate`)
- `format-cc` (not `format`)
- `validate-cc-md` (not `validate-agents-md` or `claude-md-validate`)
- `optimize-cc-md` (not `optimize`)

See [docs/skill-naming.md](skill-naming.md) for complete naming guide.

### 3. Progressive Disclosure

**When to use**: SKILL.md exceeds 3,000-5,000 words

**Three-level system** (Anthropic p5, p13):

1. **Frontmatter** (YAML) - Always loaded in Claude's system prompt
2. **SKILL.md body** - Loaded when Claude thinks skill is relevant
3. **references/ files** - Additional files Claude can navigate to

**Structure**:

```text
my-skill/
├── SKILL.md              # Core instructions (<5,000 words)
├── references/           # Detailed documentation
│   ├── api-patterns.md
│   ├── examples.md
│   └── troubleshooting.md
└── scripts/              # Bundled scripts (if needed)
    └── helper.sh
```

**Link from SKILL.md**:

```markdown
See `references/api-patterns.md` for detailed API documentation.
```

**Example**: optimize-cc-md skill uses this pattern:

- `SKILL.md` - Core workflow (2,800 words)
- `references/size-optimization.md` - Size reduction strategies
- `references/import-patterns.md` - @import best practices
- `references/organization-guide.md` - Section organization

### 4. Examples Section

**Required for complex skills** (validation, optimization, formatting)

**Pattern** (Anthropic p12):

```markdown
## Examples

### Example 1: Common scenario name
**User says**: "exact phrase user might say"
**Actions**:
1. First step
2. Second step
3. Third step
**Result**: What gets created/fixed

### Example 2: Another scenario
**User says**: "different phrase"
**Actions**:
1. ...
**Result**: ...
```

**Real example** (from validate-cc-md):

```markdown
### Example 1: Fix size violations
**User says**: "My CLAUDE.md is too long"
**Actions**:
1. Run validate-cc-md
2. Show size violations (WARNING at 30KB, ERROR at 50KB)
3. Suggest moving content to @imports
**Result**: User knows which sections to split out
```

### 5. Troubleshooting Section

**Required for**:

- Skills with >3 scripts
- Skills that edit files (optimize-cc-md, format-cc)
- Skills with complex dependencies

**Focus on**: Issues users encounter **using** the skill, not issues the skill helps fix

**Bad** (these belong in Examples):

```markdown
## Troubleshooting

- CLAUDE.md too large → Use @imports
- Circular imports detected → Break the cycle
```

**Good** (actual skill usage issues):

```markdown
## Troubleshooting

### Skill creates @import but path is wrong
- **Cause**: Skill assumes .claude/rules/ directory
- **Fix**: Create directory first: `mkdir -p .claude/rules`

### Validation runs but shows no output
- **Cause**: Running in wrong directory
- **Fix**: Run from project root where CLAUDE.md exists
```

### 6. Required Frontmatter Fields

**Minimum required**:

```yaml
name: skill-name           # Matches directory name
description: [see above]   # Includes triggers
version: 1.0.0            # Semantic versioning
```

**Recommended**:

```yaml
tags:                      # For discoverability
  - category
  - type
dependencies:              # External requirements
  - npm:package-name
allowed-tools:             # Claude tools this skill can use
  - Bash(command-pattern)
  - Read
  - Edit
  - Write
```

**Optional but useful**:

```yaml
author: Your Name
category: validation       # validation, formatting, optimization
documentation: URL         # Link to detailed docs
```

### 7. Skill Body Structure

**Recommended sections** (in order):

```markdown
# Usage

[Core instructions - what Claude should do]

## Options

[If skill accepts arguments]

## Examples

[Scenario-based examples - see section 4]

## Troubleshooting

[Common issues - see section 5]

## Notes

[Important caveats, limitations, best practices]
```

**Keep it focused**: SKILL.md should be core instructions only. Move detailed content to references/.

## Skill Structure

### Validation Skills

Skills that run claudelint commands to validate files.

**Pattern**:

```markdown
---
name: validate-something
description: Validate X files. Use when "check my X", "validate X", "X errors"...
dependencies:
  - npm:claude-code-lint
allowed-tools:
  - Bash(claudelint validate-something *)
  - Read
---

# Usage

Run validation:

```bash
claudelint validate-something [--verbose] [--explain]
```bash

Parse output and explain issues to user.
```

**Examples**: validate-all, validate-cc-md, validate-skills, validate-hooks, validate-mcp, validate-settings, validate-plugin

### Optimization/Interactive Skills

Skills that help users fix issues interactively.

**Pattern**:

```markdown
---
name: optimize-something
description: Interactively optimize X. Use when "optimize my X", "X too large"...
dependencies:
  - npm:claude-code-lint
allowed-tools:
  - Bash(claudelint *)
  - Read
  - Edit
  - Write
---

# Usage

1. Run validation to identify issues
2. Read the file to analyze
3. Explain violations conversationally
4. Ask what user wants to fix
5. Use Edit/Write tools to make changes
6. Show before/after results
```

**Examples**: optimize-cc-md

### Formatting Skills

Skills that auto-fix formatting issues.

**Pattern**:

```markdown
---
name: format-something
description: Format X files. Use when "format my X", "clean up X"...
dependencies:
  - npm:claude-code-lint
  - npm:prettier (if needed)
  - npm:markdownlint-cli (if needed)
allowed-tools:
  - Bash(claudelint *)
  - Bash(prettier *)
  - Bash(markdownlint *)
---

# Usage

Run formatting tools:

```bash
# Run formatter
prettier --write file.md

# Run linter with auto-fix
markdownlint --fix file.md
```text

Show summary of changes.
```

**Examples**: format-cc

## Testing Requirements

All skills MUST be tested before merging. See [docs/skill-testing.md](skill-testing.md) for complete methodology.

### Automated Testing (Required)

**Use claudelint itself to validate your skill** (dogfooding):

```bash
# Validate skill structure
claudelint validate-skills .claude/skills/my-skill

# This checks:
# - Frontmatter schema (name, description, version, etc.)
# - File structure (no README.md in skill folder)
# - Security (dangerous commands, hardcoded secrets)
# - Referenced files exist
# - And 28+ other validation rules
```

**Pre-commit requirement**: All skills must pass `claudelint validate-skills` before commit.

### Manual Testing (Required)

**Test trigger phrases**:

1. Start fresh Claude session
2. Ask: "check my X" (should load skill)
3. Ask: "what is X?" (should NOT load skill - informational)
4. Test paraphrased requests

**Test functionality**:

1. Test with valid input (should work)
2. Test with invalid input (should detect issues)
3. Test edge cases (empty files, huge files, etc.)

**Test quality**:

1. Does Claude explain issues clearly? (not just error dump)
2. Does Claude use the correct command?
3. Does skill provide value? (better than manual)

**Time estimate**: 30-60 minutes per skill

See [docs/skill-testing.md](skill-testing.md) for detailed testing protocols.

## Contributing Skills

### Submission Requirements

Before submitting a PR with a new skill:

1. Skill passes automated validation:

   ```bash
   claudelint validate-skills .claude/skills/your-skill
   ```

2. Description includes trigger phrases (see Quality Standards section 1)

3. Examples section included (if complex skill)

4. Troubleshooting section included (if >3 scripts or edits files)

5. Manual testing completed:
   - Trigger phrases tested
   - Functionality tested with edge cases
   - Quality verified (clear explanations)

6. Documentation updated:
   - Add skill to README.md skills list
   - Add skill to .claude-plugin/README.md
   - Update CHANGELOG.md

### PR Template

```markdown
## New Skill: skill-name

**Description**: [One line description]

**Trigger phrases**: "phrase 1", "phrase 2", "phrase 3"

**Testing**:

- [ ] Passes `claudelint validate-skills`
- [ ] Trigger phrases tested (90%+ success rate)
- [ ] Functionality tested with edge cases
- [ ] Quality verified (clear explanations)

**Changes**:

- [ ] README.md updated
- [ ] .claude-plugin/README.md updated
- [ ] CHANGELOG.md updated
```

### Review Process

Reviewers will check:

1. Automated validation passes
2. Description follows quality standards
3. Naming follows conventions
4. Examples are clear and realistic
5. Troubleshooting addresses actual usage issues
6. Manual testing results documented

## References

- [Anthropic's Complete Guide to Building Skills for Claude](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf) (Jan 2026)
- [Skill Naming Conventions](skill-naming.md)
- [Skill Testing Guide](skill-testing.md)
- [Skill Improvement Guidelines](projects/plugin-and-md-management/skill-improvement-guidelines.md) - Internal reference
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills.md)

## Examples

### Complete Skill Examples

Study these bundled skills as references:

**Simple validation skill**:

- `validate-cc-md` - Basic pattern: run command, parse output, explain

**Complex validation skill**:

- `validate-all` - Runs multiple validators, aggregates results

**Interactive skill with progressive disclosure**:

- `optimize-cc-md` - Uses references/, Edit/Write tools, conversational workflow

**Formatting skill**:

- `format-cc` - Runs multiple formatters, shows summary

### Skill Templates

See `.claude/skills/` directory for complete working examples.

## FAQ

**Q: When should I use progressive disclosure?**
A: When SKILL.md exceeds 3,000-5,000 words. Move detailed content to references/ subdirectory.

**Q: How do I test trigger phrases?**
A: Start fresh Claude session and ask naturally. If skill doesn't load 90%+ of the time, improve description field.

**Q: Can I use single-word skill names like "test" or "format"?**
A: No. These cause "wrong skill triggers" (Anthropic guide p11). Use specific names: `test-all`, `format-cc`.

**Q: Do I need examples for simple validation skills?**
A: Examples are optional for simple skills, but recommended for skills with >3 scripts or that edit files.

**Q: What goes in Troubleshooting vs Examples?**
A: Examples = issues the skill helps fix. Troubleshooting = issues users encounter using the skill.

**Q: How long should descriptions be?**
A: Under 1024 characters. Include what, when, triggers, and capabilities.

**Q: Can I include emoji in skills?**
A: No. Emoji are not allowed in any markdown files in this project (enforced by pre-commit hook).
