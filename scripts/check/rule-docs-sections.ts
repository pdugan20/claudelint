#!/usr/bin/env ts-node
/**
 * Rule Documentation Sections Check
 *
 * Validates that all rules define required documentation sections.
 * Currently checks that every rule has `relatedRules` defined in meta.docs.
 *
 * Exits with error if any rules are missing required sections.
 */

import { log } from '../util/logger';

// Import the auto-registration to populate the registry
import '../../src/rules/index';
import { RuleRegistry } from '../../src/utils/rules/registry';

interface Violation {
  ruleId: string;
  category: string;
  missingSection: string;
}

async function main(): Promise<void> {
  log.info('Checking rule documentation sections...');
  log.blank();

  const violations: Violation[] = [];
  const allRules = RuleRegistry.getAllRules();

  for (const rule of allRules) {
    const { meta } = rule;
    const docs = meta.docs;

    if (!docs) {
      violations.push({
        ruleId: meta.id,
        category: meta.category,
        missingSection: 'docs (entire meta.docs object)',
      });
      continue;
    }

    // Check relatedRules is defined and non-empty
    if (!docs.relatedRules || docs.relatedRules.length === 0) {
      violations.push({
        ruleId: meta.id,
        category: meta.category,
        missingSection: 'relatedRules',
      });
    }
  }

  if (violations.length > 0) {
    log.bracket.fail(`Found ${violations.length} rule(s) missing documentation sections:`);
    log.blank();

    // Group by missing section
    const bySection = new Map<string, Violation[]>();
    for (const v of violations) {
      const existing = bySection.get(v.missingSection) || [];
      existing.push(v);
      bySection.set(v.missingSection, existing);
    }

    for (const [section, sectionViolations] of bySection) {
      log.info(`  Missing "${section}" (${sectionViolations.length} rules):`);
      for (const v of sectionViolations) {
        log.dim(`    - ${v.ruleId} (${v.category})`);
      }
      log.blank();
    }

    log.info('Add the missing sections to each rule\'s meta.docs in src/rules/.');
    process.exit(1);
  } else {
    log.bracket.success(`All ${allRules.length} rules have required documentation sections`);
    process.exit(0);
  }
}

main().catch((error) => {
  log.error(`Error: ${String(error)}`);
  process.exit(1);
});
