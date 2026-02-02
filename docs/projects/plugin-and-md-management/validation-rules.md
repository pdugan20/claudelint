# CLAUDE.md Validation Rules

## **Warning** STATUS: MOSTLY ALREADY IMPLEMENTED

**14 CLAUDE.md validation rules already exist in `src/rules/claude-md/`:**
- claude-md-import-missing
- claude-md-import-circular
- claude-md-import-depth-exceeded
- claude-md-size-warning
- claude-md-size-error
- claude-md-content-too-many-sections
- Plus 8 more...

**This document contains original specs for 5 rules.** Most are already covered by existing implementation. Review existing rules before adding new ones.

## Overview

Five validation rules to ensure CLAUDE.md files follow best practices. **Most already implemented - see above.**

## Rule 1: claude-md-file-length

**ID**: `claude-md-file-length`
**Category**: CLAUDE.md
**Severity**: Warning (configurable)

### Purpose

Warn when CLAUDE.md is too long. Bloated files cause Claude to ignore important rules.

### Rule Logic

```typescript
export const rule: Rule = {
  meta: {
    id: 'claude-md-file-length',
    category: 'claude-md',
    severity: 'warn',
    fixable: false,
    description: 'CLAUDE.md should be concise (under 200 lines recommended)',
  },

  validate: (context: RuleContext) => {
    const filePath = path.join(context.workingDir, 'CLAUDE.md');

    if (!fs.existsSync(filePath)) {
      return; // No CLAUDE.md, nothing to validate
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').length;

    if (lines > 500) {
      context.report({
        severity: 'error',
        message: `CLAUDE.md is ${lines} lines (hard limit 500). Claude will likely ignore most of it.`,
        suggestion: 'Move detailed content to separate files and import with @path/to/file syntax.',
        line: 1,
      });
    } else if (lines > 200) {
      context.report({
        severity: 'warn',
        message: `CLAUDE.md is ${lines} lines (target <200). Consider splitting into imported files.`,
        suggestion: 'Move sections like testing, architecture to @docs/*.md files.',
        line: 1,
      });
    }
  },
};
```

### Configuration

```json
{
  "rules": {
    "claude-md-file-length": {
      "severity": "warn",
      "options": {
        "warningThreshold": 200,
        "errorThreshold": 500
      }
    }
  }
}
```

### Examples

****Bad** Fails**:
```markdown
# CLAUDE.md with 520 lines
# (tons of content)
```

****Warning** Warns**:
```markdown
# CLAUDE.md with 247 lines
# (still a lot)
```

****Good** Passes**:
```markdown
# CLAUDE.md with 145 lines
# (concise and focused)
```

---

## Rule 2: claude-md-import-syntax

**ID**: `claude-md-import-syntax`
**Category**: CLAUDE.md
**Severity**: Error

### Purpose

Validate `@import` syntax and ensure imported files exist.

### Rule Logic

```typescript
export const rule: Rule = {
  meta: {
    id: 'claude-md-import-syntax',
    category: 'claude-md',
    severity: 'error',
    fixable: false,
    description: 'Validate @import syntax and file existence',
  },

  validate: (context: RuleContext) => {
    const filePath = path.join(context.workingDir, 'CLAUDE.md');

    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Regex to match @path/to/file or @~/path/to/file
    const importRegex = /@([~\/][\w\/\-\.]+)/g;

    lines.forEach((line, index) => {
      let match;
      while ((match = importRegex.exec(line)) !== null) {
        const importPath = match[1];

        // Resolve path
        let resolvedPath: string;
        if (importPath.startsWith('~/')) {
          resolvedPath = path.join(os.homedir(), '.claude', importPath.slice(2));
        } else if (importPath.startsWith('/')) {
          resolvedPath = importPath;
        } else {
          resolvedPath = path.join(context.workingDir, importPath);
        }

        // Check if file exists
        if (!fs.existsSync(resolvedPath)) {
          context.report({
            severity: 'error',
            message: `Import @${importPath} not found`,
            suggestion: `Create ${resolvedPath} or remove import`,
            line: index + 1,
            column: line.indexOf(match[0]) + 1,
          });
        }

        // Check for circular imports (advanced)
        if (detectCircularImport(filePath, resolvedPath)) {
          context.report({
            severity: 'warn',
            message: `Circular import detected: @${importPath}`,
            suggestion: 'Restructure imports to avoid cycles',
            line: index + 1,
          });
        }
      }
    });
  },
};
```

### Examples

****Bad** Fails**:
```markdown
See @docs/testing.md for testing guidelines
```
*If docs/testing.md doesn't exist*

****Good** Passes**:
```markdown
See @docs/testing.md for testing guidelines
```
*When docs/testing.md exists*

****Good** Also valid**:
```markdown
Personal preferences: @~/.claude/my-preferences.md
```

---

## Rule 3: claude-md-obvious-content

**ID**: `claude-md-obvious-content`
**Category**: CLAUDE.md
**Severity**: Info

### Purpose

Detect content Claude already knows (obvious advice, standard conventions).

### Rule Logic

