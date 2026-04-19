---
description: Integrate claudelint into CI/CD pipelines, pre-commit hooks, npm scripts, and the Claude Code plugin to validate your configuration automatically.
---

# Integrations

claudelint integrates with your existing development workflow through CI/CD pipelines, pre-commit hooks, npm scripts, and the Claude Code plugin system.

## Integration Options

<div class="integration-grid">

<a href="/integrations/ci" class="integration-card">
  <div class="integration-card-title">CI/CD</div>
  <p class="integration-card-desc">Run in GitHub Actions, GitLab CI, or any pipeline. Blocks merges on errors and annotates PR diffs.</p>
  <div class="integration-card-footer">
    <span class="integration-card-tag">GitHub Actions</span>
    <span class="integration-card-tag">GitLab CI</span>
  </div>
</a>

<a href="/integrations/hooks" class="integration-card">
  <div class="integration-card-title">Claude Code Hooks</div>
  <p class="integration-card-desc">SessionStart hooks validate your configuration every time a Claude Code session begins.</p>
  <div class="integration-card-footer">
    <span class="integration-card-tag">Local</span>
    <span class="integration-card-tag">Automatic</span>
  </div>
</a>

<a href="/integrations/npm-scripts" class="integration-card">
  <div class="integration-card-title">npm Scripts</div>
  <p class="integration-card-desc">Add <code>claudelint check-all</code> to your <code>package.json</code> to run alongside your existing lint/test commands.</p>
  <div class="integration-card-footer">
    <span class="integration-card-tag">package.json</span>
  </div>
</a>

<a href="/integrations/claude-code-plugin" class="integration-card">
  <div class="integration-card-title">Claude Code Plugin</div>
  <p class="integration-card-desc">Install claudelint as a Claude Code plugin to expose validation skills inside the assistant itself.</p>
  <div class="integration-card-footer">
    <span class="integration-card-tag">Plugin</span>
    <span class="integration-card-tag">Skills</span>
  </div>
</a>

<a href="/integrations/monorepos" class="integration-card">
  <div class="integration-card-title">Monorepos</div>
  <p class="integration-card-desc">Config inheritance across workspaces. Run one validator across every package, or scope per-package.</p>
  <div class="integration-card-footer">
    <span class="integration-card-tag">Workspaces</span>
    <span class="integration-card-tag">Inheritance</span>
  </div>
</a>

<a href="/integrations/sarif" class="integration-card">
  <div class="integration-card-title">SARIF Output</div>
  <p class="integration-card-desc">Emit SARIF for GitHub Code Scanning, VS Code, and other security tooling with persistent trend tracking.</p>
  <div class="integration-card-footer">
    <span class="integration-card-tag">Code Scanning</span>
    <span class="integration-card-tag">VS Code</span>
  </div>
</a>

</div>

## Quick Start: GitHub Actions

The most common integration. Drop this into `.github/workflows/claudelint.yml`:

```yaml
name: Lint Claude Config
on: [push, pull_request]

jobs:
  claudelint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: '20'
      - run: npm install -g claude-code-lint
      - run: claudelint check-all --format github
```

Errors and warnings appear directly on the PR diff at the relevant lines — no permissions or upload steps needed. See the [CI/CD guide](/integrations/ci) for problem matchers, SARIF upload, and other CI systems.

<style scoped>
.integration-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
  margin: 16px 0 32px;
}

.integration-card {
  display: flex;
  flex-direction: column;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  text-decoration: none;
  color: inherit;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.integration-card:hover {
  border-color: var(--vp-c-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.integration-card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
}

.integration-card-desc {
  margin: 0 0 16px;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  flex-grow: 1;
}

.integration-card-desc code {
  font-size: 0.8125rem;
  padding: 1px 4px;
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
}

.integration-card-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
}

.integration-card-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.75rem;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}

.dark .integration-card-tag {
  background: rgba(255, 255, 255, 0.08);
}
</style>
