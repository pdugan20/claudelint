---
description: Understand how claudelint organizes validation rules into categories covering CLAUDE.md, skills, settings, hooks, MCP servers, plugins, agents, LSP, and more.
---

# Validators

Each validator targets a specific Claude Code file type and runs its rules in parallel. Configure them via `.claudelintrc.json`.

## Featured Validators

<div class="validator-grid">

<a href="/validators/claude-md" class="validator-card">
  <div class="validator-card-title">CLAUDE.md</div>
  <p class="validator-card-desc">File size limits, <code>@import</code> resolution, path validation, and content structure for project memory files.</p>
  <div class="validator-card-footer">
    <span class="validator-card-tag"><RuleCount category="claude-md" /> rules</span>
    <span class="validator-card-tag">Imports</span>
  </div>
</a>

<a href="/validators/skills" class="validator-card">
  <div class="validator-card-title">Skills</div>
  <p class="validator-card-desc">SKILL.md frontmatter, naming, descriptions, dangerous-command detection, and shell script security.</p>
  <div class="validator-card-footer">
    <span class="validator-card-tag"><RuleCount category="skills" /> rules</span>
    <span class="validator-card-tag">Security</span>
  </div>
</a>

<a href="/validators/settings" class="validator-card">
  <div class="validator-card-title">Settings</div>
  <p class="validator-card-desc">Permission rules, environment variables, model names, and hook configuration in <code>settings.json</code>.</p>
  <div class="validator-card-footer">
    <span class="validator-card-tag"><RuleCount category="settings" /> rules</span>
    <span class="validator-card-tag">Permissions</span>
  </div>
</a>

<a href="/validators/hooks" class="validator-card">
  <div class="validator-card-title">Hooks</div>
  <p class="validator-card-desc">Hook event types, matcher patterns, and command script references in <code>hooks.json</code>.</p>
  <div class="validator-card-footer">
    <span class="validator-card-tag"><RuleCount category="hooks" /> rules</span>
    <span class="validator-card-tag">Events</span>
  </div>
</a>

<a href="/validators/mcp" class="validator-card">
  <div class="validator-card-title">MCP Servers</div>
  <p class="validator-card-desc">Transport types (stdio, SSE, HTTP, WebSocket), URLs, and environment variables in <code>.mcp.json</code>.</p>
  <div class="validator-card-footer">
    <span class="validator-card-tag"><RuleCount category="mcp" /> rules</span>
    <span class="validator-card-tag">Transports</span>
  </div>
</a>

<a href="/validators/plugin" class="validator-card">
  <div class="validator-card-title">Plugins</div>
  <p class="validator-card-desc">Plugin manifest structure, semantic versioning, and references to commands, agents, skills, and hooks.</p>
  <div class="validator-card-footer">
    <span class="validator-card-tag"><RuleCount category="plugin" /> rules</span>
    <span class="validator-card-tag">Manifest</span>
  </div>
</a>

</div>

Browse the sidebar for the full list of validators (Agents, LSP, Output Styles, Commands), or jump to the [Rules Reference](/rules/overview) for individual rule pages.

<style scoped>
.validator-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
  margin: 16px 0 32px;
}

.validator-card {
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

.validator-card:hover {
  border-color: var(--vp-c-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.validator-card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
}

.validator-card-desc {
  margin: 0 0 16px;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  flex-grow: 1;
}

.validator-card-desc code {
  font-size: 0.8125rem;
  padding: 1px 4px;
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
}

.validator-card-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
}

.validator-card-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.75rem;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}

.dark .validator-card-tag {
  background: rgba(255, 255, 255, 0.08);
}
</style>
