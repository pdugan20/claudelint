# Skill Specifications

## Naming Constraints

**Source**: Anthropic Skills Guide p11 - "Wrong skill triggers" caused by generic names

### Forbidden Patterns

**Bad** **Reserved words**: `claude`, `anthropic`
**Bad** **Single-word verbs**: `format`, `validate`, `test`, `build`, `deploy`
**Bad** **Generic nouns only**: `helper`, `utils`, `tool`, `manager`, `handler`

### Required Patterns

**Good** **Be specific** - Name must indicate what the skill does
**Good** **Use descriptive suffixes** - Add context about scope or target
**Good** **Multi-word preferred** - Single words too generic

### Our Naming Conventions

**Pattern 1**: `-all` suffix for comprehensive actions

- `validate-all` (validates all project files) - renamed from `validate`

**Pattern 2**: `-cc` suffix for Claude Code-specific operations

- `format-cc` (formats Claude Code files) - renamed from `format`

**Pattern 3**: `-cc-md` suffix for CLAUDE.md operations

- `validate-cc-md` (validates CLAUDE.md) - renamed from `validate-agents-md`
- `optimize-cc-md` (optimizes CLAUDE.md)

**Pattern 4**: Specific targets

- `validate-hooks`, `validate-settings`, `validate-skills` - already specific

### Rationale

- **Prevents triggering issues**: Generic names cause skills to trigger incorrectly (guide p11)
- **Clear intent**: User knows exactly what the skill does
- **Consistent**: All skills follow similar patterns
- **No reserved words**: Avoids Anthropic's naming restrictions

---

## Skill: optimize-cc-md

**Status**: Spec only - not yet implemented

### Quick Summary

**What it does**: When user runs `/optimize-cc-md`, Claude interactively helps them fix and improve their CLAUDE.md file.

**How it works**:

1. Claude runs `claudelint check-claude-md` to find violations
2. Claude reads their CLAUDE.md file
3. Claude explains problems in conversational language
4. Claude asks what to fix
5. **Claude actually makes the edits** using Edit/Write tools
6. Claude creates @import files if needed
7. Claude shows before/after results

**This is NOT**: A CLI tool, script, or automated fixer. It's instructions for Claude to work with the user interactively.

See detailed spec at line 269 below.

---

## DEPRECATED: workspace-config-init skill

**NOT BUILDING THIS** - Claude Code has built-in `/init` command.

Original spec preserved for reference below (DO NOT IMPLEMENT):

### Purpose (DEPRECATED)

Initialize a new CLAUDE.md file following best practices from Anthropic documentation.

### Trigger Phrases

Users might say:

- "initialize CLAUDE.md"
- "create a new CLAUDE.md"
- "set up project config for Claude"
- "help me configure Claude for this project"
- "create workspace config"
- "set up CLAUDE.md"

### YAML Frontmatter

```yaml
---
name: workspace-config-init
description: Initialize a new CLAUDE.md file following best practices. Use when the user asks to "create CLAUDE.md", "initialize workspace config", "set up project config for Claude", or "help me configure CLAUDE.md".
metadata:
  author: Pat Dugan
  version: 1.0.0
  category: configuration
  tags: [claude-md, configuration, best-practices]
allowed-tools: "Read Write Glob Grep Bash"
---
```

### Workflow

#### Step 1: Project Detection

Analyze the project to understand what to include:

```markdown
## Project Detection

1. **Language/Framework Detection**
   - Check for package.json (Node.js)
   - Check for requirements.txt/pyproject.toml (Python)
   - Check for Cargo.toml (Rust)
   - Check for go.mod (Go)
   - Check for .swift files (Swift)

2. **Build System Detection**
   - npm/yarn/pnpm scripts
   - Make files
   - Custom build scripts

3. **Testing Framework Detection**
   - Jest/Vitest/Mocha (JS)
   - pytest/unittest (Python)
   - cargo test (Rust)

4. **Linter/Formatter Detection**
   - ESLint + Prettier
   - Ruff/Black (Python)
   - rustfmt
```

#### Step 2: Template Selection

Based on detection, choose appropriate template:

