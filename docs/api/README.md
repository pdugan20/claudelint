# ClaudeLint Programmatic API

Comprehensive API reference for integrating ClaudeLint into your Node.js applications, build tools, and editor extensions.

## Overview

ClaudeLint provides three complementary APIs for programmatic usage:

1. **Class-based API** - Full-featured `ClaudeLint` class for complex workflows with state management
2. **Functional API** - Stateless convenience functions for simple, one-off operations
3. **Configuration API** - Utilities for finding and loading configuration files

All APIs follow established patterns from ESLint and Prettier, ensuring familiarity and ease of integration.

## Installation

```bash
npm install @pdugan20/claudelint
```

## Quick Start

### Class-based API

The `ClaudeLint` class provides the most control and is ideal for complex workflows:

```typescript
import { ClaudeLint } from '@pdugan20/claudelint';

// Create linter instance
const linter = new ClaudeLint({
  fix: true,
  cwd: process.cwd(),
});

// Lint files
const results = await linter.lintFiles(['**/*.md']);

// Format results
const formatter = await linter.loadFormatter('stylish');
const output = formatter.format(results);
console.log(output);

// Output fixes to disk
await ClaudeLint.outputFixes(results);
```

### Functional API

For simpler use cases, use the stateless functional API:

```typescript
import { lint, formatResults } from '@pdugan20/claudelint';

// Lint files
const results = await lint(['**/*.md'], { fix: true });

// Format and display results
const output = await formatResults(results, 'stylish');
console.log(output);
```

### Linting Text Content

Lint text without requiring files on disk:

```typescript
import { lintText } from '@pdugan20/claudelint';

const code = '# CLAUDE.md\n\nMy instructions';
const results = await lintText(code, { filePath: 'CLAUDE.md' });
```

## API Documentation

### Core APIs

- **[ClaudeLint Class](./claudelint-class.md)** - Full class-based API reference
- **[Functional API](./functional-api.md)** - Stateless function reference
- **[Formatters](./formatters.md)** - Built-in and custom formatter guide
- **[Types](./types.md)** - TypeScript type definitions

### Guides

- **[Migration Guide](./migration.md)** - Migrating from CLI to API

## Use Cases

### Build Tool Integration

```typescript
import { lint, formatResults } from '@pdugan20/claudelint';

async function validateClaudeFiles() {
  const results = await lint(['**/*.md']);
  const hasErrors = results.some(r => r.errorCount > 0);

  if (hasErrors) {
    const output = await formatResults(results, 'stylish');
    console.error(output);
    process.exit(1);
  }
}
```

### Editor Extension

```typescript
import { ClaudeLint } from '@pdugan20/claudelint';

const linter = new ClaudeLint();

// Lint on document change
async function lintDocument(document) {
  const results = await linter.lintText(document.getText(), {
    filePath: document.uri.fsPath,
  });

  return results[0].messages.map(msg => ({
    range: new Range(msg.line - 1, 0, msg.line - 1, 0),
    message: msg.message,
    severity: msg.severity === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
  }));
}
```

### CI/CD Pipeline

```typescript
import { ClaudeLint } from '@pdugan20/claudelint';

const linter = new ClaudeLint({
  cwd: process.cwd(),
  onProgress: (file, index, total) => {
    console.log(`[${index + 1}/${total}] ${file}`);
  },
});

const results = await linter.lintFiles(['**/*.md']);

// Generate report
const formatter = await linter.loadFormatter('json');
const jsonOutput = formatter.format(results);
await writeFile('lint-report.json', jsonOutput);

// Exit with error code if violations found
const hasErrors = results.some(r => r.errorCount > 0);
process.exit(hasErrors ? 1 : 0);
```

## Features

- **File Pattern Matching** - Lint multiple files using glob patterns
- **Text Linting** - Validate content without filesystem operations
- **Auto-fix** - Automatically fix violations when possible
- **Custom Formatters** - Use built-in or custom result formatters
- **Configuration** - Load and resolve configuration files
- **Progress Tracking** - Monitor linting progress with callbacks
- **Type Safety** - Full TypeScript type definitions
- **Stateless Operations** - Functional API for one-off tasks

## Performance

The programmatic API is optimized for performance:

- Validator caching reduces initialization overhead
- Configuration is cached per file pattern
- Formatters are loaded and cached on demand
- Progress callbacks allow responsive UIs

## Examples

Complete examples are available in the [examples directory](../../examples/):

- [Basic Usage](../../examples/basic-usage.js) - Simple file linting
- [Auto-fix](../../examples/auto-fix.js) - Automatic violation fixes
- [Custom Formatter](../../examples/custom-formatter.js) - Custom result formatting
- [Build Integration](../../examples/build-integration.js) - CI/CD pipeline usage
- [Editor Extension](../../examples/editor-extension.js) - Editor integration pattern

## Support

- **Documentation**: [Full documentation](../../README.md)
- **Issues**: [GitHub Issues](https://github.com/pdugan20/claude-lint/issues)
- **CLI Reference**: [CLI documentation](../cli-reference.md)

## Next Steps

- Read the [ClaudeLint Class reference](./claudelint-class.md) for detailed API documentation
- Explore the [Functional API](./functional-api.md) for simpler use cases
- Review [TypeScript types](./types.md) for type-safe integration
- Check out [example integrations](../../examples/) for common patterns
