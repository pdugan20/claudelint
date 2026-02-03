#!/usr/bin/env ts-node

/**
 * Schema Sync Verification Script
 *
 * Verifies that all claudelint schemas stay synchronized with official
 * Claude Code specifications by generating JSON Schemas from Zod and
 * comparing them against manual reference schemas created from official docs.
 *
 * Phase 2.1 Complete: All 8 schemas have manual JSON Schema references
 * Phase 2.2 In Progress: Automated comparison tool implemented
 *
 * Usage:
 *   npm run check:schema-sync
 *   ts-node scripts/check/schema-sync.ts
 */

import { execSync } from 'child_process';
import chalk from 'chalk';

// Schema registry with verification status (Phase 2.1 completion)
interface SchemaInfo {
  name: string;
  officialSource: string;
  lastVerified: string;
  driftStatus: 'clean' | 'fixed' | 'n/a';
  notes?: string;
}

const SCHEMA_REGISTRY: SchemaInfo[] = [
  {
    name: 'PluginManifestSchema',
    officialSource:
      'https://code.claude.com/docs/en/plugins-reference#plugin-manifest-schema',
    lastVerified: '2026-02-03',
    driftStatus: 'clean',
    notes: 'No drift detected in Phase 2.1',
  },
  {
    name: 'SkillFrontmatterSchema',
    officialSource: 'https://code.claude.com/docs/en/skills#frontmatter-reference',
    lastVerified: '2026-02-03',
    driftStatus: 'fixed',
    notes: 'Fixed in Phase 2.1: added 4 missing fields',
  },
  {
    name: 'HooksConfigSchema',
    officialSource: 'https://code.claude.com/docs/en/hooks',
    lastVerified: '2026-02-03',
    driftStatus: 'fixed',
    notes: 'Fixed in Phase 2.1: added timeout and async fields',
  },
  {
    name: 'MCPConfigSchema',
    officialSource: 'https://code.claude.com/docs/en/mcp',
    lastVerified: '2026-02-03',
    driftStatus: 'fixed',
    notes: 'Fixed in Phase 2.1: CRITICAL - complete structure rewrite + 13 rule fixes',
  },
  {
    name: 'LSPConfigSchema',
    officialSource: 'https://code.claude.com/docs/en/plugins-reference#lsp-servers',
    lastVerified: '2026-02-03',
    driftStatus: 'fixed',
    notes:
      'Fixed in Phase 2.1: CRITICAL - structure rewrite + 7 missing fields + 8 rule fixes',
  },
  {
    name: 'AgentFrontmatterSchema',
    officialSource: 'https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields',
    lastVerified: '2026-02-03',
    driftStatus: 'fixed',
    notes: 'Fixed in Phase 2.1: added permissionMode, removed events field + 1 rule deleted',
  },
  {
    name: 'OutputStyleFrontmatterSchema',
    officialSource: 'https://code.claude.com/docs/en/output-styles#frontmatter',
    lastVerified: '2026-02-03',
    driftStatus: 'fixed',
    notes: 'Fixed in Phase 2.1: MAJOR - removed all invalid validations + 4 rules deleted',
  },
  {
    name: 'RulesFrontmatterSchema',
    officialSource: 'https://code.claude.com/docs/en/memory#path-specific-rules',
    lastVerified: '2026-02-03',
    driftStatus: 'clean',
    notes: 'No drift detected in Phase 2.1 (renamed from ClaudeMdFrontmatterSchema)',
  },
  {
    name: 'SettingsSchema',
    officialSource: 'https://json.schemastore.org/claude-code-settings.json',
    lastVerified: '2026-02-01',
    driftStatus: 'n/a',
    notes: 'Not included in Phase 2.1 dual-schema verification',
  },
];