```markdown
## Templates

Templates stored in `references/templates/`:

- `node-project.md` - Node.js projects
- `python-project.md` - Python projects
- `rust-project.md` - Rust projects
- `generic-project.md` - Fallback template
```

#### Step 3: Content Generation

Generate CLAUDE.md sections:

```markdown
## Generated Sections

### Required Sections

1. **Code Style** (if different from defaults)
   - Language-specific conventions
   - Extracted from linter configs

2. **Workflow** (if non-standard commands)
   - How to run tests
   - How to build
   - How to deploy (if scripts exist)

3. **Testing** (if test framework detected)
   - Preferred test runner
   - How to run subset of tests
   - Mock/fixture locations

### Optional Sections

4. **Git Workflow** (if .git exists)
   - Branch naming conventions
   - PR guidelines

5. **Environment** (if .env.example exists)
   - Required environment variables
   - Setup instructions

6. **Architecture** (if complex structure)
   - Key architectural patterns
   - Directory organization
```

#### Step 4: Validation & Refinement

Run validation on generated CLAUDE.md:

```markdown
## Validation

1. **Run claude-md validators**
   - Check length (<200 lines preferred)
   - No obvious content
   - No config duplication
   - Valid imports

2. **Provide feedback**
   - "Generated CLAUDE.md is X lines (under 200 ✓)"
   - "Detected 3 linter config duplications - removed"
   - "Added imports for detailed docs"

3. **Offer refinement**
   - "Would you like me to move testing details to @docs/testing.md?"
   - "I can create separate files for git-workflow and architecture"
```

#### Step 5: File Creation

Write the file and provide guidance:

```markdown
## File Creation

1. **Write CLAUDE.md**
   - Location: Project root
   - Format: Markdown with sections
   - Length: Target <200 lines

2. **Create imported files if needed**
   - docs/testing.md
   - docs/architecture.md
   - docs/git-workflow.md

3. **Provide next steps**
   - "CLAUDE.md created successfully"
   - "Review and adjust sections as needed"
   - "Run `claudelint validate-claude-md` to check"
   - "Start a new Claude session to test"
```

### Error Handling

```markdown
## Error Handling

### If CLAUDE.md already exists

1. Warn user: "CLAUDE.md already exists at ./CLAUDE.md"
2. Offer options:
   - "Would you like me to optimize the existing file instead?"
   - "Should I create CLAUDE.local.md for personal overrides?"
   - "I can back up existing and create new one"

### If project structure unclear

1. Use generic template
2. Ask clarifying questions:
   - "What languages/frameworks are you using?"
   - "How do you run tests in this project?"
   - "Are there specific conventions I should include?"

### If unable to write file

1. Show generated content to user
2. Provide instructions to create manually
3. Offer to save to clipboard
```

### Testing Approach

```markdown
## Testing

### Test Cases

1. **Node.js project with Jest**
   - Should detect package.json
   - Should include npm test command
   - Should mention Jest in testing section

2. **Python project with pytest**
   - Should detect requirements.txt
   - Should include pytest command
   - Should mention pytest conventions

3. **Project with existing config files**
   - Should detect .eslintrc
   - Should NOT duplicate rules in CLAUDE.md
   - Should reference config files

4. **Minimal project**
   - Should generate minimal CLAUDE.md
   - Should not hallucinate conventions
   - Should stay under 100 lines

### Trigger Testing

Test these trigger phrases:
- "initialize CLAUDE.md"
- "create workspace config"
- "set up Claude for this project"
- "help me configure CLAUDE.md"

Should NOT trigger on:
- "what is CLAUDE.md?" (informational)
- "read my CLAUDE.md" (different action)
```

---

## Skill 2: optimize-cc-md

### Purpose

**Interactively help users optimize their CLAUDE.md files.**

When invoked via `/optimize-cc-md`, this skill provides instructions for Claude to:

- Run validation and identify violations
- Read the user's CLAUDE.md file
- Explain problems conversationally (not just dump CLI output)
- Ask user what they want to fix
- **Actually make the edits** using Edit/Write tools
- Create @import files if splitting content
- Show before/after comparison

This is Claude helping the user improve their file, NOT an automated script.

### Trigger Phrases

Users might say:

