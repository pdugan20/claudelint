#!/usr/bin/env tsx
/**
 * Verify ModelNames constant against Claude Code CLI
 *
 * Source of truth: Claude Code CLI Task tool model parameter
 * Documentation reference: https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields
 *
 * This script:
 * 1. Queries Claude Code CLI for valid Task tool model values
 * 2. Parses the output
 * 3. Compares against our ModelNames constant
 * 4. Reports any drift (missing or extra models)
 *
 * Requirements:
 * - Claude Code CLI must be installed
 * - ANTHROPIC_API_KEY must be configured
 *
 * Note: ModelNames is used for agent and skill frontmatter only.
 * Settings.json accepts arbitrary model names and uses z.string().
 *
 * Usage: npm run verify:model-names
 */

import { execSync } from 'child_process';
import { VALID_MODELS } from '../../src/schemas/constants';
import { log } from '../util/logger';

const DOCS_URL = 'https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields';

/**
 * Supplemental model values that are valid but may not be returned by CLI query.
 * These are manually maintained and should be verified against official docs.
 *
 * Each entry should have a comment explaining why it's supplemental.
 */
const SUPPLEMENTAL_MODELS: string[] = [
  'inherit', // Valid in agent/skill frontmatter - means "use parent conversation's model"
];

interface VerificationResult {
  success: boolean;
  cliModels: string[];
  expectedModels: string[];
  ourModels: string[];
  missing: string[];
  extra: string[];
  timestamp: string;
}

/**
 * Query Claude Code CLI for valid model values for Task tool
 */
async function fetchModelsFromCLI(): Promise<string[]> {
  log.info('Querying Claude Code CLI for Task tool model parameter values...\n');

  try {
    // Query Claude for valid model values for the Task tool
    const output = execSync(
      'claude -p "What are the valid model values for the Task tool model parameter? List only the model aliases (like sonnet, opus, haiku, inherit), one per line, no descriptions" --output-format text',
      {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 30000,
      }
    );

    // Parse output: split by newlines, trim, filter empty
    const models = output
      .split('\n')
      .map(line => line.trim().toLowerCase())
      .filter(line => {
        // Filter out empty lines and common non-model text
        if (!line) return false;
        if (line.includes('model') && line.includes(':')) return false;
        if (line.includes('valid') || line.includes('values')) return false;
        if (line.includes('parameter')) return false;
        // Model names should be lowercase words
        if (!/^[a-z]+$/.test(line)) return false;
        return true;
      });

    if (models.length === 0) {
      throw new Error('No models found in CLI output. Claude may not have responded correctly.');
    }

    log.info(`Found ${models.length} model values from Claude CLI\n`);
    return models.sort();
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      log.bracket.error('Claude Code CLI not found');
      log.dim('   Install Claude Code from: https://code.claude.com/');
      process.exit(1);
    }

    if (error.message?.includes('ANTHROPIC_API_KEY')) {
      log.bracket.error('ANTHROPIC_API_KEY not configured');
      log.dim('   Set your API key to use Claude Code');
      process.exit(1);
    }

    log.bracket.error('Failed to query Claude CLI');
    log.dim(`   ${error.message}`);
    log.info('\nManual verification fallback:');
    log.dim(`   Visit: ${DOCS_URL}`);
    log.dim('   Review "Choose a model" section');
    log.dim('   Compare model values against src/schemas/constants.ts manually');
    process.exit(1);
  }
}

async function verifyModelNames(): Promise<VerificationResult> {
  const cliModels = await fetchModelsFromCLI();

  // Combine CLI models with supplemental models
  const expectedModels = Array.from(new Set([...cliModels, ...SUPPLEMENTAL_MODELS])).sort();
  const ourModels = [...VALID_MODELS].sort() as string[];

  const expectedModelsSet = new Set(expectedModels);
  const ourModelsSet = new Set(ourModels);

  const missing = expectedModels.filter(model => !ourModelsSet.has(model));
  const extra = ourModels.filter(model => !expectedModelsSet.has(model));

  return {
    success: missing.length === 0 && extra.length === 0,
    cliModels: cliModels.sort(),
    expectedModels,
    ourModels,
    missing,
    extra,
    timestamp: new Date().toISOString(),
  };
}

async function main() {
  try {
    const result = await verifyModelNames();

    log.section('ModelNames Verification');
    log.info(`Verified at: ${result.timestamp}`);
    log.info(`Claude CLI: ${result.cliModels.length} models`);
    log.info(`Supplemental: ${SUPPLEMENTAL_MODELS.length} models`);
    log.info(`Expected (CLI + Supplemental): ${result.expectedModels.length} models`);
    log.info(`Our constants: ${result.ourModels.length} models`);

    if (result.success) {
      log.pass('SUCCESS: ModelNames constant matches expected models');
      log.info('\nNote: ModelNames is for agent/skill frontmatter only.');
      log.info('Settings.json uses z.string() to accept arbitrary model names.');
      log.info(`\nDocumentation reference: ${DOCS_URL}`);
      process.exit(0);
    } else {
      log.fail('FAILURE: ModelNames constant is out of sync');

      if (result.missing.length > 0) {
        log.info('\nMissing from our constants (expected but not in code):');
        result.missing.forEach(model => log.info(`  - ${model}`));
      }

      if (result.extra.length > 0) {
        log.info('\nExtra in our constants (in code but not expected):');
        result.extra.forEach(model => log.info(`  - ${model}`));
      }

      log.info('\n[CLI] Claude CLI models:');
      result.cliModels.forEach(model => log.info(`  ${model}`));

      if (SUPPLEMENTAL_MODELS.length > 0) {
        log.info('\n[SUPPLEMENTAL] Supplemental models:');
        SUPPLEMENTAL_MODELS.forEach(model => log.info(`  ${model}`));
      }

      log.info('\n[EXPECTED] Expected models (CLI + Supplemental):');
      result.expectedModels.forEach(model => log.info(`  ${model}`));

      log.info('\n[CURRENT] Our models:');
      result.ourModels.forEach(model => log.info(`  ${model}`));

      log.info('\n[FIX] To fix:');
      log.info('  1. Review the drift above');
      log.info(`  2. Verify against docs: ${DOCS_URL}`);
      log.info('  3. Update src/schemas/constants.ts ModelNames enum');
      log.info('  4. Run tests: npm test');
      log.info('  5. Re-run: npm run verify:model-names');

      process.exit(1);
    }
  } catch (error) {
    log.error('Error verifying model names:');
    log.error(String(error));
    process.exit(1);
  }
}

main();
