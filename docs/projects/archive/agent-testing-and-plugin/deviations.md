# Agent Testing & Plugin Agent: Deviations Log

**Project**: Agent Testing, Plugin Agent, and Documentation Improvements
**Created**: 2026-02-15

## Deviations from Plan

### 1. Agent description schema relaxed

**Plan said**: Create agent with `<example>` blocks in description, following first-party convention
**What we did**: Had to remove `noXMLTags` and `thirdPerson` refinements from the agent description schema
**Reason**: All 16 first-party Claude agents use `<example>` and `<commentary>` XML tags in descriptions, and example blocks naturally contain dialog with "I" and "you". These refinements were inherited from skill descriptions where they make sense (skills have simple one-liner descriptions), but agent descriptions are multi-paragraph text with structured examples. The schema was too strict for the official convention.

### 2. `delegate` field removed from docs table

**Plan said**: Add `color` to the agent frontmatter table
**What we did**: Also removed the `delegate` boolean row and added `delegate` to the `permissionMode` enum values
**Reason**: During the agents rework, `delegate` was incorrectly added as a separate boolean field in the docs. It's actually a `permissionMode` enum value, not a standalone field. Fixed while updating the table.

### 3. Invalid fixture description changed

**Plan said**: (inherited from agents rework) Fixture agent had `description: I help you`
**What we did**: Changed to `description: Too short`
**Reason**: After removing `thirdPerson` from the schema, `"I help you"` (10 chars) no longer triggered `agent-description`. Changed to a 9-char string to still trigger the min-length check and keep the integration test error count stable.

### 4. Rule ID rename added to scope

**Plan said**: Rule ID rename was explicitly deferred in the agents rework (deviation #1)
**What we did**: Adding it to this project's scope
**Reason**: User is the only consumer; the backwards-compatibility concern that justified deferral doesn't apply. Renaming `agent-name-directory-mismatch` to `agent-name-filename-mismatch` now while the agents subsystem is being actively worked on.

### 5. Schema-vs-rules architecture issue documented as follow-up

**Plan said**: Add inline disable tests for agents
**What we did**: Discovered that schema validation errors bypass the disable directive system entirely. Documented as a follow-up rather than fixing in this project.
**Reason**: The fix requires either changing the base `FileValidator` class (affects all validators) or refactoring schemas to be loose type checkers. Both are significant changes that deserve their own project. Tests are designed around current behavior (testing rule-only violations for disable tests).

### 7. Design-philosophy coverage map replaced with summary

**Plan said**: Add full coverage map table to `design-philosophy.md` mapping all file locations to scope/covered/notes
**What we did**: Replaced the table with a 2-line summary referencing `file-discovery.md`, keeping only rationale and future considerations
**Reason**: The coverage map table duplicated most of the File Type Reference table already on the file-discovery page. Having both creates a maintenance burden and confuses where canonical file-type information lives. The design-philosophy page now explains *why* project-scoped, while file-discovery explains *what* is discovered.

### 8. Agents validator page context moved to glossary

**Plan said**: Integrate agents-vs-skills and AGENTS.md disambiguation into the agents validator page opening
**What we did**: Moved the context to a new "Agent Files" entry in the glossary's File Types section. Agents validator page reverted to a concise 1-sentence opening matching all other validator pages.
**Reason**: User feedback that the long merged paragraph looked inconsistent with other validator pages (skills, MCP, etc. all have 1-sentence openings). The glossary already had File Types entries for CLAUDE.md, SKILL.md, settings.json, and hooks.json but not agents — making it the natural home for this content.

### 6. Disable directives must go after frontmatter

**Plan said**: Add inline disable tests using `<!-- claudelint-disable-file -->` at top of file
**What we did**: Placed disable comments after the closing `---` of frontmatter
**Reason**: `extractFrontmatter()` uses `^---` regex which requires frontmatter at the very first line. An HTML comment before the frontmatter breaks parsing — frontmatter returns `null` and all rules silently skip. This is a second disable-system limitation (alongside deviation #5) that should be documented for users and potentially fixed in the follow-up.