- "optimize my CLAUDE.md"
- "audit my workspace config"
- "improve my CLAUDE.md"
- "check my CLAUDE.md for issues"
- "make my CLAUDE.md better"
- "review my project config"

### YAML Frontmatter

```yaml
---
name: optimize-cc-md
description: Audit and optimize an existing CLAUDE.md file. Use when the user asks to "optimize CLAUDE.md", "improve workspace config", "audit CLAUDE.md", "check CLAUDE.md for issues", or "make CLAUDE.md better".
metadata:
  author: Pat Dugan
  version: 1.0.0
  category: configuration
  tags: [claude-md, optimization, audit, best-practices]
allowed-tools: "Read Write Glob Grep"
---
```

### Workflow

#### Step 1: Read & Analyze

```markdown
## Analysis

1. **Read current CLAUDE.md**
   - Location: ./CLAUDE.md
   - If not found, check ./CLAUDE.local.md
   - If not found, suggest user run `/init` to create one

2. **Run all CLAUDE.md validators**
   - claude-md-file-length
   - claude-md-import-syntax
   - claude-md-obvious-content
   - claude-md-hook-commands
   - claude-md-config-location

3. **Calculate metrics**
   - Total lines
   - Estimated token usage
   - Number of sections
   - Number of imports
   - Duplication with config files
```

#### Step 2: Identify Issues

```markdown
## Issue Detection

### Bloat Issues

- File >200 lines
- Redundant sections
- Obvious content (detected by validator)
- Content Claude can infer from code

### Duplication Issues

- Code style rules in both CLAUDE.md and .eslintrc
- Testing commands duplicated from package.json
- Information that's in README.md

### Structure Issues

- Missing section headers
- Poor organization
- No progressive disclosure (everything in main file)

### Content Issues

- Outdated information
- References to deleted files/scripts
- Incorrect commands
```

#### Step 3: Generate Recommendations

```markdown
## Recommendations

### Format

For each issue, provide:

1. **Issue**: Description of problem
2. **Impact**: Why it matters (token waste, ignored rules, etc.)
3. **Fix**: Specific action to take
4. **Before/After**: Show the change

### Example Output

```

## Audit Results

### Issues Found: 4

#### 1. File Length (Warning)

- **Issue**: CLAUDE.md is 247 lines (target <200)
- **Impact**: Claude may ignore later sections
- **Fix**: Move testing details to @docs/testing.md
- **Savings**: ~50 lines

#### 2. Duplicated Config (Warning)

- **Issue**: Code style rules duplicated in .eslintrc
- **Impact**: Wastes tokens, configs are source of truth
- **Fix**: Remove these lines from CLAUDE.md:
  - "Use 2 spaces for indentation"
  - "Use single quotes for strings"
  - "Require semicolons"
- **Savings**: ~15 lines

#### 3. Obvious Content (Info)

- **Issue**: Generic advice Claude already knows
- **Impact**: Minor token waste
- **Fix**: Remove these lines:
  - "Write clean, maintainable code"
  - "Use meaningful variable names"
- **Savings**: ~5 lines

#### 4. Stale Information (Error)

- **Issue**: References deleted deploy script
- **Impact**: Claude will try to use non-existent script
- **Fix**: Update or remove: "./deploy.sh"

```text
```

#### Step 4: Offer Automated Fixes

```markdown
## Automated Fixes

### Safe Fixes (Auto-apply)

Issues that can be safely fixed automatically:
- Remove obvious content (validated patterns)
- Remove exact duplicates from config files
- Fix import syntax errors

### Manual Fixes (User approval required)

Issues requiring judgment:
- Moving content to imported files
- Removing potentially stale information
- Restructuring sections

### Workflow

1. **Present findings**
   - Show all issues with severity
   - Estimated impact of each fix
   - Total potential savings

2. **Ask for permission**
   - "May I auto-fix the 3 safe issues?"
   - "Would you like me to move testing details to separate file?"
   - "Should I remove the stale deploy script reference?"

3. **Apply fixes**
   - Make changes
   - Show diff
   - Save backup as CLAUDE.md.backup

4. **Validate results**
   - Run validators on updated file
   - Confirm issues resolved
   - Report final metrics
```

