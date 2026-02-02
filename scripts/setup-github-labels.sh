#!/usr/bin/env bash
# Setup GitHub labels for claudelint repository

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up GitHub labels for claudelint...${NC}"

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed.${NC}"
    echo "Please install it first:"
    echo "  macOS: brew install gh"
    echo "  Linux: See https://github.com/cli/cli#installation"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "Please authenticate with GitHub CLI:"
    gh auth login
fi

# Repository (auto-detect from git remote)
REPO=$(git remote get-url origin | sed 's/.*github\.com[:/]\(.*\)\.git/\1/' || echo "pdugan20/claudelint")

echo "Repository: $REPO"
echo ""

# Verify repository exists
if ! gh repo view "$REPO" &>/dev/null; then
    echo -e "${RED}Error: Repository '$REPO' not found on GitHub.${NC}"
    echo ""
    echo "Please ensure:"
    echo "  1. The repository exists on GitHub"
    echo "  2. You have access to the repository"
    echo "  3. The repository name matches your git remote"
    echo ""
    echo "To create the repository:"
    echo "  gh repo create $REPO --public --source=. --remote=origin --push"
    echo ""
    exit 1
fi

# Function to create label (only if it doesn't exist)
create_label() {
    local name="$1"
    local color="$2"
    local description="$3"

    # Check if label exists
    if gh label list --repo "$REPO" 2>/dev/null | grep -q "^$name"; then
        echo -e "  ⏭️  Skipping '$name' (already exists)"
    else
        if gh label create "$name" --repo "$REPO" --color "$color" --description "$description" 2>/dev/null; then
            echo -e "  ${GREEN}✓${NC} Created '$name'"
        else
            echo -e "  ${RED}✗${NC} Failed to create '$name'"
        fi
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
echo -e "${GREEN}✅ Label setup complete!${NC}"
echo ""
echo "View all labels at: https://github.com/$REPO/labels"
