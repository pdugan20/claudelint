/**
 * Generate Rule Documentation from Source Code Metadata
 *
 * Reads all registered rules and generates VitePress-compatible
 * markdown pages in website/rules/<category>/<rule-id>.md.
 *
 * For rules with `meta.docs` metadata, generates from the template.
 * For rules without metadata, copies existing docs from docs/rules/.
 *
 * Usage: npm run docs:generate
 *
 * @see scripts/generators/rule-page.ts - Page template generator
 * @see src/types/rule-metadata.ts - Documentation type definitions
 */

import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { log } from '../util/logger';
import { generateRulePage, getCategoryDir } from '../generators/rule-page';

// Import rule registration (side-effect: populates registry)
import '../../src/rules/index';
import { RuleRegistry } from '../../src/utils/rules/registry';

const WEBSITE_RULES_DIR = join(__dirname, '../../website/rules');
const DOCS_RULES_DIR = join(__dirname, '../../docs/rules');

/**
 * Generate rule documentation pages
 */
async function generateRuleDocs(): Promise<void> {
  log.section('Generating Rule Documentation');

  const rules = RuleRegistry.getAllRules();
  log.info(`Found ${rules.length} registered rules`);

  let generated = 0;
  let copied = 0;
  let skipped = 0;

  // Track categories we've seen for sidebar generation
  const categoryRules = new Map<string, { id: string; name: string }[]>();

  for (const rule of rules) {
    const meta = rule.meta;
    const categoryDir = getCategoryDir(meta.category);
    const outputDir = join(WEBSITE_RULES_DIR, categoryDir);
    const outputPath = join(outputDir, `${meta.id}.md`);

    // Ensure output directory exists
    await mkdir(outputDir, { recursive: true });

    // Track for sidebar
    if (!categoryRules.has(categoryDir)) {
      categoryRules.set(categoryDir, []);
    }
    categoryRules.get(categoryDir)!.push({ id: meta.id, name: meta.name });

    if (meta.docs) {
      // Generate from metadata
      const markdown = generateRulePage(meta);
      await writeFile(outputPath, markdown);
      generated++;
    } else {
      // Try to copy existing doc
      const existingPath = join(DOCS_RULES_DIR, categoryDir, `${meta.id}.md`);
      if (existsSync(existingPath)) {
        const content = await readFile(existingPath, 'utf-8');
        await writeFile(outputPath, content);
        copied++;
      } else {
        skipped++;
      }
    }
  }

  // Generate sidebar data file
  await generateSidebarData(categoryRules);

  // Generate rule stats data file for dynamic counts
  await generateRuleStats(categoryRules);

  log.blank();
  log.info(`Results:`);
  log.info(`  Generated from metadata: ${generated}`);
  log.info(`  Copied from existing docs: ${copied}`);
  if (skipped > 0) {
    log.warn(`  Skipped (no docs): ${skipped}`);
  }
  log.info(`  Total rule pages: ${generated + copied}`);
  log.blank();
  log.bracket.success('Rule documentation generated');
}

/**
 * Category display names for sidebar headers
 */
const CATEGORY_DISPLAY: Record<string, string> = {
  'claude-md': 'CLAUDE.md',
  skills: 'Skills',
  settings: 'Settings',
  hooks: 'Hooks',
  mcp: 'MCP',
  plugin: 'Plugin',
  commands: 'Commands',
  agents: 'Agents',
  'output-styles': 'Output Styles',
  lsp: 'LSP',
};

/**
 * Category sort order for sidebar
 */
const CATEGORY_ORDER: string[] = [
  'claude-md',
  'skills',
  'settings',
  'hooks',
  'mcp',
  'plugin',
  'agents',
  'lsp',
  'output-styles',
  'commands',
];

/**
 * Generate sidebar data JSON for VitePress config to consume
 */
async function generateSidebarData(
  categoryRules: Map<string, { id: string; name: string }[]>,
): Promise<void> {
  const sidebar: Array<{
    text: string;
    collapsed: boolean;
    items: Array<{ text: string; link: string }>;
  }> = [];

  // Overview item first
  sidebar.push({
    text: 'Rules Reference',
    collapsed: false,
    items: [{ text: 'Overview', link: '/rules/overview' }],
  });

  // Sort categories by defined order
  const sortedCategories = [...categoryRules.entries()].sort((a, b) => {
    const aIdx = CATEGORY_ORDER.indexOf(a[0]);
    const bIdx = CATEGORY_ORDER.indexOf(b[0]);
    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
  });

  for (const [categoryDir, rules] of sortedCategories) {
    const displayName = CATEGORY_DISPLAY[categoryDir] || categoryDir;
    // Sort rules alphabetically within category
    const sortedRules = [...rules].sort((a, b) => a.id.localeCompare(b.id));

    sidebar.push({
      text: displayName,
      collapsed: true,
      items: sortedRules.map((r) => ({
        text: r.id,
        link: `/rules/${categoryDir}/${r.id}`,
      })),
    });
  }

  const sidebarPath = join(WEBSITE_RULES_DIR, '_sidebar.json');
  await writeFile(sidebarPath, JSON.stringify(sidebar, null, 2) + '\n');
  log.info(`Generated sidebar data: ${sidebarPath}`);
}

/**
 * Generate rule stats JSON for dynamic counts in VitePress components
 */
async function generateRuleStats(
  categoryRules: Map<string, { id: string; name: string }[]>,
): Promise<void> {
  const dataDir = join(__dirname, '../../website/data');
  await mkdir(dataDir, { recursive: true });

  const categories: Record<string, { display: string; count: number }> = {};
  let total = 0;

  // Sort categories by defined order
  const sortedCategories = [...categoryRules.entries()].sort((a, b) => {
    const aIdx = CATEGORY_ORDER.indexOf(a[0]);
    const bIdx = CATEGORY_ORDER.indexOf(b[0]);
    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
  });

  for (const [categoryDir, rules] of sortedCategories) {
    const displayName = CATEGORY_DISPLAY[categoryDir] || categoryDir;
    categories[categoryDir] = {
      display: displayName,
      count: rules.length,
    };
    total += rules.length;
  }

  const stats = {
    total,
    categoryCount: sortedCategories.length,
    categories,
    generatedAt: new Date().toISOString(),
  };

  const statsPath = join(dataDir, 'rule-stats.json');
  await writeFile(statsPath, JSON.stringify(stats, null, 2) + '\n');
  log.info(`Generated rule stats: ${statsPath}`);
}

generateRuleDocs().catch((err) => {
  log.fail(`Generation failed: ${err.message}`);
  process.exit(1);
});
