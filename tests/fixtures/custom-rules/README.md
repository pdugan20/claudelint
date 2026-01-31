# Custom Rules Test Fixtures

This directory contains test fixtures for custom rule loading tests.

## Valid Rules

- **valid-custom-rule.ts** - Example of a properly formatted custom rule
- **team-conventions.ts** - Example of a team-specific rule

## Invalid Rules

- **invalid-no-meta.ts** - Missing meta object (should fail validation)
- **invalid-no-validate.ts** - Missing validate function (should fail validation)

## Usage

These fixtures are used by `tests/utils/custom-rule-loader.test.ts` to verify:

- Valid rules load successfully
- Invalid rules are rejected with appropriate error messages
- Rule interface validation works correctly
