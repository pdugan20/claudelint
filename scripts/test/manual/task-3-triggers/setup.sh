#!/usr/bin/env bash
#
# Setup for Task 3: Trigger Phrases for All 9 Skills
#
# Prepares test matrix for trigger phrase testing.
#

set -e

TEST_DIR="/tmp/claudelint-test-3"

echo "Setting up Task 3: Trigger Phrases Testing"
echo

# Create test directory
mkdir -p "$TEST_DIR"

# Create trigger test matrix
cat > "$TEST_DIR/trigger-test-matrix.md" << 'EOF'
# Trigger Phrase Test Matrix

## Instructions

For each skill, test in a fresh Claude Code session.
Mark: ✓ (triggered), ✗ (did not trigger), WRONG (wrong skill triggered)

## validate-all

Triggers (SHOULD activate):
- [ ] "check everything"
- [ ] "run all validators"
- [ ] "validate my entire project"
- [ ] "full audit of my claude code project"

Non-triggers (should NOT activate):
- [ ] "what is validation?"
- [ ] "check my JavaScript code"

## validate-cc-md

Triggers:
- [ ] "check my CLAUDE.md"
- [ ] "audit my config"
- [ ] "why is my CLAUDE.md too long"
- [ ] "validate imports"

Non-triggers:
- [ ] "what should go in CLAUDE.md?"
- [ ] "validate my code"

## validate-skills

Triggers:
- [ ] "check my skills"
- [ ] "validate skill syntax"
- [ ] "why isn't my skill loading"
- [ ] "skill errors"

Non-triggers:
- [ ] "what is a skill?"
- [ ] "improve my skills"

## validate-hooks

Triggers:
- [ ] "check my hooks"
- [ ] "validate hooks.json"
- [ ] "hook errors"
- [ ] "why isn't my hook firing"

Non-triggers:
- [ ] "what are hooks?"
- [ ] "add a new hook"

## validate-mcp

Triggers:
- [ ] "check my MCP config"
- [ ] "why isn't my MCP working"
- [ ] ".mcp.json errors"
- [ ] "validate MCP servers"

Non-triggers:
- [ ] "what is MCP?"
- [ ] "create MCP server"

## validate-plugin

Triggers:
- [ ] "check my plugin config"
- [ ] "validate plugin.json"
- [ ] "plugin errors"
- [ ] "why isn't my plugin loading"

Non-triggers:
- [ ] "what is a plugin?"
- [ ] "install a plugin"

## validate-settings

Triggers:
- [ ] "check my settings"
- [ ] "validate settings.json"
- [ ] "permission errors"
- [ ] "environment variable issues"

Non-triggers:
- [ ] "change my settings"
- [ ] "what settings are available?"

## format-cc

Triggers:
- [ ] "format my files"
- [ ] "fix markdown formatting"
- [ ] "clean up CLAUDE.md"
- [ ] "prettier my config"

Non-triggers:
- [ ] "what is formatting?"
- [ ] "format my JavaScript"

## optimize-cc-md

Triggers:
- [ ] "optimize my CLAUDE.md"
- [ ] "fix my config"
- [ ] "my CLAUDE.md is too long"
- [ ] "improve organization"

Non-triggers:
- [ ] "validate my CLAUDE.md"
- [ ] "what is CLAUDE.md?"

## Results Summary

Total triggers tested: ___
Successful triggers: ___
Success rate: ___%

Non-triggers tested: ___
Successful non-triggers: ___
Success rate: ___%
EOF

echo "Created trigger test matrix: $TEST_DIR/trigger-test-matrix.md"
echo
echo "Next steps:"
echo "1. Open the test matrix: cat $TEST_DIR/trigger-test-matrix.md"
echo "2. For each skill, start fresh Claude Code session"
echo "3. Test each trigger phrase"
echo "4. Mark results in the matrix"
echo "5. Calculate success rates"
echo "6. Run: ./scripts/test/manual/verify-task-3.sh"
echo
