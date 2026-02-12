# Preset System Project

**Status**: Planned
**Target Release**: 0.3.0
**Last Updated**: 2026-02-11

---

## Background

claudelint currently enables all 120 rules at their source-defined severity with no way for users to opt into a curated subset. Every new rule ships "on" for everyone, which creates two problems:

1. **Noise for new users.** A fresh `claudelint check-all` can surface dozens of warnings on a healthy project. There's no distinction between "this is almost certainly wrong" and "this is a style preference."
2. **Breaking changes on upgrade.** Adding a new `error`-severity rule is effectively a breaking change for any CI pipeline that gates on zero errors. We have no mechanism to add rules without immediately affecting all users.

The `recommended` field already exists in rule metadata (`docs.recommended`) on roughly 20 rules, but it has zero runtime behavior — no preset consumes it, no CLI flag references it.

### Industry Context

We evaluated preset systems across ESLint, Biome, markdownlint, Oxlint, stylelint, and Clippy. The **Biome model** is the strongest fit for claudelint:

| Tool | Default | Recommended preset | Opt-in model |
|------|---------|-------------------|--------------|
| ESLint (flat) | Nothing on | `eslint/recommended` via extends | User must explicitly extend |
| **Biome** | **Everything on** | **`biome:recommended` = curated subset** | **Rules on by default, preset to filter** |
| markdownlint | Everything on | No preset concept | Disable what you don't want |
| Oxlint | Categories on/off | Per-category toggles | Category-based |

claudelint already behaves like Biome (everything on). We just need the preset layer to give users a curated subset.

---

## Goals

1. Ship two built-in presets: `claudelint:recommended` and `claudelint:all`
2. Update the init wizard to offer preset selection
3. Mark every rule as recommended or not, with clear criteria
4. Document presets for users and rule authors
5. Keep backward compatibility: no config = all rules (current behavior)

## Non-Goals

- Third-party/shareable preset packages (future work)
- Category-based presets like `claudelint:skills-only` (future work)
- Auto-migration tool (not needed — current behavior is unchanged)

---

## Design Summary

See [design.md](./design.md) for full technical design.

**Key decisions:**

- **No config = all rules** (backward compatible, matches current behavior)
- **`claudelint:recommended`** = curated subset (~60-80 rules) focused on correctness and security, with tuned severities
- **`claudelint:all`** = explicit "everything on" (equivalent to no config, but declarative)
- Presets are resolved by the existing `extends` infrastructure — no new resolution mechanism needed
- The `recommended` field moves from `docs.recommended` to top-level `meta.recommended` on `RuleMetadata`

---

## File Summary

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | This file — project overview |
| [tracker.md](./tracker.md) | Task tracker with phases and checkboxes |
| [design.md](./design.md) | Technical design and architecture |
| [rule-audit.md](./rule-audit.md) | Criteria and per-rule recommended/not-recommended decisions |

---

## Related Documents

- [Configuration docs](../../configuration.md) — current extends behavior
- [Roadmap](../roadmap.md) — aggregated project tracker
- [Custom rules docs](../../custom-rules.md) — third-party rule loading
