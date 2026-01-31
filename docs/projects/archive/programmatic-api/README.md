# Programmatic API Project (Archived)

**Status:** Completed and Superseded
**Completion Date:** v0.2.0-beta.0
**Active Documentation:** [docs/api/README.md](../../../api/README.md)

## Summary

This project developed a comprehensive programmatic API for claude-code-lint, allowing Node.js applications, build tools, and editor extensions to use claude-code-lint programmatically.

## Key Outcomes

The programmatic API was successfully implemented with the following features:

1. **ClaudeLint Class** - Full-featured class-based API with:
   - File pattern linting
   - Built-in formatters (stylish, JSON, compact)
   - Custom formatter support
   - Configuration management
   - Cache control

2. **Functional API** - Stateless functions for simpler use cases:
   - `lint()` - Validate files
   - `formatResults()` - Format output
   - `loadFormatter()` - Load formatters

3. **TypeScript Support** - Complete type definitions exported for all APIs

4. **Integration Examples** - Real-world usage patterns for:
   - Build tools (Webpack, Vite, Rollup)
   - CI/CD pipelines (GitHub Actions, GitLab CI)
   - Editor extensions (VS Code)
   - Custom automation scripts

## Current Documentation

**The planning documents for this project have been archived.** For current API usage and documentation, please refer to:

- **[API Documentation](../../../api/README.md)** - Complete API reference
- **[ClaudeLint Class](../../../api/claudelint-class.md)** - Class-based API documentation
- **[Functional API](../../../api/functional-api.md)** - Stateless function reference
- **[Formatters](../../../api/formatters.md)** - Built-in and custom formatters
- **[Types](../../../api/types.md)** - TypeScript type definitions
- **[Migration Guide](../../../api/MIGRATION.md)** - Migrating from CLI to API

## Project Timeline

- **Planning:** December 2023
- **Implementation:** January 2024
- **Beta Release:** v0.2.0-beta.0 (January 2024)
- **Stable Release:** v0.2.0 (target: February 2024)

## Lessons Learned

1. **API Design** - Following ESLint's patterns provided familiar developer experience
2. **Type Safety** - Complete TypeScript types improved adoption
3. **Documentation** - Real-world integration examples were critical
4. **Testing** - Separate API tests from CLI tests improved coverage

## Migration Note

If you're looking for information about using claude-code-lint programmatically:

- **Don't read the planning documents** in this archived folder
- **Do read the active documentation** at [docs/api/README.md](../../../api/README.md)

The active documentation is maintained, accurate, and includes all features from the final implementation.

---

**Archive Date:** 2024-01-31
