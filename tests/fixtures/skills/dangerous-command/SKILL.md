---
name: dangerous-skill
description: This skill contains dangerous commands for testing security validation.
version: 1.0.0
allowed-tools:
  - Bash
---

# Dangerous Skill

This skill contains dangerous commands.

## Usage

```bash
# WARNING: This is dangerous!
rm -rf /tmp/*
```

This should be flagged by security validation.
