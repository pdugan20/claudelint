# Unified Truth Registry Proposal

**Status**: Proposal
**Created**: 2026-02-02
**Priority**: High (Critical for validation correctness)

## Problem Statement

claudelint validates Claude Code configurations against specifications, but we have no systematic way to verify our validation logic matches official Claude/Anthropic sources. This creates risk:

1. **Schemas drift**: Our Zod schemas may not match official JSON Schemas or documented specs
2. **Constants drift**: Enum values (tools, events, models) may become outdated
3. **No single source of truth**: Information scattered across multiple files
4. **Manual verification**: No automation to detect when we're out of sync

**Impact**: Users get false positives/negatives, invalid configurations pass validation, valid configurations fail.

## Current State

### What We Track

**Schemas** (10 total):

- SettingsSchema (has JSON Schema URL, verified)
- PluginManifestSchema (out of sync - CRITICAL)
- HooksConfigSchema, MCPConfigSchema, LSPConfigSchema (need audit)
- SkillFrontmatterSchema, AgentFrontmatterSchema (need audit)
- ClaudeMdFrontmatterSchema, OutputStyleFrontmatterSchema, MarketplaceMetadataSchema (need audit)

**Constants** (9 total):

- ToolNames (21 tools) - no official URL
- ModelNames (4 models) - no official URL
- HookEvents (13 events) - documented in plugin reference
- HookTypes (3 types) - documented in plugin reference
- ContextModes (3 modes) - no official URL
- TransportTypes (4 types) - documented in MCP docs
- RuleCategory (10 categories) - derived from component types
- PermissionActions (3 actions) - in settings schema
- ScriptExtensions (3 extensions) - internal decision

### Where Truth Lives

**Official Sources by Type**:

1. **JSON Schema URLs** (machine-readable, ideal):
   - Settings: <https://json.schemastore.org/claude-code-settings.json>
   - Others: None found

2. **Documented Specs** (human-readable, parsable):
   - Plugin Reference: <https://code.claude.com/docs/en/plugins-reference>
   - Skills: <https://code.claude.com/docs/en/skills>
   - Hooks: <https://code.claude.com/docs/en/hooks>
   - MCP: <https://code.claude.com/docs/en/mcp>
   - Settings: <https://code.claude.com/docs/en/settings>

3. **Inferred from Examples** (low confidence):
   - Code examples in documentation
   - GitHub repository examples

4. **Undocumented** (need to ask or test):
   - Tool names list (no comprehensive list found)
   - Model names mapping (simplified vs API IDs)
   - Context modes (no docs found)

## Proposed Solution

### 1. Unified Truth Registry

**File**: `src/schemas/truth-registry.ts`

A single TypeScript module that tracks all validation sources with metadata:

```typescript
export interface TruthSource {
  // Identity
  name: string;
  type: 'schema' | 'constant' | 'enum';
  file: string;

  // Official Source
  officialUrl?: string;
  sourceType: 'json-schema' | 'documented-spec' | 'inferred' | 'undocumented';
  docsUrl?: string;

  // Verification
  verificationMethod: 'automated' | 'manual' | 'hybrid' | 'none';
  lastVerified?: string; // ISO date
  verifiedBy?: string; // Person/script name
  status: 'verified' | 'needs-audit' | 'out-of-sync' | 'no-official-source';

  // Context
  notes?: string;
  relatedSources?: string[]; // Other sources that should match

  // For automated verification
  verificationScript?: string; // Script that can verify this
  testCases?: unknown[]; // Sample valid/invalid values
}

export const TRUTH_REGISTRY: TruthSource[] = [
  // Schemas with JSON Schema URLs (automated)
  {
    name: 'SettingsSchema',
    type: 'schema',
    file: 'src/validators/schemas.ts',
    officialUrl: 'https://json.schemastore.org/claude-code-settings.json',
    sourceType: 'json-schema',
    docsUrl: 'https://code.claude.com/docs/en/settings',
    verificationMethod: 'automated',
    verifiedBy: 'check:schema-sync',
    lastVerified: '2026-02-02',
    status: 'verified',
    verificationScript: 'scripts/verify/settings-schema.ts',
  },

  // Schemas from documented specs (hybrid)
  {
    name: 'PluginManifestSchema',
    type: 'schema',
    file: 'src/validators/schemas.ts',
    sourceType: 'documented-spec',
    docsUrl: 'https://code.claude.com/docs/en/plugins-reference#complete-schema',
    verificationMethod: 'hybrid',
    lastVerified: '2026-02-02',
    status: 'out-of-sync',
    notes: 'CRITICAL: Missing fields (homepage, keywords, outputStyles, lspServers), wrong types (author should be object)',
    verificationScript: 'scripts/verify/plugin-schema.ts',
    testCases: [
      { name: 'my-plugin', version: '1.0.0', author: { name: 'Pat' } }, // valid
      { name: 'test', author: 'string' }, // invalid - author should be object
    ],
  },

  // Constants with documented values (hybrid)
  {
    name: 'HookEvents',
    type: 'enum',
    file: 'src/schemas/constants.ts',
    sourceType: 'documented-spec',
    docsUrl: 'https://code.claude.com/docs/en/plugins-reference#hooks',
    verificationMethod: 'hybrid',
    status: 'needs-audit',
    notes: 'Plugin docs list events, need to verify Setup event exists',
    verificationScript: 'scripts/verify/hook-events.ts',
    relatedSources: ['SettingsHooksSchema'],
  },

  // Undocumented constants (manual only)
  {
    name: 'ToolNames',
    type: 'enum',
    file: 'src/schemas/constants.ts',
    sourceType: 'undocumented',
    verificationMethod: 'manual',
    status: 'needs-audit',
    notes: 'No official comprehensive list found. Need to test Claude Code or ask Anthropic.',
    testCases: [
      'Bash', // known valid
      'FakeToolThatDoesntExist', // known invalid
    ],
  },

  // Internal decisions (no verification needed)
  {
    name: 'ScriptExtensions',
    type: 'enum',
    file: 'src/schemas/constants.ts',
    sourceType: 'undocumented',
    verificationMethod: 'none',
    status: 'no-official-source',
    notes: 'Internal decision: which script types we validate in hooks',
  },
];
```

