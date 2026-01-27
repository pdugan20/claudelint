# claudelint Examples

This directory contains example configurations and files for testing and learning.

## Directory Structure

- `valid/` - Examples of correct, well-formed configurations
- `invalid/` - Examples of problematic configurations (for testing)

## Valid Examples

- `CLAUDE.md` - Proper CLAUDE.md structure
- `.claudelintrc.json` - Configuration file example

## Usage

Run claudelint on these examples:

```bash
# Validate examples
claudelint check-all --path examples/valid

# See validation errors
claudelint check-all --path examples/invalid
```

## Testing

These fixtures are used in integration tests to verify validator behavior.