```typescript
export const rule: Rule = {
  meta: {
    id: 'claude-md-obvious-content',
    category: 'claude-md',
    severity: 'info',
    fixable: true,
    description: 'Detect obvious content Claude already knows',
  },

  validate: (context: RuleContext) => {
    const filePath = path.join(context.workingDir, 'CLAUDE.md');

    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Patterns for obvious content
    const obviousPatterns = [
      /write clean.*code/i,
      /meaningful variable names/i,
      /use.*comments/i,
      /follow.*best practices/i,
      /keep.*organized/i,
      /write.*tests/i,
      /\bDRY\b.*principle/i,
      /avoid.*duplication/i,
      /readable.*maintainable/i,
    ];

    lines.forEach((line, index) => {
      // Skip headers, empty lines
      if (!line.trim() || line.startsWith('#')) return;

      obviousPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          context.report({
            severity: 'info',
            message: 'Obvious content - Claude already knows this',
            suggestion: 'Remove this line to save tokens',
            line: index + 1,
            fixable: true,
            fix: () => {
              // Remove the line
              return {
                filePath,
                changes: [{
                  type: 'delete',
                  line: index + 1,
                }],
              };
            },
          });
        }
      });
    });
  },
};
```

### Examples

****Warning** Triggers Info**:
```markdown
- Write clean, maintainable code
- Use meaningful variable names
- Add comments where appropriate
- Follow best practices
```

****Good** Good**:
```markdown
- Use ES modules (import/export), not CommonJS (require)
- Prefer arrow functions for callbacks
- Run `npm test -- --single` to test one file
```

---

## Rule 4: claude-md-hook-commands

**ID**: `claude-md-hook-commands`
**Category**: CLAUDE.md
**Severity**: Warning

### Purpose

Validate shell commands referenced in CLAUDE.md are executable and safe.

### Rule Logic

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const rule: Rule = {
  meta: {
    id: 'claude-md-hook-commands',
    category: 'claude-md',
    severity: 'warn',
    fixable: false,
    description: 'Validate shell commands are executable and safe',
  },

  validate: async (context: RuleContext) => {
    const filePath = path.join(context.workingDir, 'CLAUDE.md');

    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Regex to match shell commands in code blocks or inline code
    const commandRegex = /`([^`]+)`/g;

    // Dangerous command patterns
    const dangerousPatterns = [
      /rm\s+-rf\s+\//,
      /mkfs/,
      /dd\s+if=/,
      /:\(\)\s*{\s*:\|:&\s*}/,  // fork bomb
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let match;

      while ((match = commandRegex.exec(line)) !== null) {
        const command = match[1].trim();

        // Skip if not a shell command (just code reference)
        if (!looksLikeShellCommand(command)) continue;

        // Check for dangerous patterns
        const isDangerous = dangerousPatterns.some(p => p.test(command));
        if (isDangerous) {
          context.report({
            severity: 'error',
            message: `Dangerous command detected: ${command}`,
            suggestion: 'Remove or sanitize this command',
            line: i + 1,
          });
          continue;
        }

        // Check if command executable
        const baseCommand = command.split(' ')[0];
        try {
          await execAsync(`which ${baseCommand}`);
        } catch {
          context.report({
            severity: 'warn',
            message: `Command not found: ${baseCommand}`,
            suggestion: `Ensure ${baseCommand} is installed or update command`,
            line: i + 1,
          });
        }
      }
    }
  },
};

function looksLikeShellCommand(str: string): boolean {
  // Heuristics for detecting shell commands
  return /^(npm|yarn|pnpm|cargo|go|python|pytest|node|bash|sh|git|docker)/.test(str) ||
         str.includes('&&') ||
         str.includes('|') ||
         str.startsWith('./');
}
```

### Examples

****Bad** Fails (Dangerous)**:
```markdown
- Clean build: `rm -rf /`
```

****Warning** Warns (Command not found)**:
```markdown
- Deploy: `./deploy.sh`
```
*If deploy.sh doesn't exist or isn't executable*

****Good** Passes**:
```markdown
- Run tests: `npm test`
- Build: `npm run build`
```

---

## Rule 5: claude-md-config-location

**ID**: `claude-md-config-location`
**Category**: CLAUDE.md
**Severity**: Info

### Purpose

Detect code style rules that belong in linter/formatter configs, not CLAUDE.md.

### Rule Logic

