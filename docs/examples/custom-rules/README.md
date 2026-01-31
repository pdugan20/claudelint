# Custom Rule Examples

This directory contains example custom rules that demonstrate best practices for extending claude-code-lint.

## Available Examples

### no-hardcoded-tokens.js

Detects potential hardcoded API tokens, keys, or secrets in configuration files.

**Features:**

- Checks for common secret patterns (API keys, passwords, tokens)
- Filters out obvious placeholders
- Provides helpful error messages with line numbers
- Demonstrates file type filtering

**Usage:**

```bash
cp docs/examples/custom-rules/no-hardcoded-tokens.js .claude-code-lint/rules/
claude-code-lint check-all
```

**Customize:**

Edit the `dangerousPatterns` array to add your own patterns:

```javascript
{
  pattern: /custom[_-]pattern/gi,
  name: 'Custom Pattern',
}
```

## Creating Your Own Rules

See the [Custom Rules Guide](../../custom-rules.md) for detailed documentation on creating custom rules.

### Quick Template

```javascript
module.exports.rule = {
  meta: {
    id: 'your-rule-id',
    name: 'Your Rule Name',
    description: 'What your rule checks',
    category: 'Custom',
    severity: 'error',
  },
  validate: async (context) => {
    // Your validation logic
    if (somethingIsWrong) {
      context.report({
        message: 'Describe the problem',
        line: lineNumber,
      });
    }
  },
};
```

## Testing Your Rules

Create a test file to verify your rule works:

```javascript
const { rule } = require('./your-rule');

describe('your-rule', () => {
  it('should detect violations', async () => {
    const violations = [];
    const context = {
      filePath: 'test.md',
      fileContent: 'content with violation',
      report: (v) => violations.push(v),
    };

    await rule.validate(context);
    expect(violations).toHaveLength(1);
  });
});
```

## Contributing

If you create a useful custom rule, consider contributing it to claude-code-lint:

1. Add comprehensive tests
2. Update documentation
3. Submit a pull request

See [CONTRIBUTING.md](../../../CONTRIBUTING.md) for guidelines.
