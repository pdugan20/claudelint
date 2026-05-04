# Releasing claudelint

The npm release happens in two places:

- **Locally** — `release-it` runs lint/test/build, bumps the version, generates the CHANGELOG entry, syncs versions to plugin/marketplace files, commits, tags, and pushes.
- **In CI** — `.github/workflows/publish.yml` triggers on the tag push, publishes to npm with OIDC trusted publishing + provenance, then creates a GitHub Release from the CHANGELOG entry.

## Normal release

```bash
npm run release:patch    # bug fixes only
npm run release:minor    # any new feat: commits since last release
npm run release:major    # breaking changes
```

`--ci` skips the interactive prompts:

```bash
GITHUB_TOKEN=$(gh auth token) npx release-it minor --ci
```

After the tag push, watch the publish workflow:

```bash
gh run watch $(gh run list --workflow=publish.yml --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status
```

## If publish fails

**Read this section before touching `publish.yml`.** Four independent things must be right at the same time. Toggling one in isolation can mask whether a different one is broken — that's how the workflow drifted into 5+ failed releases in May 2026.

### 1. npm trusted publisher must be configured for this exact repo

- URL: <https://www.npmjs.com/package/claude-code-lint/access> → Trusted Publisher
- Required values:
  - Organization or user: `pdugan20`
  - Repository: `claudelint` *(no hyphen — local dir is `claude-lint` but the GitHub repo is `claudelint`)*
  - Workflow filename: `publish.yml`
  - Environment: blank
- **Symptom of failure**: `npm error 404 Not Found - PUT https://registry.npmjs.org/claude-code-lint`. The 404 is misleading — npm returns it when the OIDC subject doesn't match a configured trusted publisher.
- **Fix**: delete the existing trusted publisher and re-add it. Clicking Save on the existing one does not always clear stale backend state.

### 2. Do NOT add `npm install -g npm@latest` to the workflow

- **Symptom**: `npm error code MODULE_NOT_FOUND` / `Cannot find module 'promise-retry'` in the npm self-upgrade step
- **Why**: npm's self-upgrade currently crashes mid-bootstrap on the GitHub Actions runner image
- **Fix**: don't try to upgrade npm. The bundled npm is sufficient (see #4).

### 3. Do NOT set `registry-url` on `actions/setup-node`

- **Symptom**: `npm error code ENEEDAUTH` *or* the same misleading 404 from #1
- **Why**: `setup-node` with `registry-url` writes an `.npmrc` containing `_authToken=${NODE_AUTH_TOKEN}`. When no `NPM_TOKEN` secret is set, it defaults `NODE_AUTH_TOKEN` to a placeholder value (`XXXXX-XXXXX-...`). npm sees the placeholder and tries to authenticate with it instead of falling back to OIDC trusted publishing, and the registry rejects the publish.
- **Fix**: omit `registry-url` entirely. npm publishes to `https://registry.npmjs.org/` by default.

### 4. Runner must use Node 24+ (for npm 11.5+)

- **Symptom**: `npm error code ENEEDAUTH`. Provenance signing succeeds (you'll see `npm notice publish Signed provenance statement`) but the publish itself fails with no auth.
- **Why**: OIDC trusted publishing requires npm to auto-fetch the GitHub Actions OIDC token and exchange it with the registry. That auto-fetch logic was added in npm 11.5+. The bundled npm 10.9.7 (from Node 22) only supports the *provenance signing* half of OIDC, not the *trusted-publishing auth* half.
- **Fix**: `node-version: '24'` on `actions/setup-node` (Node 24 LTS ships with npm 11+).
- **Trap**: provenance signing succeeding in the logs does **not** mean OIDC is fully working. They're two independent halves.

## Why the local v0.4.0 tag is on a March commit

The local `v0.4.0` git tag points at the actual commit that's published on npm (gitHead `6d03b10b`, March 23 2026), not at the most recent commit titled `chore: release v0.4.0`. During the May 2026 publish-pipeline debugging, the v0.4.0 tag was briefly moved to a today-commit that never made it to npm; we restored the tag to the truthful commit so `git show v0.4.0` matches what users actually downloaded.

If you ever need to recover the relationship: `npm view claude-code-lint@<version> gitHead` returns the commit npm received.

## Verifying a release

After CI completes:

```bash
npm view claude-code-lint@<version> dist          # should show attestations.provenance + signatures
npm view claude-code-lint dist-tags               # latest should match the new version
gh release view v<version>                        # GitHub release exists
```

If `dist-tags.latest` did not auto-update (rare but seen with v0.4.0):

```bash
npm dist-tag add claude-code-lint@<version> latest
```
