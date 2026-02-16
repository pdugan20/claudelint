---
name: missing-skills-agent
description: Agent that references nonexistent skills for testing
skills:
  - nonexistent-skill
---
<!-- markdownlint-disable MD041 -->

This agent references a skill that does not exist. The agent-skills-not-found rule
should detect and report this as an error during validation.
