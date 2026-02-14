/**
 * Generate Preset Configuration Files
 *
 * Reads the rule registry and generates preset JSON files:
 * - presets/recommended.json — rules with docs.recommended === true
 * - presets/all.json — all registered rules at source severity
 *
 * These files are bundled in the npm package and resolved
 * by the config loader when users write:
 *   { "extends": "claudelint:recommended" }
 *
 * Usage: npm run generate:presets
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { log } from '../util/logger';

// Import rule registration (side-effect: populates registry)
import '../../src/rules/index';
import { RuleRegistry } from '../../src/utils/rules/registry';

const PRESETS_DIR = join(__dirname, '../../presets');

/**
 * Generate preset JSON files from rule registry
 */
async function generatePresets(): Promise<void> {
  log.section('Generating Preset Configurations');

  // Sort rules alphabetically for deterministic output
  const rules = RuleRegistry.getAllRules().sort((a, b) => a.meta.id.localeCompare(b.meta.id));
  log.info(`Found ${rules.length} registered rules`);

  // Ensure output directory exists
  await mkdir(PRESETS_DIR, { recursive: true });

  // Generate recommended preset
  const recommendedRules: Record<string, string> = {};
  let recommendedCount = 0;

  for (const rule of rules) {
    if (rule.meta.docs?.recommended) {
      recommendedRules[rule.meta.id] = rule.meta.severity;
      recommendedCount++;
    }
  }

  const recommendedPreset = { rules: recommendedRules };
  const recommendedPath = join(PRESETS_DIR, 'recommended.json');
  await writeFile(recommendedPath, JSON.stringify(recommendedPreset, null, 2) + '\n');
  log.info(`  recommended.json: ${recommendedCount} rules`);

  // Generate all preset
  const allRules: Record<string, string> = {};

  for (const rule of rules) {
    allRules[rule.meta.id] = rule.meta.severity;
  }

  const allPreset = { rules: allRules };
  const allPath = join(PRESETS_DIR, 'all.json');
  await writeFile(allPath, JSON.stringify(allPreset, null, 2) + '\n');
  log.info(`  all.json: ${rules.length} rules`);

  log.blank();
  log.bracket.success('Preset generation complete');
}

generatePresets().catch((err) => {
  log.fail(`Preset generation failed: ${err.message}`);
  process.exit(1);
});