### 2. Verification Tooling

#### 2.1 Automated Verification (JSON Schema Sources)

**Existing**: `scripts/check/schema-sync.ts` (settings only)

**Expand to**: Generic schema sync framework

```typescript
// scripts/verify/schema-sync-framework.ts

export async function verifyJsonSchema(
  localSchema: z.ZodType,
  officialUrl: string,
  testCases: TestCase[]
): Promise<VerificationResult> {
  // 1. Fetch official JSON Schema
  const officialSchema = await fetchJsonSchema(officialUrl);

  // 2. Compile both schemas
  const ajv = new Ajv();
  const officialValidator = ajv.compile(officialSchema);

  // 3. Run test cases through both validators
  const results = testCases.map(testCase => {
    const localResult = localSchema.safeParse(testCase.data);
    const officialResult = officialValidator(testCase.data);

    return {
      testCase: testCase.name,
      localValid: localResult.success,
      officialValid: officialResult,
      match: localResult.success === officialResult,
    };
  });

  // 4. Report mismatches
  return {
    url: officialUrl,
    passed: results.every(r => r.match),
    results,
  };
}
```

**Usage**:

```bash
npm run verify:schemas          # All schemas
npm run verify:schema settings  # Specific schema
```

#### 2.2 Hybrid Verification (Documented Specs)

For schemas/constants with human-readable documentation:

**Approach**:

1. **Manual extraction**: Developer reads docs, extracts spec
2. **Codify as test cases**: Create test suite that validates against spec
3. **Automate test execution**: CI runs tests on every change

**Example**: Plugin manifest verification

```typescript
// scripts/verify/plugin-schema.ts

describe('PluginManifestSchema vs Official Docs', () => {
  // From https://code.claude.com/docs/en/plugins-reference#complete-schema

  it('should have required name field', () => {
    const result = PluginManifestSchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['name']);
  });

  it('should accept author as object with name/email/url', () => {
    const result = PluginManifestSchema.safeParse({
      name: 'test',
      author: { name: 'Pat', email: 'pat@example.com', url: 'https://github.com/pdugan20' },
    });
    expect(result.success).toBe(true);
  });

  it('should accept skills as string or array', () => {
    const stringResult = PluginManifestSchema.safeParse({
      name: 'test',
      skills: './skills/',
    });
    expect(stringResult.success).toBe(true);

    const arrayResult = PluginManifestSchema.safeParse({
      name: 'test',
      skills: ['./skills/a', './skills/b'],
    });
    expect(arrayResult.success).toBe(true);
  });

  // ... more tests based on docs
});
```

**Documentation-based test generation**:

```typescript
// scripts/verify/extract-spec-from-docs.ts

// Helper that uses AI or manual extraction to generate test cases from docs
// Input: URL to documentation page
// Output: Generated test cases

async function extractSpecFromDocs(url: string): Promise<TestCase[]> {
  const docsContent = await fetchDocs(url);

  // Option 1: Manual - developer reads docs, writes tests
  // Option 2: AI-assisted - use Claude API to extract schema from docs
  // Option 3: Structured extraction - parse markdown tables/code examples

  return generatedTestCases;
}
```

