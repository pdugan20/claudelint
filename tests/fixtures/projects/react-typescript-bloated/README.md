# React TypeScript Bloated Fixture

## Purpose

Test the optimize-cc-md skill with a realistic React + TypeScript project containing a bloated CLAUDE.md file.

## Project Structure

- **React 18** with functional components
- **TypeScript 5.3+** with strict mode
- Minimal but functional components (App.tsx, index.tsx)
- Real dependencies in package.json
- Valid TypeScript configuration

## Issues Present in CLAUDE.md

### 1. Generic React Advice (Lines ~20-100)

- Generic component patterns Claude already knows
- Standard hooks guidelines
- Common React best practices
- Not specific to this project

**Should be:** Extracted to `.claude/rules/react-patterns.md`

### 2. TypeScript Style Guide (Lines ~100-200)

- Generic TypeScript conventions
- Standard naming patterns
- Code style rules
- Not project-specific

**Should be:** Extracted to `.claude/rules/typescript-style.md`

### 3. Testing Guidelines (Lines ~220-280)

- Generic testing advice
- Standard React Testing Library patterns
- Not specific to this project's test setup

**Should be:** Extracted to `.claude/rules/testing.md`

### 4. Git Workflow (Lines ~280-330)

- Generic git branch naming
- Standard commit message format
- Common git practices

**Should be:** Extracted to `.claude/rules/testing.md` (included with testing)

### 5. Verbose Explanations

- Long paragraphs explaining common concepts
- Repeated information across sections
- Generic advice that Claude already knows

**Should be:** Removed entirely or condensed significantly

## Expected Optimization Results

### Before Optimization

- **File Size:** 13,380 bytes
- **Line Count:** ~400 lines
- **Structure:** All content inline
- **Issues:** Lots of generic advice, verbose explanations, duplication

### After Optimization

- **File Size:** ~2,856 bytes (79% reduction)
- **Line Count:** ~110 lines
- **Structure:** 3 @import files created
- **Result:** Focused on project-specific content only

### Files Created

1. **`.expected/CLAUDE.md`**
   - Only project-specific content
   - References to 3 @import files
   - Build commands and configuration
   - Component guidelines specific to this project
   - Troubleshooting for actual project issues

2. **`.expected/.claude/rules/react-patterns.md`**
   - Generic React best practices
   - Component structure guidelines
   - Hooks guidelines
   - Performance patterns
   - Accessibility basics

3. **`.expected/.claude/rules/typescript-style.md`**
   - TypeScript style conventions
   - Type annotation rules
   - Naming conventions
   - Code style preferences
   - Import organization

4. **`.expected/.claude/rules/testing.md`**
   - Testing best practices
   - What to test and what not to test
   - Git workflow and commit conventions
   - Branch naming

## Testing This Fixture

### Setup

1. Copy fixture to test workspace:

```bash
cp -r tests/fixtures/projects/react-typescript-bloated /tmp/test-workspace
cd /tmp/test-workspace
```

1. Install claudelint:

```bash
npm install /path/to/claude-code-lint-*.tgz
```

1. Create plugin.json:

```json
{
  "name": "claudelint",
  "plugins": ["claude-code-lint"]
}
```

### Manual Testing

1. Open Claude in test workspace
2. Trigger optimize-cc-md skill:
   - "optimize my CLAUDE.md"
   - "help me improve my CLAUDE.md file"
   - "this config file is too long"

### Expected Behavior

The skill should:

1. Analyze the CLAUDE.md file
2. Identify generic React, TypeScript, and testing advice
3. Suggest creating @import files
4. Create `.claude/rules/` directory structure
5. Extract generic content to separate files
6. Update CLAUDE.md with @import directives
7. Reduce file size by ~75-80%

### Verification

Check that:

- [ ] CLAUDE.md is ~3KB (down from ~13KB)
- [ ] `.claude/rules/` directory created
- [ ] 3 @import files created (react-patterns.md, typescript-style.md, testing.md)
- [ ] CLAUDE.md contains @import directives
- [ ] Generic advice removed from CLAUDE.md
- [ ] Project-specific content preserved
- [ ] File still valid and readable

### Compare Against Expected

```bash
diff CLAUDE.md .expected/CLAUDE.md
diff -r .claude .expected/.claude
```

Size differences within 500 bytes are acceptable (optimization strategies may vary).

## TypeScript Compilation

This fixture is a valid TypeScript project. Verify it compiles:

```bash
npm install
npx tsc --noEmit
```

Should complete with no errors.

## Notes

- This is a minimal but realistic React + TypeScript project
- Component code is intentionally simple (testing CLAUDE.md optimization, not React code)
- No actual build tools configured (Vite mentioned but not included)
- Dependencies are real and should install without errors
- Focus is on testing the optimize-cc-md skill, not the React app functionality

## Related Files

- Bloated source: `CLAUDE.md` (13,380 bytes)
- Optimized target: `.expected/CLAUDE.md` (2,856 bytes)
- Extract 1: `.expected/.claude/rules/react-patterns.md`
- Extract 2: `.expected/.claude/rules/typescript-style.md`
- Extract 3: `.expected/.claude/rules/testing.md`