function printSchemaInventory(): void {
  console.log(chalk.bold('\nSchema Inventory (Phase 2.1 Results)'));
  console.log(chalk.gray(`Total schemas verified: ${SCHEMA_REGISTRY.filter((s) => s.driftStatus !== 'n/a').length} / ${SCHEMA_REGISTRY.length}\n`));

  console.log(chalk.bold('Status Summary:'));
  const clean = SCHEMA_REGISTRY.filter((s) => s.driftStatus === 'clean').length;
  const fixed = SCHEMA_REGISTRY.filter((s) => s.driftStatus === 'fixed').length;
  console.log(chalk.green(`  ✓ Clean (no drift): ${clean}`));
  console.log(chalk.blue(`  ✓ Fixed (drift resolved): ${fixed}`));
  console.log('');

  console.log(chalk.bold('Schemas:'));
  for (const schema of SCHEMA_REGISTRY) {
    let statusIcon = '';
    let statusColor = chalk.gray;

    if (schema.driftStatus === 'clean') {
      statusIcon = '✓';
      statusColor = chalk.green;
    } else if (schema.driftStatus === 'fixed') {
      statusIcon = '✓';
      statusColor = chalk.blue;
    } else {
      statusIcon = '-';
    }

    console.log(
      statusColor(`  ${statusIcon} ${schema.name}`) + chalk.gray(` (verified: ${schema.lastVerified})`)
    );
    if (schema.notes) {
      console.log(chalk.gray(`    ${schema.notes}`));
    }
  }
  console.log('');
}

async function runSchemaGeneration(): Promise<boolean> {
  console.log(chalk.bold('\nStep 1: Generate JSON Schemas from Zod'));
  console.log(chalk.gray('Running: npm run generate:json-schemas\n'));

  try {
    execSync('npm run generate:json-schemas', { stdio: 'inherit' });
    console.log(chalk.green('\n✓ Schema generation completed\n'));
    return true;
  } catch (error) {
    console.error(chalk.red('\n✗ Schema generation failed\n'));
    return false;
  }
}

async function runSchemaComparison(): Promise<boolean> {
  console.log(chalk.bold('Step 2: Compare Manual Reference vs Generated Schemas'));
  console.log(chalk.gray('Running: npm run verify:schemas\n'));

  try {
    execSync('npm run verify:schemas', { stdio: 'inherit' });
    return true;
  } catch (error) {
    // verify:schemas exits with code 1 if drift detected
    return false;
  }
}

async function main() {
  console.log(chalk.bold('\n=== Schema Sync Verification (Phase 2.2) ===\n'));
  console.log('Automated verification using dual-schema system:\n');
  console.log(chalk.gray('1. Manual JSON Schema references (source of truth from docs)'));
  console.log(chalk.gray('2. Generated JSON Schemas (from Zod implementation)'));
  console.log(chalk.gray('3. Automated comparison (detects drift)\n'));

  printSchemaInventory();

  const generationSuccess = await runSchemaGeneration();
  if (!generationSuccess) {
    console.log(chalk.red('\nSchema generation failed. Cannot proceed with comparison.\n'));
    process.exit(1);
  }

  const comparisonSuccess = await runSchemaComparison();

  console.log(chalk.bold('\n=== Verification Results ===\n'));

  if (comparisonSuccess) {
    console.log(chalk.green('✓ All schemas match! No drift detected.\n'));
    console.log(chalk.gray('All 8 Zod schemas match their manual JSON Schema references.'));
    console.log(chalk.gray('Our validation logic matches official Claude Code specifications.\n'));
    console.log(chalk.gray('Next steps:'));
    console.log(chalk.gray('1. Run this check regularly (CI runs on every PR)'));
    console.log(chalk.gray('2. Update schemas when Claude Code releases new versions'));
    console.log(chalk.gray('3. Re-run Phase 2.1 verification if drift detected\n'));
    process.exit(0);
  } else {
    console.log(chalk.red('✗ Schema drift detected!\n'));
    console.log(chalk.yellow('Action required:'));
    console.log(chalk.gray('1. Review the comparison output above'));
    console.log(chalk.gray('2. Update Zod schemas in src/validators/schemas.ts or src/schemas/'));
    console.log(chalk.gray('3. Run npm run check:schema-sync again'));
    console.log(chalk.gray('4. If manual reference schemas are wrong, update schemas/*.schema.json\n'));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(chalk.red('Error:'), error);
  process.exit(1);
});