#### Step 5: Report Results

```markdown
## Results Report

### Format

```

## Optimization Complete

### Changes Made

**Good** Removed 3 instances of obvious content (-8 lines)
**Good** Removed config duplications (-15 lines)
**Good** Moved testing details to @docs/testing.md (-42 lines)
**Good** Fixed 2 import syntax errors
**Warning**  Manual review needed for outdated deploy script reference

### Before/After

- **Length**: 247 lines → 182 lines (65 lines saved)
- **Token estimate**: ~800 → ~600 (~200 tokens saved)
- **Validation**: 4 warnings → 1 warning

### Next Steps

1. Review CLAUDE.md.backup if you want to restore anything
2. Test the optimized CLAUDE.md in a new Claude session
3. Consider moving architecture docs to @docs/architecture.md (32 additional lines could be saved)

Would you like me to make any additional optimizations?

```text
```

### Error Handling

```markdown
## Error Handling

### If CLAUDE.md not found

1. "No CLAUDE.md found in current directory"
2. Offer: "Would you like me to create one using workspace-config-init?"

### If CLAUDE.md is already optimal

1. "Great news! Your CLAUDE.md is already well-optimized:"
2. Show metrics:
   - Length: 145 lines ✓
   - No duplications found ✓
   - No obvious content ✓
   - All imports valid ✓
3. "No changes recommended"

### If unable to read referenced imports

1. Warn: "Import @docs/testing.md referenced but file doesn't exist"
2. Offer: "Should I remove this import or create the file?"

### If changes would break functionality

1. Show warning: "Removing this section may affect Claude's behavior"
2. Ask for confirmation
3. Create backup before proceeding
```

### Testing Approach

```markdown
## Testing

### Test Cases

1. **Bloated CLAUDE.md (300+ lines)**
   - Should identify bloat
   - Should suggest moving content to imports
   - Should calculate savings accurately

2. **CLAUDE.md with config duplication**
   - Should detect duplicated rules from .eslintrc
   - Should suggest removal
   - Should verify rules exist in config before removing

3. **Well-optimized CLAUDE.md**
   - Should report "already optimal"
   - Should not suggest unnecessary changes
   - Should show positive metrics

4. **CLAUDE.md with broken imports**
   - Should detect missing imported files
   - Should offer to fix or remove
   - Should validate import syntax

### Trigger Testing

Test these trigger phrases:
- "optimize my CLAUDE.md"
- "audit my workspace config"
- "improve my CLAUDE.md"
- "check CLAUDE.md for issues"

Should NOT trigger on:
- "create CLAUDE.md" (use init skill)
- "what's in my CLAUDE.md?" (informational)
```

---

## Implementation Notes

### File Structure

```text
.claude/skills/
├── workspace-config-init/
│   ├── SKILL.md
│   ├── references/
│   │   ├── templates/
│   │   │   ├── node-project.md
│   │   │   ├── python-project.md
│   │   │   ├── rust-project.md
│   │   │   └── generic-project.md
│   │   └── best-practices.md
│   └── scripts/
│       └── detect-project.sh (optional)
└── optimize-cc-md/
    ├── SKILL.md
    ├── references/
    │   └── optimization-patterns.md
    └── scripts/
        └── calculate-metrics.sh (optional)
```

### Integration with Validators

Both skills should use the CLAUDE.md validators from Phase 2:

```typescript
// Pseudo-code for skill integration
import { validateClaudeMd } from '@claudelint/validators';

// In workspace-config-init
const generated = generateClaudeMd(project);
const result = validateClaudeMd(generated);
if (result.errors.length > 0) {
  refineContent(generated, result.errors);
}

// In optimize-cc-md
const current = readClaudeMd();
const result = validateClaudeMd(current);
presentRecommendations(result);
```

### Progressive Disclosure

Both skills should keep SKILL.md concise:

- Core instructions in SKILL.md (<5,000 words)
- Detailed templates in `references/templates/`
- Best practices in `references/best-practices.md`
- Only load templates when needed

### Testing Integration

- Unit tests for detection logic
- Integration tests for full workflow
- E2E tests for skill triggering
- Validation tests for generated content
