# Landing Page Specification

Design specification for the claudelint.dev marketing landing page.

## Why a Landing Page

Every major linting/tooling project has a marketing landing page at its domain root, separate from the documentation:

| Project | Landing Page | Docs Path |
|---|---|---|
| ESLint | eslint.org | eslint.org/docs/latest/ |
| Prettier | prettier.io | prettier.io/docs/ |
| Biome | biomejs.dev | biomejs.dev/guides/ |
| Oxc | oxc.rs | oxc.rs/docs/ |
| Stylelint | stylelint.io | stylelint.io/user-guide/ |

The landing page serves as the "front door" - it markets the tool to new users and directs them to docs. Docs are for users who have already decided to use the tool.

## Page Structure

VitePress supports this natively with `layout: home` frontmatter.

### Hero Section

```yaml
hero:
  name: claudelint
  text: The linter for Claude Code projects
  tagline: Validate CLAUDE.md, skills, hooks, MCP servers, plugins, and more
  image:
    src: /logo.svg
    alt: claudelint
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/pdugan20/claudelint
```

### Install Snippet

Prominently displayed quick-start:

```bash
npm install -g claude-code-lint
claudelint init
claudelint check-all
```

### Feature Grid (6 items)

Based on research of ESLint, Biome, and Oxc landing pages:

1. **117 Rules** - Comprehensive validation across 10 categories
2. **Auto-fix** - Automatically fix common issues with `--fix`
3. **Fast** - Parallel validation with smart caching (~2.4x speedup)
4. **Monorepo Support** - Config inheritance, workspace detection, 3-10x faster
5. **Multiple Outputs** - Stylish, JSON, compact, and SARIF formats
6. **Extensible** - Custom rules, programmatic API, Claude Code plugin

### Quick Links Section

Four prominent cards linking to key doc sections:

- Getting Started (for new users)
- Browse Rules (for exploring)
- Configuration (for setup)
- API Reference (for advanced users)

### Social Proof / Stats (Optional)

If available:

- npm download count
- GitHub stars
- Rule count (117)
- Category count (10)

### Integration Showcase

Visual display of supported integrations:

- npm / package.json
- Pre-commit hooks
- GitHub Actions
- Claude Code plugin
- Monorepo workspaces (pnpm, npm, Yarn)

### Footer

Standard VitePress footer:

- MIT License
- Copyright
- GitHub link
- npm link

## VitePress Implementation

File: `website/index.md`

```markdown
---
layout: home

hero:
  name: claudelint
  text: The linter for Claude Code projects
  tagline: Validate CLAUDE.md, skills, hooks, MCP servers, plugins, and more
  image:
    src: /logo.svg
    alt: claudelint
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/pdugan20/claudelint

features:
  - title: 117 Rules
    details: Comprehensive validation across 10 categories including skills, CLAUDE.md, hooks, MCP, plugins, agents, and more
  - title: Auto-fix
    details: Automatically fix common issues with the --fix flag. Supports fixing missing shebangs, versions, and more
  - title: Fast
    details: Parallel validation with smart caching delivers ~2.4x speedup. Typical projects validate in under 200ms
  - title: Monorepo Support
    details: Config inheritance with extends, workspace detection for pnpm/npm/Yarn, 3-10x faster for large repos
  - title: Multiple Outputs
    details: Stylish terminal output, JSON for CI, compact for logs, and SARIF for security tooling integration
  - title: Extensible
    details: Create custom rules, use the programmatic API, or integrate as a Claude Code plugin
---
```

## Design Notes

### What ESLint Does Well

- Clean hero with clear value proposition
- Corporate sponsor logos (social proof)
- Prominent "Find and fix problems" messaging
- Feature highlights are concise

### What Biome Does Well

- Performance comparison front and center (35x faster than Prettier)
- "Trusted by leading organizations" section
- Multi-language support highlighted
- Six benefit cards with clear icons

### What Oxc Does Well (Our Closest Comparable)

- Tool showcase with performance claims
- Clean VitePress layout
- Sponsorship tiers visible
- Clear navigation to docs

### Our Differentiators

- **Only linter for Claude Code** - unique positioning
- **117 rules across 10 categories** - comprehensive
- **SARIF output** - enterprise/CI-friendly
- **Monorepo support** - modern workflow
- **Watch mode** - developer experience

## Assets Needed

- [ ] Logo SVG (light and dark variants)
- [ ] Favicon (16x16, 32x32, 180x180)
- [ ] OG Image (1200x630) for social sharing
- [ ] Optional: Terminal screenshot showing colorized output
- [ ] Optional: Architecture diagram for "how it works" section
