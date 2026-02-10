---
name: example-skill
description: Runs the complete test suite for the project
version: 1.0.0
model: sonnet
allowed-tools:
  - Bash
  - Read
argument-hint: Pass a test pattern to filter tests
disable-model-invocation: true
---

# Example Skill

This skill runs the project test suite.

## Usage

```bash
/example-skill $ARGUMENTS
```

## Example

```bash
npm test
```