#### 2.3 Manual Verification (Undocumented)

For sources without official documentation:

**Process**:

1. **Test in Claude Code**: Create test project, try different values
2. **Document findings**: Record what works/doesn't work
3. **Track in registry**: Mark as manually verified with date/notes
4. **Re-verify periodically**: Check after Claude Code updates

**Example**: Tool names verification

```bash
# Manual verification checklist
# File: docs/verification/tool-names-manual-verification.md

## ToolNames Manual Verification

Last Verified: 2026-02-02
Verified By: Pat Dugan
Claude Code Version: 1.5.0

### Method
Created test skill with each tool in allowed-tools, invoked in Claude Code

### Results
- Bash: Works
- Read: Works
- Write: Works
- Edit: Works
- Glob: Works
- Grep: Works
- Task: Works
- WebFetch: Works
- WebSearch: Works
- LSP: Works
- AskUserQuestion: Works
- EnterPlanMode: Works
- ExitPlanMode: Works
- Skill: Works
- TaskCreate: Works
- TaskUpdate: Works
- TaskGet: Works
- TaskList: Works
- TaskOutput: Works
- TaskStop: Works
- NotebookEdit: Works

### Missing Tools?
Checked Claude Code release notes for v1.5.0 - no new tools mentioned

### Status
All 21 tools verified as of 2026-02-02
```

**Automation helper**:

```typescript
// scripts/verify/manual-verification-tracker.ts

// Tracks when manual verifications expire and need re-checking
// Warns when Claude Code version changes

interface ManualVerification {
  source: string;
  lastVerified: string;
  claudeCodeVersion: string;
  expiresAfterDays: number;
}

function checkManualVerifications(): void {
  const verifications = loadManualVerifications();
  const currentVersion = getClaudeCodeVersion(); // from docs or local install

  verifications.forEach(v => {
    const daysSince = daysBetween(v.lastVerified, today());
    const versionChanged = v.claudeCodeVersion !== currentVersion;

    if (daysSince > v.expiresAfterDays || versionChanged) {
      console.warn(`Manual verification needed for ${v.source}`);
    }
  });
}
```

### 3. Integration Points

#### 3.1 CLI Commands

```bash
# Verify all sources
npm run verify:truth

# Verify specific category
npm run verify:schemas
npm run verify:constants

# Verify specific source
npm run verify:truth settings-schema
npm run verify:truth hook-events

# Show verification status
npm run verify:status

# Update registry after verification
npm run verify:update-registry
```

#### 3.2 CI/CD Integration

**GitHub Actions workflow**:

```yaml
name: Truth Registry Verification

on:
  schedule:
    # Run weekly to catch drift
    - cron: '0 0 * * 0'
  pull_request:
    paths:
      - 'src/schemas/**'
      - 'src/validators/schemas.ts'
  workflow_dispatch:

jobs:
  verify-truth:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Verify JSON Schemas
        run: npm run verify:schemas

      - name: Verify documented specs
        run: npm run verify:documented

      - name: Check manual verification status
        run: npm run verify:manual-status

      - name: Report results
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Truth Registry Verification Failed',
              body: 'Schemas or constants are out of sync with official sources. See workflow logs.',
              labels: ['schema-drift', 'needs-verification'],
            });
```

#### 3.3 Pre-commit Hook Integration

Prevent committing schema changes without verification:

```bash
#!/bin/bash
# .husky/pre-commit

# Check if schema files changed
if git diff --cached --name-only | grep -E 'src/(schemas|validators)/.*\.ts$'; then
  echo "Schema files changed. Running verification..."
  npm run verify:schemas

  if [ $? -ne 0 ]; then
    echo "ERROR: Schema verification failed"
    echo "Run 'npm run verify:truth' to see details"
    exit 1
  fi
fi
```

### 4. Documentation Strategy

#### 4.1 Truth Registry Dashboard

**File**: `docs/truth-registry-status.md` (auto-generated)

