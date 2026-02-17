# GitHub Branch Protection Configuration

Branch protection for the claudelint repository is implemented via **repository rulesets** (not legacy branch protection rules).

## Current Configuration

**Ruleset:** "Protect main" (ID: 12893501)
**Enforcement:** Active
**Target:** `refs/heads/main`

### Rules

| Rule | Setting |
|------|---------|
| Pull request required | Yes (0 approvals, thread resolution required) |
| Required status checks | 11 checks (strict: branch must be up to date) |
| Linear history | Required |
| Force pushes | Blocked |
| Deletions | Blocked |

### Bypass

Repository admins can bypass (for emergency hotfixes). This bypass shows in push output as "Bypassed rule violations."

### Required Status Checks

All CI jobs must pass before merging:

| Check | CI Job |
|-------|--------|
| `Lint & Format` | ESLint (TS + Vue), Stylelint, Prettier, Markdownlint, package.json lint |
| `Static Checks` | Emoji check, milestone refs, hardcoded counts, links, logger checks |
| `Build` | TypeScript build + publint |
| `Rule Verification` | Rule implementations, structure, schema sync, check:all |
| `Test (Node 20, ubuntu-latest)` | Jest test suite (Node 20, Linux) |
| `Test (Node 22, ubuntu-latest)` | Jest test suite (Node 22, Linux) |
| `Test (Node 20, macos-latest)` | Jest test suite (Node 20, macOS) |
| `Test (Node 22, macos-latest)` | Jest test suite (Node 22, macOS) |
| `Dogfood` | `claudelint check-all --format github --strict` |
| `Skill Validation` | Skill structure, CLI commands, metadata |
| `Integration Tests` | End-to-end CLI integration tests |

### Auto-Merge

Auto-merge is enabled on the repo. Workflow:

```bash
git checkout -b my-feature
# make changes, commit
git push -u origin my-feature
gh pr create --title "feat: my feature" --body "..."
gh pr merge --auto --merge
# PR merges automatically when all 11 checks pass
```

## Managing the Ruleset

```bash
# View current config
gh api repos/pdugan20/claudelint/rulesets/12893501

# Update (e.g., add a new required check)
gh api repos/pdugan20/claudelint/rulesets/12893501 --method PUT --input ruleset.json

# View in browser
open https://github.com/pdugan20/claudelint/rules/12893501
```

## When to Update

Update the required status checks when:

- CI job names change in `.github/workflows/ci.yml`
- Jobs are added or removed
- Test matrix dimensions change (Node versions, OS)

**Last Updated:** 2026-02-16
