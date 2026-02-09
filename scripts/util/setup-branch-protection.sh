#!/usr/bin/env bash
# Setup repository rulesets for pdugan20/claudelint
#
# Usage: bash scripts/util/setup-branch-protection.sh
#
# Requires: gh CLI authenticated with repo admin access
# Requires: GitHub Pro (for private repos) or public repo
#
# Note: commit_message_pattern, file_extension_restriction, and
# max_file_size rules require Enterprise or org-owned repos.
# These are enforced locally via commitlint and .gitignore instead.

set -euo pipefail

REPO="pdugan20/claudelint"

echo "Configuring repository rulesets for ${REPO}..."

# Remove any existing rulesets with the same name
EXISTING=$(gh api "repos/${REPO}/rulesets" --jq '.[] | select(.name == "Main branch protection") | .id' 2>/dev/null || true)
if [ -n "$EXISTING" ]; then
  echo "Removing existing ruleset (ID: ${EXISTING})..."
  gh api "repos/${REPO}/rulesets/${EXISTING}" --method DELETE
fi

# Create the ruleset
gh api "repos/${REPO}/rulesets" --method POST --input - <<'EOF'
{
  "name": "Main branch protection",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/main"],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "deletion"
    },
    {
      "type": "non_fast_forward"
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "required_status_checks": [
          { "context": "Build" },
          { "context": "Test (Node 20)" },
          { "context": "Test (Node 22)" },
          { "context": "Complete Validation" }
        ],
        "strict_required_status_checks_policy": true
      }
    }
  ]
}
EOF

echo ""
echo "Ruleset configured:"
echo "  - Required checks: Build, Test (Node 20), Test (Node 22), Complete Validation"
echo "  - Branches must be up to date"
echo "  - No force pushes"
echo "  - No branch deletion"
echo ""
echo "View at: https://github.com/${REPO}/rules"
