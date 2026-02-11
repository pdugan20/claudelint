# API Reference

claudelint provides a programmatic API for integrating validation into your tools and scripts.

## Quick Start

```typescript
import { ClaudeLint } from 'claude-code-lint';

const linter = new ClaudeLint();
const results = await linter.validate('/path/to/project');

for (const result of results) {
  console.log(result.ruleId, result.message);
}
```

## API Sections

- [ClaudeLint Class](/api/claudelint-class) - Main class-based API
- [Functional API](/api/functional-api) - Simplified functional interface
- [Types](/api/types) - TypeScript type definitions
- [Formatters](/api/formatters) - Output formatting options
