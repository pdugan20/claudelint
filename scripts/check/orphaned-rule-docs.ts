#!/usr/bin/env ts-node
/**
 * Orphaned Rule Documentation Checker
 *
 * Ensures every .md file in website/rules/<category>/ has a corresponding
 * rule ID in src/rules/rule-ids.ts. Catches stale pages left behind when
 * rules are renamed or deleted.
 *
 * Usage: npm run check:orphaned-rule-docs
 */

import * as fs from 'fs';
import * as path from 'path';
import { ALL_RULE_IDS } from '../../src/rules/rule-ids';
import { log } from '../util/logger';

const rootDir = path.join(__dirname, '../..');
const websiteRulesDir = path.join(rootDir, 'website', 'rules');

// Files/dirs in website/rules/ that are NOT rule documentation
const EXCLUDED_FILES = new Set(['overview.md', '_sidebar.json']);

/**
 * Scan website/rules/<category>/*.md and return rule IDs found
 */
function findWebsiteRuleDocs(): Map<string, string> {
  const docs = new Map<string, string>();

  if (!fs.existsSync(websiteRulesDir)) {
    return docs;
  }

  const categories = fs
    .readdirSync(websiteRulesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const category of categories) {
    const categoryDir = path.join(websiteRulesDir, category);
    const files = fs.readdirSync(categoryDir).filter((f) => f.endsWith('.md'));

    for (const file of files) {
      if (EXCLUDED_FILES.has(file)) continue;
      const ruleId = file.replace('.md', '');
      docs.set(ruleId, path.join('website', 'rules', category, file));
    }
  }

  return docs;
}

function main(): void {
  log.info('Checking for orphaned rule documentation...');
  log.blank();

  const ruleDocs = findWebsiteRuleDocs();
  const ruleIdSet = new Set<string>(ALL_RULE_IDS as readonly string[]);
  const orphaned: Array<{ ruleId: string; path: string }> = [];

  for (const [ruleId, docPath] of ruleDocs) {
    if (!ruleIdSet.has(ruleId)) {
      orphaned.push({ ruleId, path: docPath });
    }
  }

  if (orphaned.length === 0) {
    log.bracket.success(
      `No orphaned rule docs (${ruleDocs.size} docs match ${ruleIdSet.size} rules)`
    );
    process.exit(0);
  }

  log.bracket.fail(`Found ${orphaned.length} orphaned rule doc(s):`);
  log.blank();
  for (const { ruleId, path: docPath } of orphaned) {
    log.info(`  ${docPath}`);
    log.dim(`    Rule ID "${ruleId}" not found in rule-ids.ts`);
  }
  log.blank();
  log.info(
    'Delete orphaned files or regenerate docs with: npm run docs:generate'
  );
  process.exit(1);
}

main();
