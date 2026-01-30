#!/usr/bin/env ts-node
/**
 * Verification script to ensure all rule files have actual validation implementations.
 * Detects stub rules with empty or trivial validate() functions.
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

interface StubRule {
  file: string;
  category: string;
  reason: string;
}

function findRuleFiles(dir: string, _category: string = ''): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findRuleFiles(fullPath, entry));
    } else if (entry.endsWith('.ts') && !entry.endsWith('.test.ts') && entry !== 'index.ts' && entry !== 'rule-ids.ts') {
      files.push(fullPath);
    }
  }

  return files;
}

function analyzeRule(filePath: string): StubRule | null {
  const content = readFileSync(filePath, 'utf-8');
  const category = filePath.split('/rules/')[1]?.split('/')[0] || 'unknown';

  // Allow explicitly documented no-op rules (cross-reference validation)
  if (content.includes('// No-op:') && content.includes('Validation implemented in')) {
    return null;
  }

  // Check if validate function exists
  if (!content.includes('validate:')) {
    return { file: filePath, category, reason: 'No validate function found' };
  }

  // Extract validate function body
  const validateMatch = content.match(/validate:\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/s);

  if (!validateMatch) {
    return { file: filePath, category, reason: 'Could not parse validate function' };
  }

  const validateBody = validateMatch[1].trim();

  // Check for empty or trivial implementations
  if (validateBody.length === 0) {
    return { file: filePath, category, reason: 'Empty validate function' };
  }

  if (validateBody === 'return;' || validateBody === '// TODO: Implement validation') {
    return { file: filePath, category, reason: 'Stub implementation detected' };
  }

  // Check for validate functions with only comments
  const withoutComments = validateBody.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  if (withoutComments.length < 10) {
    return { file: filePath, category, reason: 'Validate function has minimal logic (< 10 chars)' };
  }

  // Check if validate function has at least one context.report() call
  if (!content.includes('context.report(')) {
    return { file: filePath, category, reason: 'No context.report() calls found' };
  }

  return null;
}

function main() {
  const rulesDir = join(__dirname, '../..', 'src', 'rules');
  const ruleFiles = findRuleFiles(rulesDir);
  const stubRules: StubRule[] = [];

  console.log(`Analyzing ${ruleFiles.length} rule files...\n`);

  for (const ruleFile of ruleFiles) {
    const stub = analyzeRule(ruleFile);
    if (stub) {
      stubRules.push(stub);
    }
  }

  if (stubRules.length === 0) {
    console.log('✓ All rules have implementations!\n');
    process.exit(0);
  }

  console.log(`✗ Found ${stubRules.length} stub or incomplete rules:\n`);

  const byCategory: Record<string, StubRule[]> = {};
  for (const stub of stubRules) {
    if (!byCategory[stub.category]) {
      byCategory[stub.category] = [];
    }
    byCategory[stub.category].push(stub);
  }

  for (const [category, rules] of Object.entries(byCategory)) {
    console.log(`  ${category.toUpperCase()}:`);
    for (const rule of rules) {
      const fileName = rule.file.split('/').pop();
      console.log(`    - ${fileName}: ${rule.reason}`);
    }
    console.log();
  }

  process.exit(1);
}

main();
