# claudelint-plugin-example

Example custom validator plugin for claudelint.

## Overview

This plugin demonstrates how to create a custom validator for claudelint. It provides a simple validator that checks for TODO and FIXME comments in TypeScript/JavaScript files.

## Installation

```bash
npm install claudelint-plugin-example
```

## Usage

The plugin will be automatically discovered and loaded by claudelint if:

1. It's installed in your project's `node_modules`
2. The package name starts with `claudelint-plugin-`

No additional configuration is required.

## What This Plugin Does

- Warns about `// TODO` and `/* TODO` comments
- Reports errors for `// FIXME` and `/* FIXME` comments
- Scans all `.ts`, `.js`, `.tsx`, and `.jsx` files
- Ignores `node_modules`, `dist`, and `build` directories

## Building Your Own Plugin

### 1. Create a Package

Create a new npm package with a name starting with `claudelint-plugin-`:

```json
{
  "name": "claudelint-plugin-myvalidator",
  "version": "1.0.0",
  "main": "dist/index.js",
  "peerDependencies": {
    "@pdugan20/claudelint": ">=0.1.0"
  }
}
```

### 2. Implement the Plugin Interface

Create an `index.ts` file that exports a plugin object:

```typescript
import { ValidatorPlugin } from '@pdugan20/claudelint/dist/utils/plugin-loader';
import { ValidatorRegistry } from '@pdugan20/claudelint/dist/utils/validator-factory';
import { BaseValidator } from '@pdugan20/claudelint/dist/validators/base';

const plugin: ValidatorPlugin = {
  name: 'claudelint-plugin-myvalidator',
  version: '1.0.0',

  register(registry: typeof ValidatorRegistry): void {
    registry.register(
      {
        id: 'my-validator',
        name: 'My Custom Validator',
        description: 'Validates something custom',
        filePatterns: ['**/*.custom'],
        enabled: true,
      },
      (options) => new MyValidator(options)
    );
  },
};

export default plugin;
```

### 3. Create Your Validator

Extend `BaseValidator` and implement the `validate()` method:

```typescript
class MyValidator extends BaseValidator {
  async validate(): Promise<ValidationResult> {
    // Your validation logic here

    // Report errors
    this.reportError('Error message', 'file.ts', 10, 'my-rule-id');

    // Report warnings
    this.reportWarning('Warning message', 'file.ts', 15, 'my-rule-id');

    return this.getResult();
  }
}
```

### 4. Build and Publish

```bash
npm run build
npm publish
```

## Testing Your Plugin

You can test your plugin locally without publishing:

```bash
cd your-plugin-directory
npm link

cd your-project-directory
npm link claudelint-plugin-myvalidator
claudelint check-all
```

## API Reference

See the [Plugin Development Guide](../../docs/plugin-development.md) for full API documentation.

## License

MIT
