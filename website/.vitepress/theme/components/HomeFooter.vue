<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-columns">
        <div class="footer-col">
          <h4 class="footer-heading">Documentation</h4>
          <ul class="footer-links">
            <li><a href="/guide/getting-started">Getting Started</a></li>
            <li><a href="/guide/configuration">Configuration</a></li>
            <li><a href="/guide/cli-reference">CLI Reference</a></li>
            <li><a href="/guide/auto-fix">Auto-fix</a></li>
            <li><a href="/guide/inline-disables">Inline Disables</a></li>
            <li><a href="/guide/troubleshooting">Troubleshooting</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4 class="footer-heading">Validators</h4>
          <ul class="footer-links">
            <li><a href="/validators/claude-md">CLAUDE.md</a></li>
            <li><a href="/validators/skills">Skills</a></li>
            <li><a href="/validators/settings">Settings</a></li>
            <li><a href="/validators/hooks">Hooks</a></li>
            <li><a href="/validators/mcp">MCP Servers</a></li>
            <li><a href="/validators/plugin">Plugins</a></li>
            <li><a href="/validators/agents">Agents</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4 class="footer-heading">Integrations</h4>
          <ul class="footer-links">
            <li><a href="/integrations/ci">CI/CD</a></li>
            <li><a href="/integrations/pre-commit">Claude Code Hooks</a></li>
            <li><a href="/integrations/npm-scripts">Npm Scripts</a></li>
            <li><a href="/integrations/claude-code-plugin">Claude Code Plugin</a></li>
            <li><a href="/integrations/monorepos">Monorepos</a></li>
            <li><a href="/integrations/sarif">SARIF</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4 class="footer-heading">Reference</h4>
          <ul class="footer-links">
            <li><a href="/rules/overview">Rules</a></li>
            <li><a href="/api/overview">API Overview</a></li>
            <li><a href="/api/claudelint-class">ClaudeLint Class</a></li>
            <li><a href="/api/types">Types</a></li>
            <li><a href="/api/formatters">Formatters</a></li>
            <li><a href="/development/custom-rules">Custom Rules</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4 class="footer-heading">Project</h4>
          <ul class="footer-links">
            <li>
              <a href="https://github.com/pdugan20/claudelint" target="_blank" rel="noopener"
                >GitHub</a
              >
            </li>
            <li>
              <a
                href="https://www.npmjs.com/package/claude-code-lint"
                target="_blank"
                rel="noopener"
                >npm</a
              >
            </li>
            <li>
              <a
                href="https://github.com/pdugan20/claudelint/releases"
                target="_blank"
                rel="noopener"
                >Releases</a
              >
            </li>
            <li>
              <a
                href="https://github.com/pdugan20/claudelint/blob/main/CHANGELOG.md"
                target="_blank"
                rel="noopener"
                >Changelog</a
              >
            </li>
            <li>
              <a
                href="https://github.com/pdugan20/claudelint/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener"
                >Contributing</a
              >
            </li>
            <li>
              <a
                href="https://github.com/pdugan20/claudelint/blob/main/LICENSE"
                target="_blank"
                rel="noopener"
                >MIT License</a
              >
            </li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span class="footer-copyright">&copy; {{ year }} Pat Dugan</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear();
</script>

<style scoped>
.site-footer {
  background: #1a1a19;
  border-top: 1px solid #2e2e2a;
  color: #a8a69d;
  padding: 36px 24px 24px;
}

.footer-inner {
  max-width: 1152px;
  margin: 0 auto;
}

.footer-columns {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.footer-heading {
  font-size: 0.75rem;
  font-weight: 400;
  color: #6e6c64;
  margin: 0 0 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.footer-links {
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer-links li {
  margin-bottom: 6px;
}

.footer-links a {
  font-size: 0.8125rem;
  color: #a8a69d;
  text-decoration: none;
  transition: color 0.15s;
  line-height: 1.5;
}

.footer-links a:hover {
  color: #e8e6dc;
}

.footer-bottom {
  border-top: 1px solid #2e2e2a;
  padding-top: 20px;
}

.footer-copyright {
  font-size: 0.75rem;
  color: #6e6c64;
}

@media (max-width: 768px) {
  .footer-columns {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px 16px;
  }
}

@media (max-width: 480px) {
  .footer-columns {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