```typescript
export const rule: Rule = {
  meta: {
    id: 'claude-md-config-location',
    category: 'claude-md',
    severity: 'info',
    fixable: false,
    description: 'Code style rules should be in config files, not CLAUDE.md',
  },

  validate: (context: RuleContext) => {
    const claudeMdPath = path.join(context.workingDir, 'CLAUDE.md');

    if (!fs.existsSync(claudeMdPath)) return;

    const claudeMd = fs.readFileSync(claudeMdPath, 'utf-8');
    const lines = claudeMd.split('\n');

    // Check for config files
    const configs = {
      eslint: ['.eslintrc.js', '.eslintrc.json', '.eslintrc.yml'],
      prettier: ['.prettierrc', '.prettierrc.json', 'prettier.config.js'],
      editorconfig: ['.editorconfig'],
    };

    // Patterns that belong in configs
    const configPatterns = [
      { pattern: /\b(2|4)\s+spaces?\s+for\s+indentation/i, config: 'prettier/editorconfig' },
      { pattern: /single quotes|double quotes/i, config: 'prettier' },
      { pattern: /semicolons?/i, config: 'prettier/eslint' },
      { pattern: /trailing comma/i, config: 'prettier' },
      { pattern: /line length|max.*characters/i, config: 'prettier' },
      { pattern: /tab.*width/i, config: 'editorconfig' },
    ];

    lines.forEach((line, index) => {
      configPatterns.forEach(({ pattern, config }) => {
        if (pattern.test(line)) {
          // Check if corresponding config file exists
          const configExists = Object.entries(configs).some(([name, files]) => {
            return config.includes(name) && files.some(f =>
              fs.existsSync(path.join(context.workingDir, f))
            );
          });

          if (configExists) {
            context.report({
              severity: 'info',
              message: `Style rule belongs in ${config} config, not CLAUDE.md`,
              suggestion: `Move this to your ${config} config file`,
              line: index + 1,
            });
          }
        }
      });
    });
  },
};
```

### Examples

****Warning** Triggers Info** (if .prettierrc exists):
```markdown
# CLAUDE.md
- Use 2 spaces for indentation
- Use single quotes for strings
- Always use semicolons
```

****Good** Better**:
```markdown
# CLAUDE.md
(No style rules - they're in .prettierrc)
```

```json
// .prettierrc
{
  "tabWidth": 2,
  "singleQuote": true,
  "semi": true
}
```

---

## Integration

### Add to Main Validator

```typescript
// src/validators/claude-md-validator.ts
import { claudeMdFileLength } from '../rules/claude-md/file-length';
import { claudeMdImportSyntax } from '../rules/claude-md/import-syntax';
import { claudeMdObviousContent } from '../rules/claude-md/obvious-content';
import { claudeMdHookCommands } from '../rules/claude-md/hook-commands';
import { claudeMdConfigLocation } from '../rules/claude-md/config-location';

export const claudeMdRules = [
  claudeMdFileLength,
  claudeMdImportSyntax,
  claudeMdObviousContent,
  claudeMdHookCommands,
  claudeMdConfigLocation,
];

export class ClaudeMdValidator {
  async validate(workingDir: string): Promise<ValidationResult> {
    const context = new RuleContext(workingDir);
    const results: ViolationReport[] = [];

    for (const rule of claudeMdRules) {
      await rule.validate(context);
      results.push(...context.getReports());
    }

    return {
      violations: results,
      summary: this.createSummary(results),
    };
  }
}
```

### CLI Integration

```typescript
// bin/claudelint
program
  .command('validate-claude-md')
  .description('Validate CLAUDE.md files')
  .option('--fix', 'Auto-fix issues where possible')
  .action(async (options) => {
    const validator = new ClaudeMdValidator();
    const result = await validator.validate(process.cwd());

    if (options.fix) {
      await applyFixes(result.violations.filter(v => v.fixable));
    }

    printResults(result);
  });
```

### Skill Integration

```typescript
// .claude/skills/validate/SKILL.md
When running full validation, include CLAUDE.md checks:

```bash
claudelint validate-claude-md
```

This validates:
- File length
- Import syntax
- Obvious content
- Hook commands
- Config location
```

---

## Testing

### Test Files

```
tests/rules/claude-md/
├── file-length.test.ts
├── import-syntax.test.ts
├── obvious-content.test.ts
├── hook-commands.test.ts
└── config-location.test.ts
```

### Test Fixtures

```
tests/fixtures/claude-md/
├── valid/
│   ├── concise-150-lines.md
│   ├── with-valid-imports.md
│   └── good-practices.md
├── invalid/
│   ├── bloated-600-lines.md
│   ├── missing-imports.md
│   ├── obvious-content.md
│   ├── dangerous-commands.md
│   └── duplicated-configs.md
└── configs/
    ├── .eslintrc.json
    └── .prettierrc
```

### Example Test

```typescript
describe('claude-md-file-length', () => {
  it('should warn for files over 200 lines', async () => {
    const context = createTestContext('tests/fixtures/claude-md/invalid/bloated-600-lines.md');
    await claudeMdFileLength.validate(context);

    const reports = context.getReports();
    expect(reports).toHaveLength(1);
    expect(reports[0].severity).toBe('error');
    expect(reports[0].message).toContain('600 lines');
  });

  it('should pass for concise files', async () => {
    const context = createTestContext('tests/fixtures/claude-md/valid/concise-150-lines.md');
    await claudeMdFileLength.validate(context);

    expect(context.getReports()).toHaveLength(0);
  });
});
```

---

## Documentation

Each rule needs documentation in `docs/rules/claude-md/`:

- `file-length.md`
- `import-syntax.md`
- `obvious-content.md`
- `hook-commands.md`
- `config-location.md`

Follow the existing rule documentation pattern.
