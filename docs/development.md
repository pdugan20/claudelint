# Development Guide

Guide for contributing to Claude Validator.

## Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- Claude Code (for testing plugin features)

### Installation

```bash
# Clone repository
git clone https://github.com/pdugan20/claude-validator.git
cd claude-validator

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test
```

### Development Workflow

```bash
# Watch mode for development
npm run dev

# Run linting
npm run lint
npm run lint:fix

# Run formatting
npm run format
npm run format:check

# Clean build artifacts
npm run clean
```

## Project Structure

See [architecture.md](architecture.md) for detailed architecture documentation.

## Adding a New Validator

### 1. Create Validator Class

Create a new file in `src/validators/`:

```typescript
// src/validators/my-validator.ts
import { BaseValidator, ValidationResult } from './base';

export class MyValidator extends BaseValidator {
  async validate(): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validation logic here

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
```

### 2. Export Validator

Add to `src/validators/index.ts`:

```typescript
export { MyValidator } from './my-validator';
```

### 3. Add CLI Command

Add to `src/cli.ts`:

```typescript
program
  .command('validate-my-thing')
  .description('Validate my thing')
  .option('--path <path>', 'Custom path')
  .action(async (options) => {
    const validator = new MyValidator(options);
    const result = await validator.validate();
    handleResult(result);
  });
```

### 4. Create Skill

Create `skills/validate-my-thing/SKILL.md`:

```markdown
---
name: validate-my-thing
description: Validate my thing in Claude Code projects
allowed-tools: [Bash]
---

Validates my thing.

\`\`\`bash
npx claude-validator validate-my-thing --verbose
\`\`\`
```

### 5. Write Tests

Create `tests/validators/my-validator.test.ts`:

```typescript
import { MyValidator } from '../../src/validators/my-validator';

describe('MyValidator', () => {
  it('should validate valid input', async () => {
    const validator = new MyValidator({ path: 'fixtures/valid' });
    const result = await validator.validate();
    expect(result.valid).toBe(true);
  });

  it('should detect errors', async () => {
    const validator = new MyValidator({ path: 'fixtures/invalid' });
    const result = await validator.validate();
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
```

### 6. Update Documentation

- Add validator to `docs/validators.md`
- Update `README.md` if needed
- Update `ROADMAP.md` to mark tasks complete

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- my-validator.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

### Writing Tests

We use Jest for testing. Follow these patterns:

#### Unit Tests

Test validators in isolation:

```typescript
describe('ClaudeMdValidator', () => {
  it('should detect oversized files', async () => {
    const validator = new ClaudeMdValidator({
      path: 'fixtures/large-claude-md/CLAUDE.md',
    });
    const result = await validator.validate();

    expect(result.errors).toContainEqual(
      expect.objectContaining({
        message: expect.stringContaining('exceeds 40KB'),
      })
    );
  });
});
```

#### Integration Tests

Test multiple validators together:

```typescript
describe('check-all command', () => {
  it('should run all validators', async () => {
    const result = await runCli(['check-all', '--path', 'fixtures/valid-project']);
    expect(result.exitCode).toBe(0);
  });
});
```

#### Test Fixtures

Create fixtures in `tests/fixtures/`:

```text
tests/fixtures/
├── valid-project/
│   ├── CLAUDE.md
│   ├── .claude/
│   │   ├── settings.json
│   │   └── skills/
│   └── .mcp.json
└── invalid-project/
    └── CLAUDE.md (oversized)
```

## Code Style

### TypeScript Guidelines

- Use strict mode
- No `any` types (use `unknown` if needed)
- Prefer `async/await` over promises
- Use optional chaining (`?.`)
- Use nullish coalescing (`??`)

### Naming Conventions

- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

### Example

```typescript
// Good
export class ClaudeMdValidator extends BaseValidator {
  private readonly maxFileSize = 40_000;

  async validate(): Promise<ValidationResult> {
    const files = await this.findClaudeMdFiles();
    // ...
  }
}

// Bad
export class claudemd_validator {
  private maxsize = 40000;

  validate(): any {
    // ...
  }
}
```

## Documentation

### Code Comments

Use JSDoc for public APIs:

```typescript
/**
 * Validates CLAUDE.md files for size, format, and structure.
 *
 * @param options - Validation options
 * @returns Validation result with errors and warnings
 *
 * @example
 * ```typescript
 * const validator = new ClaudeMdValidator({ path: './CLAUDE.md' });
 * const result = await validator.validate();
 * ```
 */
export class ClaudeMdValidator extends BaseValidator {
  // ...
}
```

### Markdown Documentation

Follow the markdownlint rules from global CLAUDE.md:

- Start with H1 heading
- Blank lines around lists
- Blank lines around code blocks
- Specify language in code fences
- Blank lines around headings

## Git Workflow

### Commit Messages

Follow conventional commits:

```bash
# Format: type(scope): message

feat(validators): add MCP server validator
fix(cli): handle missing config files
docs(readme): update installation instructions
test(skills): add validation tests
chore(deps): update dependencies
```

### Branches

- `main` - Stable releases
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Pull Requests

1. Create feature branch from `develop`
2. Make changes
3. Add tests
4. Update documentation
5. Run `npm test` and `npm run lint`
6. Create PR to `develop`
7. Wait for review

## Release Process

### Version Numbers

Follow semantic versioning:

- **Major** (1.0.0) - Breaking changes
- **Minor** (0.1.0) - New features
- **Patch** (0.0.1) - Bug fixes

### Release Steps

1. Update version in `package.json`
2. Update version in `.claude-plugin/plugin.json`
3. Update `CHANGELOG.md`
4. Commit: `chore(release): v1.0.0`
5. Tag: `git tag v1.0.0`
6. Push: `git push && git push --tags`
7. Publish: `npm publish`

## Testing as Plugin

### Local Testing

```bash
# Link package globally
npm link

# In another project
npm link @pdugan20/claude-validator

# Test CLI
claude-validator check-all

# Test as plugin
/plugin marketplace add pdugan20/claude-validator
/plugin install claude-validator
/validate
```

### Testing on Real Projects

Test on NextUp and nextup-backend:

```bash
cd /Users/patdugan/Documents/GitHub/next-up-app/NextUp
claude-validator check-all --verbose

cd /Users/patdugan/Documents/GitHub/next-up-app/nextup-backend
claude-validator check-all --verbose
```

## Performance

### Profiling

```bash
# Profile with Node.js profiler
node --prof dist/cli.js check-all
node --prof-process isolate-*.log > profile.txt

# Benchmark
time claude-validator check-all
```

### Optimization Tips

- Use `glob` for file discovery
- Parse files once, cache results
- Run validators in parallel
- Lazy load validators
- Stream large files

## Troubleshooting

### Common Issues

**Build fails:**

```bash
npm run clean
npm install
npm run build
```

**Tests fail:**

```bash
# Check Node version
node --version  # Should be 18+

# Clear jest cache
npm test -- --clearCache
```

**Plugin not found:**

```bash
# Rebuild and link
npm run build
npm link
```

## Resources

- [Claude Code Documentation](https://code.claude.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Commander.js](https://github.com/tj/commander.js)

## Getting Help

- Open an issue on GitHub
- Check existing issues
- Read the documentation
- Ask in Claude Code community
