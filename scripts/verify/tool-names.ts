#!/usr/bin/env tsx
/**
 * Verify ToolNames constant against Claude Code CLI
 *
 * Source of truth: Claude Code CLI (queries the actual installed version)
 * Documentation reference: https://code.claude.com/docs/en/settings#tools-available-to-claude
 *
 * This script:
 * 1. Queries Claude Code CLI to list all available tools
 * 2. Parses the output
 * 3. Compares against our ToolNames constant
 * 4. Reports any drift (missing or extra tools)
 *
 * Requirements:
 * - Claude Code CLI must be installed
 * - ANTHROPIC_API_KEY must be configured
 *
 * Usage: npm run verify:tool-names
 */

import { execSync } from 'child_process';
import { VALID_TOOLS } from '../../src/schemas/constants';
import { log } from '../util/logger';

const DOCS_URL = 'https://code.claude.com/docs/en/settings#tools-available-to-claude';

/**
 * Supplemental tools that are valid but may not be returned by CLI query.
 * These are manually maintained and should be verified against official docs.
 *
 * Each entry should have a comment explaining why it's supplemental.
 */
const SUPPLEMENTAL_TOOLS: string[] = [
  // Add tools here that are valid but CLI doesn't return them
  // Example: 'LSP', // Valid in docs but not always in CLI output
];

interface VerificationResult {
  success: boolean;
  cliTools: string[];
  expectedTools: string[];
  ourTools: string[];
  missing: string[];
  extra: string[];
  timestamp: string;
}

/**
 * Query Claude Code CLI for list of available tools
 */
async function fetchToolsFromCLI(): Promise<string[]> {
  log.info('Querying Claude Code CLI for available tools...');
  log.blank();

  try {
    // Query Claude to list its tools
    const output = execSync(
      'claude -p "List all your available tool names, one per line, no descriptions, no explanations, just the tool names" --output-format text',
      {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 30000,
      }
    );

    // Parse output: split by newlines, trim, filter empty
    const tools = output
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        // Filter out empty lines and common non-tool text
        if (!line) return false;
        if (line.toLowerCase().includes('here are') ||
            line.toLowerCase().includes('tools:') ||
            line.toLowerCase().includes('available')) return false;
        // Tool names should be PascalCase
        if (!/^[A-Z][a-zA-Z]+$/.test(line)) return false;
        return true;
      });

    if (tools.length === 0) {
      throw new Error('No tools found in CLI output. Claude may not have responded correctly.');
    }

    log.info(`Found ${tools.length} tools from Claude CLI`);
    log.blank();
    return tools.sort();
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      log.bracket.error('Claude Code CLI not found');
      log.dim('Install Claude Code from: https://code.claude.com/');
      process.exit(1);
    }

    if (error.message?.includes('ANTHROPIC_API_KEY')) {
      log.bracket.error('ANTHROPIC_API_KEY not configured');
      log.dim('Set your API key to use Claude Code');
      process.exit(1);
    }

    log.bracket.error('Failed to query Claude CLI');
    log.dim(error.message);
    log.blank();
    log.info('Manual verification fallback:');
    log.dim(`Visit: ${DOCS_URL}`);
    log.dim('Compare tool names against src/schemas/constants.ts manually');
    process.exit(1);
  }
}

async function verifyToolNames(): Promise<VerificationResult> {
  const cliTools = await fetchToolsFromCLI();

  // Combine CLI tools with supplemental tools
  const expectedTools = Array.from(new Set([...cliTools, ...SUPPLEMENTAL_TOOLS])).sort();
  const ourTools = [...VALID_TOOLS].sort() as string[];

  const expectedToolsSet = new Set(expectedTools);
  const ourToolsSet = new Set(ourTools);

  const missing = expectedTools.filter(tool => !ourToolsSet.has(tool));
  const extra = ourTools.filter(tool => !expectedToolsSet.has(tool));

  return {
    success: missing.length === 0 && extra.length === 0,
    cliTools: cliTools.sort(),
    expectedTools,
    ourTools,
    missing,
    extra,
    timestamp: new Date().toISOString(),
  };
}

async function main() {
  try {
    const result = await verifyToolNames();

    log.section('ToolNames Verification');
    log.info(`Verified at: ${result.timestamp}`);
    log.info(`Claude CLI: ${result.cliTools.length} tools`);
    log.info(`Supplemental: ${SUPPLEMENTAL_TOOLS.length} tools`);
    log.info(`Expected (CLI + Supplemental): ${result.expectedTools.length} tools`);
    log.info(`Our constants: ${result.ourTools.length} tools`);

    if (result.success) {
      log.pass('SUCCESS: ToolNames constant matches expected tools');
      log.blank();
      log.info(`Documentation reference: ${DOCS_URL}`);
      process.exit(0);
    } else {
      log.fail('FAILURE: ToolNames constant is out of sync');

      if (result.missing.length > 0) {
        log.blank();
        log.info('Missing from our constants (expected but not in code):');
        result.missing.forEach(tool => log.dim(`- ${tool}`));
      }

      if (result.extra.length > 0) {
        log.blank();
        log.info('Extra in our constants (in code but not expected):');
        result.extra.forEach(tool => log.dim(`- ${tool}`));
      }

      log.blank();
      log.info('[CLI] Claude CLI tools:');
      result.cliTools.forEach(tool => log.dim(tool));

      if (SUPPLEMENTAL_TOOLS.length > 0) {
        log.blank();
        log.info('[SUPPLEMENTAL] Supplemental tools:');
        SUPPLEMENTAL_TOOLS.forEach(tool => log.dim(tool));
      }

      log.blank();
      log.info('[EXPECTED] Expected tools (CLI + Supplemental):');
      result.expectedTools.forEach(tool => log.dim(tool));

      log.blank();
      log.info('[CURRENT] Our tools:');
      result.ourTools.forEach(tool => log.dim(tool));

      log.blank();
      log.info('[FIX] To fix:');
      log.dim('1. Review the drift above');
      log.dim(`2. Verify against docs: ${DOCS_URL}`);
      log.dim('3. Update src/schemas/constants.ts ToolNames enum');
      log.dim('4. Run tests: npm test');
      log.dim('5. Re-run: npm run verify:tool-names');

      process.exit(1);
    }
  } catch (error) {
    log.error('Error verifying tool names:');
    log.error(String(error));
    process.exit(1);
  }
}

main();