```markdown
# Truth Registry Status

Last Updated: 2026-02-02 14:30 UTC

## Summary

- Total Sources: 19
- Verified: 2 (11%)
- Needs Audit: 15 (79%)
- Out of Sync: 2 (11%)

## By Verification Method

- Automated: 1 source (SettingsSchema)
- Hybrid: 8 sources
- Manual: 8 sources
- None: 2 sources (internal decisions)

## By Status

### Verified (2)
- SettingsSchema (automated, last: 2026-02-02)
- HookTypes (manual, last: 2026-02-02)

### Out of Sync (2)
- **PluginManifestSchema** (CRITICAL)
  - Missing: homepage, keywords, outputStyles, lspServers
  - Wrong types: author, description
  - Action: Fix in Phase 1 Task 1.4

### Needs Audit (15)
[List with links to audit docs]

## Verification Schedule

- **Automated (JSON Schema)**: Every PR, weekly
- **Hybrid (Documented)**: Every PR, bi-weekly
- **Manual (Undocumented)**: Monthly, on Claude Code version changes

## Next Actions

1. Fix PluginManifestSchema (CRITICAL)
2. Audit high-priority constants (ToolNames, ModelNames, HookEvents)
3. Set up automated verification pipeline
```

#### 4.2 Verification Playbooks

Create guides for each verification method:

- `docs/verification/automated-schema-verification.md`
- `docs/verification/hybrid-spec-verification.md`
- `docs/verification/manual-constant-verification.md`

### 5. Implementation Phases

#### Phase 1: Foundation (1-2 days)

- [ ] Create unified truth-registry.ts
- [ ] Migrate existing schema-registry.ts data
- [ ] Add constants from constants-audit.md
- [ ] Create registry query helpers
- [ ] Generate status dashboard

#### Phase 2: Automated Verification (2-3 days)

- [ ] Extract schema-sync.ts into framework
- [ ] Add support for multiple JSON Schema URLs
- [ ] Create verify:schemas command
- [ ] Add CI workflow for automated checks
- [ ] Document automated verification process

#### Phase 3: Hybrid Verification (3-4 days)

- [ ] Create test suites for documented specs
- [ ] Implement PluginManifestSchema verification tests
- [ ] Implement HookEvents verification tests
- [ ] Implement MCPConfigSchema verification tests
- [ ] Create verify:documented command
- [ ] Document hybrid verification process

#### Phase 4: Manual Verification Support (2-3 days)

- [ ] Create manual verification templates
- [ ] Implement manual verification tracker
- [ ] Create verification expiry warnings
- [ ] Document manual verification process
- [ ] Set up periodic review reminders

#### Phase 5: Integration (1-2 days)

- [ ] Add pre-commit hooks
- [ ] Integrate with CI/CD
- [ ] Create status dashboard
- [ ] Update contributing guide
- [ ] Train team on verification workflow

**Total Estimated Time**: 9-14 days

### 6. Success Metrics

**Technical Metrics**:

- 100% of schemas have verification method defined
- 0 critical sources out of sync
- <5% of sources need re-verification
- Automated verification runs <2 minutes
- CI catches drift within 1 week

**Process Metrics**:

- Schema changes require verification (enforced by pre-commit)
- Manual verifications don't expire
- Documentation stays up to date (auto-generated)
- Team knows how to verify new sources

## Alternatives Considered

### Alternative 1: Manual tracking in markdown

**Pros**: Simple, no code
**Cons**: No automation, easy to forget, no enforcement
**Decision**: Rejected - need automation

### Alternative 2: Separate schema and constant registries

**Pros**: Separation of concerns
**Cons**: Duplication, harder to see full picture
**Decision**: Rejected - unified view is more valuable

### Alternative 3: Only track sources with JSON Schema URLs

**Pros**: Easy to automate
**Cons**: Ignores 90% of our sources
**Decision**: Rejected - need comprehensive coverage

## Open Questions

1. **Should we use Claude API to extract specs from docs?**
   - Pros: Fast, less manual work
   - Cons: Costs money, AI might miss details
   - Decision: Hybrid - use for initial extraction, manual verification

2. **How often should manual verifications expire?**
   - Proposal: 90 days OR on Claude Code version change
   - Feedback needed from team

3. **Should we block PRs on verification failures?**
   - Proposal: Block on critical sources, warn on others
   - Feedback needed from team

4. **Who owns keeping registry up to date?**
   - Proposal: Person changing schema/constant must verify
   - Automated reminders for periodic re-verification

## Next Steps

1. Get team feedback on this proposal
2. Prioritize which sources to verify first
3. Start Phase 1 implementation
4. Set up verification workflows
5. Document and train team

## Related Documents

- [Schema Audit](./schema-audit.md) - Detailed schema comparison
- [Constants Audit](./constants-audit.md) - Detailed constants comparison
- [Plugin Manifest Spec](./plugin-manifest-spec.md) - Plugin.json requirements
- [Tracker](./tracker.md) - Phase 1 implementation tasks
