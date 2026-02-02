# GitHub Labels Configuration

This document lists all labels that should be configured for the claudelint repository.

## Label Overview

Labels help organize and categorize issues and pull requests. They should be consistent, descriptive, and use appropriate colors for visual distinction.

## Adding Labels

### Via GitHub Web Interface

1. Go to: `https://github.com/pdugan20/claudelint/labels`
2. Click "New label" for each label below
3. Enter name, description, and color
4. Click "Create label"

### Via GitHub CLI

Run the following commands to create all labels at once:

```bash
# Install GitHub CLI if not already installed
# brew install gh (macOS)
# See: https://cli.github.com/

# Authenticate
gh auth login

# Navigate to repository
cd /Users/patdugan/Documents/GitHub/claude-lint

# Create labels (see script below)
```

## Required Labels

### Type Labels

These labels indicate the type of issue or PR:

| Label | Color | Description |
|-------|-------|-------------|
| `bug` | `#d73a4a` | Something isn't working |
| `enhancement` | `#a2eeef` | New feature or request |
| `documentation` | `#0075ca` | Improvements or additions to documentation |
| `dependencies` | `#0366d6` | Dependency updates |
| `performance` | `#f9d0c4` | Performance improvements |
| `refactoring` | `#fbca04` | Code refactoring without functional changes |
| `security` | `#ee0701` | Security-related issues or updates |
| `breaking-change` | `#b60205` | Changes that break backward compatibility |

### Component Labels

These labels indicate which part of the codebase is affected:

| Label | Color | Description |
|-------|-------|-------------|
| `new-rule` | `#7057ff` | Request for a new validation rule |
| `rule-change` | `#5319e7` | Changes to existing rule |
| `npm` | `#cb2431` | npm package related |
| `github-actions` | `#2cbe4e` | GitHub Actions and CI/CD |
| `cli` | `#006b75` | Command-line interface |
| `api` | `#0e8a16` | Programmatic API |
| `rules` | `#c5def5` | Validation rules |
| `validators` | `#bfdadc` | Validator components |
| `schemas` | `#d4c5f9` | Schema definitions |
| `config` | `#fef2c0` | Configuration handling |

### Priority Labels

These labels indicate urgency:

| Label | Color | Description |
|-------|-------|-------------|
| `critical` | `#b60205` | Critical priority - needs immediate attention |
| `high-priority` | `#d93f0b` | High priority issue |
| `medium-priority` | `#fbca04` | Medium priority issue |
| `low-priority` | `#0e8a16` | Low priority issue |

### Status Labels

These labels indicate the current state:

| Label | Color | Description |
|-------|-------|-------------|
| `needs-triage` | `#ededed` | Needs initial review and categorization |
| `needs-investigation` | `#d876e3` | Requires investigation before action |
| `needs-discussion` | `#c2e0c6` | Needs team discussion |
| `needs-reproduction` | `#fef2c0` | Needs a reproducible example |
| `in-progress` | `#0052cc` | Currently being worked on |
| `blocked` | `#d93f0b` | Blocked by external factor |
| `ready-for-review` | `#0e8a16` | Ready for code review |
| `awaiting-response` | `#fef2c0` | Waiting for response from author |

### Resolution Labels

These labels indicate how an issue was resolved:

| Label | Color | Description |
|-------|-------|-------------|
| `wontfix` | `#ffffff` | This will not be worked on |
| `duplicate` | `#cfd3d7` | This issue or PR already exists |
| `invalid` | `#e4e669` | This doesn't seem right |
| `question` | `#d876e3` | Further information is requested |
| `help-wanted` | `#008672` | Extra attention is needed |
| `good-first-issue` | `#7057ff` | Good for newcomers |

### Automation Labels

These labels are used by automated systems:

| Label | Color | Description |
|-------|-------|-------------|
| `dependabot` | `#0366d6` | Created by Dependabot |
| `renovate` | `#1f6feb` | Created by Renovate |
| `auto-merge` | `#0e8a16` | Eligible for automatic merging |
| `skip-changelog` | `#ededed` | Exclude from changelog |

### Special Labels

These labels have specific meanings:

| Label | Color | Description |
|-------|-------|-------------|
| `release` | `#0052cc` | Release-related issue |
| `roadmap` | `#8b5cf6` | Part of the project roadmap |
| `technical-debt` | `#fbca04` | Technical debt that should be addressed |
| `breaking-change` | `#b60205` | Introduces breaking changes |

## Label Groups

### For Bug Reports

- `bug`
- `needs-triage`
- `needs-reproduction`
- Priority label (critical/high/medium/low)
- Component label (cli/api/rules/etc.)

### For Feature Requests

- `enhancement` or `new-rule`
- `needs-triage`
- `needs-discussion`
- Priority label

### For Pull Requests

- Type label (bug/enhancement/documentation/etc.)
- Component label
- `ready-for-review` or `in-progress`
- `breaking-change` (if applicable)

## Label Management Script

Create and run this script to add all labels at once:

```bash
#!/usr/bin/env bash
# File: scripts/setup-github-labels.sh

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "${YELLOW}Setting up GitHub labels for claudelint...${NC}"

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh) is not installed. Please install it first:"
    echo "  macOS: brew install gh"
    echo "  Linux: See https://github.com/cli/cli#installation"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "Please authenticate with GitHub CLI:"
    gh auth login
fi

# Repository
REPO="pdugan20/claudelint"

# Function to create label (only if it doesn't exist)
create_label() {
    local name="$1"
    local color="$2"
    local description="$3"

    # Check if label exists
    if gh label list --repo "$REPO" | grep -q "^$name"; then
        echo "  SKIP:  Skipping '$name' (already exists)"
    else
        gh label create "$name" --repo "$REPO" --color "$color" --description "$description"
        echo "  ${GREEN}✓${NC} Created '$name'"
    fi
}

echo ""
echo "Creating type labels..."
create_label "bug" "d73a4a" "Something isn't working"
create_label "enhancement" "a2eeef" "New feature or request"
create_label "documentation" "0075ca" "Improvements or additions to documentation"
create_label "dependencies" "0366d6" "Dependency updates"
create_label "performance" "f9d0c4" "Performance improvements"
create_label "refactoring" "fbca04" "Code refactoring without functional changes"
create_label "security" "ee0701" "Security-related issues or updates"
create_label "breaking-change" "b60205" "Changes that break backward compatibility"

echo ""
echo "Creating component labels..."
create_label "new-rule" "7057ff" "Request for a new validation rule"
create_label "rule-change" "5319e7" "Changes to existing rule"
create_label "npm" "cb2431" "npm package related"
create_label "github-actions" "2cbe4e" "GitHub Actions and CI/CD"
create_label "cli" "006b75" "Command-line interface"
create_label "api" "0e8a16" "Programmatic API"
create_label "rules" "c5def5" "Validation rules"
create_label "validators" "bfdadc" "Validator components"
create_label "schemas" "d4c5f9" "Schema definitions"
create_label "config" "fef2c0" "Configuration handling"

echo ""
echo "Creating priority labels..."
create_label "critical" "b60205" "Critical priority - needs immediate attention"
create_label "high-priority" "d93f0b" "High priority issue"
create_label "medium-priority" "fbca04" "Medium priority issue"
create_label "low-priority" "0e8a16" "Low priority issue"

echo ""
echo "Creating status labels..."
create_label "needs-triage" "ededed" "Needs initial review and categorization"
create_label "needs-investigation" "d876e3" "Requires investigation before action"
create_label "needs-discussion" "c2e0c6" "Needs team discussion"
create_label "needs-reproduction" "fef2c0" "Needs a reproducible example"
create_label "in-progress" "0052cc" "Currently being worked on"
create_label "blocked" "d93f0b" "Blocked by external factor"
create_label "ready-for-review" "0e8a16" "Ready for code review"
create_label "awaiting-response" "fef2c0" "Waiting for response from author"

echo ""
echo "Creating resolution labels..."
create_label "wontfix" "ffffff" "This will not be worked on"
create_label "duplicate" "cfd3d7" "This issue or PR already exists"
create_label "invalid" "e4e669" "This doesn't seem right"
create_label "question" "d876e3" "Further information is requested"
create_label "help-wanted" "008672" "Extra attention is needed"
create_label "good-first-issue" "7057ff" "Good for newcomers"

echo ""
echo "Creating automation labels..."
create_label "dependabot" "0366d6" "Created by Dependabot"
create_label "renovate" "1f6feb" "Created by Renovate"
create_label "auto-merge" "0e8a16" "Eligible for automatic merging"
create_label "skip-changelog" "ededed" "Exclude from changelog"

echo ""
echo "Creating special labels..."
create_label "release" "0052cc" "Release-related issue"
create_label "roadmap" "8b5cf6" "Part of the project roadmap"
create_label "technical-debt" "fbca04" "Technical debt that should be addressed"

echo ""
echo "${GREEN}SUCCESS: Label setup complete!${NC}"
echo ""
echo "View all labels at: https://github.com/$REPO/labels"
```

## Usage Examples

### Labeling a Bug Report

```bash
# Bug in CLI with high priority
gh issue edit 123 --add-label "bug,cli,high-priority,needs-triage"
```

### Labeling a Feature Request

```bash
# New rule request
gh issue edit 456 --add-label "new-rule,enhancement,needs-discussion"
```

### Labeling a Pull Request

```bash
# Bug fix PR ready for review
gh pr edit 789 --add-label "bug,rules,ready-for-review"
```

## Label Automation

Consider setting up automated label assignment:

### Via `.github/labeler.yml`

Create `.github/labeler.yml` for PR auto-labeling:

```yaml
# Auto-label PRs based on file changes

rules:
  - changed-files:
      - any-glob-to-any-file: 'src/rules/**'

cli:
  - changed-files:
      - any-glob-to-any-file: 'src/cli/**'

documentation:
  - changed-files:
      - any-glob-to-any-file:
          - '**/*.md'
          - 'docs/**'

github-actions:
  - changed-files:
      - any-glob-to-any-file: '.github/workflows/**'

dependencies:
  - changed-files:
      - any-glob-to-any-file:
          - 'package.json'
          - 'package-lock.json'
```

### Via GitHub Actions

Add to `.github/workflows/label.yml`:

```yaml
name: Auto Label
on:
  pull_request_target:
    types: [opened, synchronize]

jobs:
  label:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/labeler@v5
        with:
          sync-labels: true
```

## Maintenance

Review and update labels:

- **Monthly:** Review label usage and consolidate duplicates
- **Quarterly:** Assess if new labels are needed
- **Annually:** Clean up unused labels

## Related Documentation

- [Issue Templates](../.github/ISSUE_TEMPLATE/)
- [Pull Request Template](../.github/PULL_REQUEST_TEMPLATE.md)
- [Contributing Guide](../CONTRIBUTING.md)

**Last Updated:** 2026-02-01
