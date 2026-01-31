# Anthropic Best Practices Summary

**Source**: "The Complete Guide to Building Skills for Claude" (32 pages, January 2026)
**Location**: `~/Downloads/Docs/claude-skills/The-Complete-Guide-to-Building-Skill-for-Claude.pdf`
**Analysis Date**: 2026-01-30

This document summarizes key validation insights from Anthropic's official 32-page guide, organized by validation category.

---

## Critical Requirements (Must-Have)

### File Structure (p8)

**CRITICAL**: These are explicitly stated requirements, not recommendations

- DONE **One executable script per skill** (no multiple entry points)
- DONE **No README.md in skill folder** (use SKILL.md only)
- DONE **Script must be executable** (chmod +x)
- DONE **Script must have shebang** (#!/bin/bash, #!/usr/bin/env python3, etc.)

**Validation Gap**: We don't check for README.md - this is an explicit requirement we're missing!

### Frontmatter Fields (p9)

**Required fields**:

- `name` - kebab-case, descriptive (not "my-tool", "helper")
- `description` - single sentence, third person, imperative mood
- `compatibility` - **NEW FIELD** (not currently in our schema!)
- `license` - **NEW FIELD** (not currently in our schema!)

**Validation Gap**: Missing `compatibility` and `license` field validation

### Body Content (p10)

**Word count, not line count**:

- DONE **Maximum 5,000 words** (guide explicitly says "words", not lines)
- Current implementation uses line count - **WRONG METRIC**

**Validation Gap**: We're using the wrong metric (lines vs words)

---

## Description Quality (p9-10) - MOST CRITICAL

### Why This Matters

**Direct quote from guide (p9)**:

> "The description is the most important field for triggering your skill. A poorly written description means Claude won't invoke your skill when users need it."

**Impact**: This is THE most important validation we can add - directly affects skill triggering reliability.

### Effective Description Patterns (p9)

**Structure**: `[Action Verb] + [Use Case/Context]`

**Good examples**:

- "Format Python code using Black formatter"
- "Search GitHub repositories for code examples"
- "Generate TypeScript interfaces from JSON schemas"
- "Deploy applications to AWS using CDK"

**Bad examples** (what to flag):

- "This skill helps you format code" (meta-language)
- "A tool for searching GitHub" (not action-focused)
- "Code formatter" (too vague, missing context)
- "My personal deployment script" (first-person)

### Trigger Phrases (p9-10)

**Most effective trigger phrases** to validate presence of:

- **Action verbs**: format, search, generate, deploy, analyze, validate, convert, extract
- **Technology names**: Python, TypeScript, AWS, GitHub, Docker
- **File types**: JSON, YAML, CSV, Markdown
- **Common operations**: parse, transform, migrate, backup, sync

**Validation strategy**: Check description includes at least 2-3 trigger phrases from common vocabulary

### Meta-Language to Avoid (p10)

**Flag these patterns**:

- "This skill..." / "This tool..."
- "Use this to..." / "Use this for..."
- "Helps you..." / "Allows you to..."
- "A script that..." / "A utility for..."

**Why**: Claude already knows it's a skill. Meta-language wastes precious description space and dilutes trigger effectiveness.

**Validation**: Regex patterns to detect and flag meta-language

---

## Progressive Disclosure (p10) - NEW CONCEPT

### The 3-Level System

**Level 1: Frontmatter** (most visible to Claude)

- Name and description only
- Must be optimized for triggering
- Keep concise and action-focused

**Level 2: SKILL.md Body** (loaded when skill triggers)

- Detailed usage instructions
- Examples and common patterns
- Notes, warnings, prerequisites

**Level 3: references/** (linked documentation)

- Extended documentation
- API references
- Troubleshooting guides

### Validation Rules

**Check for proper disclosure**:

- MISSING Don't put implementation details in description
- MISSING Don't duplicate frontmatter content in body
- DONE Description focuses on WHAT and WHEN
- DONE Body focuses on HOW
- DONE References provide deep-dive context

**Example violation**:

```yaml
description: Format Python code using Black formatter with line length 88 and
  automatic string normalization using Black's default configuration
```

**Should be**:

```yaml
description: Format Python code using Black formatter
```

(Details about line length and config go in body)

**Validation Gap**: We don't validate progressive disclosure at all

---

## Body Structure (p10)

### Required Sections

**Standard structure** (validate presence and order):

1. **Usage** - How to invoke the skill
2. **Examples** - Concrete, realistic examples
3. **Notes** - Warnings, prerequisites, limitations

### Example Quality (p10)

**Good examples** (concrete):

```bash
skill-name /path/to/actual/file.py
skill-name src/**/*.ts
```

**Bad examples** (too generic):

```bash
skill-name <your-file>
skill-name [path]
```

**Validation**: Flag placeholder patterns like `<your-X>`, `[path]`, `<file>`, etc.

### Usage Section Clarity (p10)

**Must include**:

- Clear command syntax
- Actual code blocks (not just prose)
- Argument documentation if script accepts args

**Validation**: Check Usage section has at least one code block

---

## Security & Safety (p11-12)

### Dangerous Commands (p12)

**Already implemented well**, but expand to catch:

- Recursive deletion patterns: `rm -rf`, `find -delete`
- System modification: `chmod 777`, `chown`, `sudo`
- Network exposure: `nc -l`, `python -m http.server`
- Eval/injection: `eval`, `exec`, `$()` with user input

### Hardcoded Secrets (p12)

**NEW VALIDATION NEEDED**: Detect hardcoded credentials

**Patterns to flag**:

```bash
API_KEY="sk_live_..."
export TOKEN="eyJ..."
PASSWORD="secret123"
```

**Detection strategy**:

- Regex for common secret patterns (API keys, tokens, passwords)
- High-entropy string detection (random-looking strings >20 chars)
- Known secret prefixes (sk_, ghp_, ey...)

**Validation Gap**: We don't detect hardcoded secrets

### Path Traversal (p12)

**Currently implemented**, but ensure coverage of:

- Direct patterns: `../`, `..\\`
- Symlink patterns: `ln -s`
- Archive extraction without path validation

---

## MCP Integration (p11)

### Tool Reference Format (p11)

**CRITICAL RULE**: MCP tools MUST use qualified names

**Correct**:

```markdown
Use the `github::search-repos` tool to search
```

**Incorrect**:

```markdown
Use the `search-repos` tool to search
```

**Why**: Unqualified names are ambiguous when multiple MCP servers are loaded.

**Validation**: Regex to detect MCP tool references and ensure `server::tool` format

### Server Existence (p11)

**Advanced validation**: Check if referenced MCP servers actually exist

**Strategy**:

- Parse skill for MCP server references
- Query MCP registry (or local config)
- Report if server not found

**Validation Gap**: We don't validate MCP server existence

### Tool Existence (p11)

**Advanced validation**: Check if referenced MCP tools exist on server

**Strategy**:

- Parse skill for `server::tool` references
- Query MCP server for available tools
- Report if tool not found

**Validation Gap**: We don't validate MCP tool existence

---

## Content Quality (p10-11)

### Readability (p10)

**Target audience**: Developers with moderate technical skill

**Validation**:

- Flesch-Kincaid reading level: 8-12 (high school to college)
- Sentence length: <25 words average
- Paragraph length: <5 sentences

**Tool**: Use readability-score library for automated checking

**Validation Gap**: We don't check readability

### Keyword Relevance (p9-10)

**Principle**: Description and body should use vocabulary from the domain

**Example** (good):

- Python formatting skill uses: "Python", "Black", "PEP 8", "format", "style"

**Example** (bad):

- Python formatting skill uses: "code", "file", "process", "run"

**Validation**: Extract keywords, check for domain-specific terms (technology names, file types, common operations)

**Validation Gap**: We don't validate keyword relevance

---

## Common Mistakes (p11-13)

### Troubleshooting Section Insights

The guide's troubleshooting section reveals common mistakes we should validate against:

**1. Skill not triggering** (p11)

**Cause**: Poor description quality

**Our validation**:

- Check for trigger phrases (M1)
- Check for meta-language (M3)
- Check for action verb structure (M2)

**2. Wrong skill triggers** (p11)

**Cause**: Description too generic or overlapping with other skills

**Our validation**:

- Flag overly generic names (E10)
- Warn on generic keywords in description

**3. Script fails to execute** (p12)

**Cause**: Missing shebang, wrong permissions, missing dependencies

**Our validation**:

- Already check shebang (skill-missing-shebang)
- Check for dependency documentation (M12)

**4. Output not understood by Claude** (p12)

**Cause**: Non-standard output format, missing structure

**Our validation**:

- Check for output format documentation (M14)
- Warn on unstructured output

**5. MCP integration broken** (p11)

**Cause**: Unqualified tool names, server not found

**Our validation**:

- Check qualified names (M11)
- Validate server existence (H1)
- Validate tool existence (H2)

---

## Testing & Validation (p12-13)

### Recommended Testing Approach

**Quote from guide (p12)**:

> "Test your skill with realistic examples before publishing. A skill that works in theory but fails in practice is worse than no skill at all."

**Our validation strategy**:

- Every rule must have tests against official Anthropic examples
- Zero false positives is the goal
- Test against both good and bad examples

### Example Skills from Guide

**Use these as test cases** (p8-13):

- `format-python` - Black formatter example
- `github-search` - MCP integration example
- `json-to-typescript` - Code generation example
- `aws-deploy` - Complex multi-step example

**Validation**: Our rules should pass all official examples without false positives

---

## Coverage Analysis

### What We Already Validate Well (DONE ~90%)

- Structural requirements (file structure, naming)
- Basic frontmatter format (name, description length)
- Security basics (dangerous commands, path traversal)
- Shebang presence

### What We Partially Validate (PARTIAL ~30%)

- Description quality (check format but not effectiveness)
- Body content (check existence but not quality)
- Script safety (basic patterns but missing secret detection)

### What We Don't Validate (MISSING 0%)

- **Description trigger phrase effectiveness** ← BIGGEST GAP
- README.md forbidden
- Word count (using wrong metric - lines instead)
- Progressive disclosure principle
- Frontmatter fields: compatibility, license
- MCP tool qualified names
- Hardcoded secrets
- Content readability
- Keyword relevance
- Example quality (concrete vs generic)
- MCP server/tool existence
- Argument documentation
- Output format documentation
- Duplicate content between frontmatter and body

---

## Priority Recommendations

### Tier 1: Critical (Implement Immediately)

1. **Description trigger phrases** (M1) - Biggest impact on skill triggering
2. **README.md forbidden** (E1) - Explicit requirement we're missing
3. **Word count** (E6) - Currently using wrong metric
4. **Hardcoded secrets** (M13) - Security critical

### Tier 2: High Impact

5. **MCP tool qualified names** (M11) - Prevent integration errors
6. **Description structure** (M2) - Core quality
7. **Progressive disclosure** (M4) - New concept, not validated
8. **Frontmatter fields** (E2, E3) - Missing required fields

### Tier 3: Quality Improvements

9. **Example quality** (M6) - Improve skill usability
10. **Readability** (M9) - Content quality
11. **Keyword relevance** (M10) - Domain alignment
12. **MCP server existence** (H1) - Prevent broken references

---

## Implementation Notes

### External Dependencies

**Some validations require external services**:

- **MCP validation** (H1, H2) - Requires MCP registry access
- **LLM evaluation** (H3-H5) - Requires Claude API access
- **External tools** (H10-H12) - Requires shellcheck, pylint, markdownlint

**Strategy**: Implement graceful degradation

- Make external validations opt-in via config
- Cache results to minimize API costs
- Provide clear errors when services unavailable

### Configuration Schema

**Proposed config additions**:

```json
{
  "skills": {
    "enableMcpValidation": true,
    "mcpRegistryUrl": "https://registry.mcp.anthropic.com",
    "enableLlmValidation": false,
    "claudeApiKey": "sk-ant-...",
    "llmBudget": {
      "maxRequestsPerDay": 100,
      "maxCostPerMonth": 10.00
    },
    "enableExternalTools": true,
    "externalToolPaths": {
      "shellcheck": "/usr/local/bin/shellcheck",
      "pylint": "/usr/local/bin/pylint"
    }
  }
}
```

---

## References

### Guide Sections by Page

- **p8**: File structure requirements
- **p9**: Frontmatter schema and description guidelines
- **p10**: Body content structure and progressive disclosure
- **p11**: MCP integration and common mistakes
- **p12**: Security considerations and testing
- **p13**: Troubleshooting guide

### Related Resources

- Official Anthropic skills repository: github.com/anthropics/skills
- MCP registry: registry.mcp.anthropic.com (if available)
- Skill schema documentation: claude.ai/skills/schema

---

## Change Log

### 2026-01-30: Initial Analysis

- Analyzed full 32-page guide
- Identified 44 new validation rules
- Categorized by difficulty (Easy/Medium/Hard)
- Mapped to guide page references
- Identified critical gaps in current implementation

### Key Findings

1. **Description quality is THE most important validation** - biggest impact on skill triggering
2. **We're using wrong metric** - guide says words, we use lines
3. **Missing explicit requirements** - README.md forbidden, compatibility/license fields
4. **Progressive disclosure not validated** - entirely new concept we don't check
5. **Security gaps** - hardcoded secrets, MCP validation

**Next Steps**: Implement Phase 1 (Easy rules) starting with E1, E6, E5
