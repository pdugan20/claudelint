# GitHub Branch Protection Configuration

This document describes the recommended branch protection rules for the claudelint repository.

## Overview

Branch protection rules help maintain code quality by requiring specific checks before merging pull requests. These settings must be configured in the GitHub repository settings.

## Configuration Location

**GitHub Repository → Settings → Branches → Branch protection rules**

## Branch: `main`

### Basic Settings

- **Branch name pattern:** `main`
- **Apply rule to:** Main branch only

### Pull Request Requirements

#### Require a pull request before merging

- [x] **Require a pull request before merging**
  - **Required number of approvals before merging:** 1
  - [x] **Dismiss stale pull request approvals when new commits are pushed**
  - [ ] **Require review from Code Owners** (optional - enable when team grows)
  - [x] **Restrict who can dismiss pull request reviews** (repository administrators only)
  - [ ] **Allow specified actors to bypass required pull requests** (none)
  - [x] **Require approval of the most recent reviewable push**

#### Require status checks to pass before merging

- [x] **Require status checks to pass before merging**
  - [x] **Require branches to be up to date before merging**

**Required status checks:**

The following CI jobs must pass:

- `lint` - ESLint validation
- `format` - Prettier formatting check
- `markdown` - Markdownlint validation
- `links` - Documentation link validation (optional: continue-on-error)
- `emoji-check` - Emoji usage validation
- `verify-rules` - Rule implementation verification
- `verify-rule-structure` - Rule structure validation (optional: continue-on-error)
- `build` - TypeScript build
- `test (18)` - Tests on Node 18
- `test (20)` - Tests on Node 20
- `test (22)` - Tests on Node 22
- `dogfood` - Self-validation
- `integration` - Integration tests
- `complete-validation` - Final validation
- **codecov/project** - Code coverage check (after codecov is set up)
- **codecov/patch** - PR coverage check (after codecov is set up)

#### Additional Protections

- [x] **Require conversation resolution before merging**
- [x] **Require signed commits** (optional but recommended)
- [ ] **Require linear history** (optional - squash or rebase only)
- [x] **Require deployments to succeed before merging** (if deployment workflows exist)

### Push Restrictions

#### Rules applied to everyone including administrators

- [x] **Do not allow bypassing the above settings**
  - Ensures even repository administrators must follow the rules
  - Can be temporarily disabled for emergency hotfixes

#### Force Push Settings

- [x] **Do not allow force pushes**
  - Prevents accidental history rewrites
  - Maintains audit trail

#### Deletion Settings

- [x] **Do not allow deletions**
  - Prevents accidental branch deletion
  - Main branch should never be deleted

### Additional Settings

#### Allow force pushes (exceptions)

- [ ] **Allow force pushes to matching branches**
  - Keep disabled for `main`
  - Can be enabled for feature branches if needed

#### Allow deletions (exceptions)

- [ ] **Allow deletions**
  - Keep disabled for `main`

## Branch: Development/Feature Branches (optional)

If using a development branch workflow, consider these rules:

### Branch: `develop` or `next`

- **Require pull request:** Yes (1 approval)
- **Require status checks:** Yes (all CI must pass)
- **Require conversation resolution:** Yes
- **Allow force push:** No
- **Allow deletion:** No

### Feature Branches

- **Pattern:** `feature/*`, `fix/*`, `docs/*`
- **Protection level:** Minimal or none
- **Allow force push:** Yes (for rebasing during development)
- **Allow deletion:** Yes (after merging)

## Status Check Configuration

### Setting Up Status Checks

1. Create a pull request to trigger CI workflows
2. After the first CI run, status checks will appear in the branch protection settings
3. Select the required checks from the list
4. Save the branch protection rule

### Troubleshooting

If required status checks don't appear:

1. Ensure `.github/workflows/ci.yml` exists and is properly configured
2. Create a test PR to trigger workflows
3. Wait for workflows to complete
4. Refresh the branch protection settings page
5. Status checks should now appear in the dropdown

## Implementation Steps

Follow these steps to configure branch protection:

1. **Navigate to Settings**
   - Go to: `https://github.com/pdugan20/claudelint/settings/branches`

2. **Add Branch Protection Rule**
   - Click "Add branch protection rule"
   - Enter branch name pattern: `main`

3. **Configure Pull Request Requirements**
   - Enable "Require a pull request before merging"
   - Set required approvals to 1
   - Enable "Dismiss stale pull request approvals when new commits are pushed"
   - Enable "Require approval of the most recent reviewable push"

4. **Configure Status Checks**
   - Enable "Require status checks to pass before merging"
   - Enable "Require branches to be up to date before merging"
   - Wait for CI to run once, then select required checks

5. **Enable Additional Protections**
   - Enable "Require conversation resolution before merging"
   - Consider enabling "Require signed commits"

6. **Restrict Force Push and Deletion**
   - Enable "Do not allow bypassing the above settings"
   - Enable "Do not allow force pushes"
   - Enable "Do not allow deletions"

7. **Save Changes**
   - Click "Create" or "Save changes"

## Enforcement Timeline

### Phase 1: Soft Enforcement (Current)

- Branch protection rules documented
- Team aware of requirements
- Manual enforcement through code review
- Warnings for violations

### Phase 2: Automated Enforcement (After first stable release)

- Enable all branch protection rules
- Require status checks
- Block merges that don't meet requirements
- Only administrators can override (emergency only)

### Phase 3: Strict Enforcement (After team growth)

- Add code owner review requirements
- Require signed commits
- Enable all optional protections
- No bypass allowed (even for administrators)

## Benefits

Branch protection provides:

1. **Code Quality**
   - Ensures all code is reviewed
   - Requires tests to pass before merging
   - Maintains consistent formatting and linting

2. **Safety**
   - Prevents accidental force pushes
   - Protects against direct commits to main
   - Requires conversation resolution

3. **Compliance**
   - Maintains audit trail
   - Enforces review requirements
   - Documents approval process

4. **Collaboration**
   - Encourages pull request workflow
   - Facilitates code review
   - Improves team communication

## Exceptions and Emergency Process

### When to Override

Branch protection can be temporarily disabled for:

- Emergency security hotfixes
- Critical bug fixes affecting production
- Repository maintenance (e.g., history cleanup)

### Emergency Override Process

1. **Assess Impact**
   - Verify the change is truly an emergency
   - Document the reason for override

2. **Notify Team**
   - Inform team members of the override
   - Explain the urgency

3. **Make Changes**
   - Temporarily disable branch protection
   - Apply the emergency fix
   - Re-enable protection immediately

4. **Post-Mortem**
   - Create follow-up PR with proper reviews
   - Document why the emergency occurred
   - Update processes to prevent recurrence

## Related Documentation

- [Contributing Guide](../CONTRIBUTING.md)
- [Pull Request Template](../.github/PULL_REQUEST_TEMPLATE.md)
- [CI Workflow](../.github/workflows/ci.yml)
- [Code Owners](../.github/CODEOWNERS)

## Maintenance

This configuration should be reviewed:

- After major CI workflow changes
- When adding new required checks
- When team structure changes
- Quarterly for best practices updates

**Last Updated:** 2026-02-01

**Next Review:** 2026-05-01
