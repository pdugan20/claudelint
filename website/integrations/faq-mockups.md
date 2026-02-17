---
description: Compare FaqList component variants — divider, card, and flat — to choose the right accordion style for your documentation pages.
---

# FAQ Style Mockups

<script setup>
const items = [
  { q: 'Can I use extends without workspaces?', a: 'Yes. Config inheritance works in any repository, not just monorepos.' },
  { q: 'Can I extend from npm packages?', a: 'Yes. Install the package and reference it by name in your config.' },
  { q: 'Do recursive extends work?', a: 'Yes. Configs can extend other configs that also use extends. Circular dependencies are detected and prevented.' },
  { q: 'Can I override inherited rules?', a: 'Yes. Rules in the child config always override rules from extended configs.' },
  { q: 'What if a package has no config?', a: 'claudelint searches up the directory tree for the nearest .claudelintrc.json file, just like ESLint.' },
  { q: 'Can I use --workspace without a monorepo?', a: 'No. The --workspace and --workspaces flags require a workspace configuration (pnpm-workspace.yaml or package.json workspaces).' },
  { q: 'How do ignore patterns merge?', a: 'Ignore patterns are concatenated and deduplicated. Both parent and child patterns apply.' },
  { q: 'Can I disable an inherited rule?', a: 'Yes. Set it to "off" in the child config.' },
]
</script>

Compare three variants of the `<FaqList>` component.

---

## Variant A: Divider

Clean bottom borders between items, no container.

<FaqList variant="divider" :items="items" />

---

## Variant B: Card

Items grouped in a single bordered container, open state gets a background.

<FaqList variant="card" :items="items" />

---

## Variant C: Flat

Minimal — no borders on items, open state uses an indent bar.

<FaqList variant="flat" :items="items" />
