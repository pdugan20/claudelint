# ESLint vs Claudelint Rule Documentation Comparison

## Structure Comparison

### ESLint Format

```markdown
# rule-name

[Status Badges:  Recommended |  Fixable |  hasSuggestions]

Brief description of rule.

## Rule Details

Detailed explanation with:
- Why the rule exists
- What it checks for
- When it triggers

### Examples (Incorrect)

```js
/*eslint rule-name: "error"*/

// Bad code here
[Open in Playground]
```

### Examples (Correct)

```js
/*eslint rule-name: "error"*/

// Good code here
[Open in Playground]
```

## Options

Default configuration:

```json
{
  "rule-name": ["error", { "option": "value" }]
}
```

### `option1`

Description of option...

Examples for this option...

### `option2`

Description of option...

Examples for this option...

## When Not To Use It

Guidance on disabling...

## Related Rules

- [other-rule](link)

## Version

Introduced in ESLint vX.Y.Z

## Resources

- [Rule source](github link)
- [Tests](github link)
```

### Claudelint Format (Current)

```markdown
# Rule: rule-id

Brief description of what this rule does.

## Rule Details

Detailed explanation of when this rule triggers and why it exists.

Examples of **incorrect** code for this rule:

```text
# Example of code that violates this rule
```

Examples of **correct** code for this rule:

```text
# Example of code that follows this rule
```

## Options

This rule has the following options:

- `option1`: Description of option 1
- `option2`: Description of option 2

Example configuration:

```json
{
  "rules": {
    "rule-id": ["error", {
      "option1": true
    }]
  }
}
```

## When Not To Use It

Guidance on scenarios where you might want to disable this rule.

## Related Rules

- [related-rule-1](./related-rule-1.md)
- [related-rule-2](./related-rule-2.md)

## Resources

- [Additional resource links if applicable]

## Version

Available since: 1.0.0

## Metadata

- **Category**: Category Name
- **Severity**: error | warning
- **Fixable**: Yes | No
- **Validator**: Skills
```

## Field-by-Field Comparison

| Field/Section | ESLint | Claudelint | Notes |
|---------------|--------|------------|-------|
| **Title Format** | `# rule-name` | `# Rule: rule-id` | Ours is more explicit |
| **Status Badges** |    (visual) | None | ESLint more visual |
| **Brief Description** | Below title | Below title | ✓ Same |
| **Rule Details** | ✓ Has section | ✓ Has section | ✓ Same |
| **Incorrect Examples** | Subsection with playground links | Inline with markdown bold | ESLint more interactive |
| **Correct Examples** | Subsection with playground links | Inline with markdown bold | ESLint more interactive |
| **Options Section** | ✓ Detailed per-option | ✓ List format | ESLint more detailed |
| **Configuration Example** | ✓ Shows JSON | ✓ Shows JSON | ✓ Same |
| **When Not To Use It** | ✓ Has section | ✓ Has section | ✓ Same |
| **Related Rules** | ✓ Has section | ✓ Has section | ✓ Same |
| **Resources** | Links to source/tests | Generic links | ESLint more specific |
| **Version** | "Introduced in vX.Y.Z" | "Available since: X.Y.Z" | ✓ Similar |
| **Category** | Via badges/tags | In Metadata table | Different approach |
| **Severity** | Via rule config | In Metadata table | Different approach |
| **Fixable** | Via  badge | In Metadata table | ESLint more visual |
| **Validator** | N/A | In Metadata table | Unique to us |
| **hasSuggestions** | Via  badge | N/A | ESLint-specific |
| **Recommended** | Via  badge | N/A | ESLint-specific |

## Key Differences

### 1. Metadata Presentation

**ESLint**: Uses visual badges at the top
-  Recommended
-  Fixable
-  hasSuggestions

**Claudelint**: Uses tabular metadata at bottom
- Category
- Severity
- Fixable
- Validator

**Analysis**: ESLint's approach is more visual and user-friendly. Badges are immediately visible. Our tabular approach is more structured but less visually appealing.

### 2. Example Format

**ESLint**:
- Subsections for incorrect/correct
- Inline ESLint configuration comments
- Playground links for interactive testing
- Language-specific syntax highlighting

**Claudelint**:
- Inline examples with bold markers
- Generic text blocks (not always language-specific)
- No interactive features
- Uses "Violation Example" and "Correct Example" headings

**Analysis**: ESLint's approach is more interactive and user-friendly. Playground links are a major UX win.

### 3. Options Documentation

**ESLint**:
- Each option gets its own subsection
- Examples for each option variant
- Very detailed explanation per option

**Claudelint**:
- Options listed as bullet points
- Single configuration example
- Less granular

**Analysis**: ESLint's per-option examples are more helpful for complex rules.

### 4. Resources

**ESLint**:
- Direct links to source code
- Direct links to test files
- Helps contributors understand implementation

**Claudelint**:
- Generic resource links
- No implementation links

**Analysis**: ESLint's approach is better for open-source collaboration.

## What We're Missing

1. **Visual badges/indicators** - Quick visual reference for rule properties
2. **Interactive examples** - Playground links (not applicable for us)
3. **Per-option examples** - Detailed examples for each configuration variant
4. **Source code links** - Links to rule implementation
5. **Test links** - Links to rule tests
6. **"Recommended" indicator** - Whether rule is in recommended config
7. **"hasSuggestions" indicator** - Whether rule provides auto-fix suggestions

## What We Have That ESLint Doesn't

1. **Validator field** - Which validator enforces this rule (Skills, Hooks, etc.)
2. **Category field** - Explicit categorization (Security, Best Practices, etc.)
3. **Explicit severity in metadata** - Clear error vs warning distinction
4. **How To Fix section** - Many of our docs have this (not in template)
5. **Multiple organization strategies** - Some rules show different approaches

## Recommendations

### High Priority: Visual Improvements

1. **Add badges/indicators at the top**:
   ```markdown
   # Rule: skill-missing-shebang

    Error |  Not Fixable |  Skills Validator
   ```

2. **Move metadata to top as badges** (instead of bottom table):
   - Severity →  Error /  Warning
   - Fixable →  Fixable /  Not Fixable
   - Validator →  Icon + Validator name
   - Category →  Category name

3. **Link to source code and tests**:
   ```markdown
   ## Resources

   - [Rule Implementation](../../src/validators/skills.ts#L123)
   - [Rule Tests](../../tests/validators/skills.test.ts#L456)
   - [Claude Code Documentation](https://github.com/anthropics/claude-code)
   ```

### Medium Priority: Structure Improvements

4. **Per-option examples** for complex rules:
   ```markdown
   ## Options

   ### `ignorePattern`

   String pattern to ignore certain files.

   Examples with `ignorePattern: "test-*"`:

   ```bash
   # Passes - matches pattern
   test-helper.sh
   ```

   ### `maxDepth`

   Maximum nesting depth allowed.

   ...
   ```

5. **Consistent example headings**:
   ```markdown
   ### Incorrect Examples

   Code that violates this rule:

   ### Correct Examples

   Code that follows this rule:
   ```

### Low Priority: Nice-to-Haves

6. **Recommended badge** for rules in default config
7. **"Further Reading" section** with external resources
8. **"Implementation Notes"** for complex rules

## Proposed Updated Template

```markdown
# Rule: rule-id

 Error |  Not Fixable |  Validator Name |  Category Name

Brief description of what this rule does.

## Rule Details

Detailed explanation of when this rule triggers and why it exists.

### Incorrect Examples

Code that violates this rule:

```language
# Bad code here
```

### Correct Examples

Code that follows this rule:

```language
# Good code here
```

## How To Fix

Step-by-step guide to fix violations (if applicable).

## Options

This rule has the following options:

### `option1`

Description of option 1.

Examples with this option:

```json
{
  "rules": {
    "rule-id": ["error", { "option1": true }]
  }
}
```

## When Not To Use It

Guidance on scenarios where you might want to disable this rule.

## Related Rules

- [related-rule-1](./related-rule-1.md) - Brief description
- [related-rule-2](./related-rule-2.md) - Brief description

## Resources

- [Rule Implementation](../../src/validators/validator.ts#L123)
- [Rule Tests](../../tests/validators/validator.test.ts#L456)
- [Claude Code Documentation](https://github.com/anthropics/claude-code)

## Version

Available since: v1.0.0
```

## Implementation Plan

### Phase 1: Update Template (Now)
- [ ] Update TEMPLATE.md with badges
- [ ] Move metadata to top as visual indicators
- [ ] Add source code links section

### Phase 2: Update Existing Docs (Gradual)
- [ ] Add badges to all existing rule docs
- [ ] Add source/test links where applicable
- [ ] Standardize example headings

### Phase 3: Enhance New Docs (Future)
- [ ] Per-option examples for complex rules
- [ ] "How To Fix" section for all fixable rules
- [ ] Implementation notes for complex rules

## Benefits of Alignment

1. **Familiarity** - Developers familiar with ESLint will recognize our format
2. **Best Practices** - ESLint has refined their docs over years of use
3. **Visual Clarity** - Badges make metadata immediately scannable
4. **Contributor-Friendly** - Source links help contributors understand rules
5. **Professional** - Industry-standard format signals quality

## Differences to Preserve

1. **Validator field** - Unique to our multi-validator architecture
2. **How To Fix** - More detailed than ESLint's approach
3. **Category in metadata** - Explicit categorization is valuable
4. **Multiple examples** - Our docs often show more examples

## Summary

ESLint's documentation is more visually polished and user-friendly, particularly with:
- Badges for quick metadata scanning
- Per-option detailed examples
- Source code links for contributors
- Interactive playground links (not applicable for us)

We should adopt their badge system and improve our visual presentation while preserving our unique features (Validator field, detailed "How To Fix" sections).
