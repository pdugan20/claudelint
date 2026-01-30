#!/usr/bin/env ts-node
/**
 * Consistency Validator
 *
 * Validates consistency between code and documentation:
 * 1. Severity in code (reportError/reportWarning) matches docs metadata
 * 2. Rule doc filename matches rule ID exactly
 * 3. Validator name in metadata matches actual validator
 */

import { readFile, readdir, stat } from 'fs/promises';
import { join, basename, dirname, relative } from 'path';
import { existsSync } from 'fs';

interface Violation {
  file: string;
  line?: number;
  issue: string;
  suggestion?: string;
}

const violations: Violation[] = [];
const warnings: Violation[] = [];
const projectRoot = join(__dirname, '../..');

// Track rule ID usage in code
const ruleIdSeverity = new Map<string, { severity: 'error' | 'warning'; file: string; line: number }[]>();

// Track rule documentation
const ruleDocs = new Map<
  string,
  {
    file: string;
    severity?: string;
    validator?: string;
  }
>();

/**
 * Extract rule IDs and their severity from validator source files
 */
async function extractRuleUsage(filePath: string): Promise<void> {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const relativePath = relative(projectRoot, filePath);

  // Match reportError and reportWarning calls
  const errorPattern = /\.reportError\([^)]*,\s*['"`]([a-z-]+)['"`]\s*\)/;
  const warningPattern = /\.reportWarning\([^)]*,\s*['"`]([a-z-]+)['"`]\s*\)/;

  // Track if we're inside a comment
  let inComment = false;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Check for comment start/end
    if (trimmed.includes('/*')) inComment = true;
    if (trimmed.includes('*/')) {
      inComment = false;
      return;
    }

    // Skip lines inside comments or single-line comments
    if (inComment || trimmed.startsWith('//') || trimmed.startsWith('*')) {
      return;
    }

    // Check for reportError
    const errorMatch = line.match(errorPattern);
    if (errorMatch) {
      const ruleId = errorMatch[1];
      if (!ruleIdSeverity.has(ruleId)) {
        ruleIdSeverity.set(ruleId, []);
      }
      ruleIdSeverity.get(ruleId)!.push({
        severity: 'error',
        file: relativePath,
        line: index + 1,
      });
    }

    // Check for reportWarning
    const warningMatch = line.match(warningPattern);
    if (warningMatch) {
      const ruleId = warningMatch[1];
      if (!ruleIdSeverity.has(ruleId)) {
        ruleIdSeverity.set(ruleId, []);
      }
      ruleIdSeverity.get(ruleId)!.push({
        severity: 'warning',
        file: relativePath,
        line: index + 1,
      });
    }
  });
}

/**
 * Scan all validators for rule usage
 */
async function scanValidators(): Promise<void> {
  const validatorsDir = join(projectRoot, 'src', 'validators');

  if (!existsSync(validatorsDir)) {
    throw new Error('src/validators directory not found');
  }

  const entries = await readdir(validatorsDir);

  for (const entry of entries) {
    const fullPath = join(validatorsDir, entry);
    const stats = await stat(fullPath);

    if (stats.isFile() && entry.endsWith('.ts')) {
      await extractRuleUsage(fullPath);
    }
  }
}

/**
 * Parse metadata from documentation file
 */
async function parseDocMetadata(filePath: string): Promise<{ severity?: string; validator?: string }> {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');

  const metadata: { severity?: string; validator?: string } = {};
  let inMetadataSection = false;

  for (const line of lines) {
    if (line.startsWith('## Metadata')) {
      inMetadataSection = true;
      continue;
    }

    if (inMetadataSection) {
      // Stop at next H2 section
      if (line.startsWith('## ') && !line.startsWith('## Metadata')) {
        break;
      }

      // Extract severity
      const severityMatch = line.match(/- \*\*Severity\*\*:\s*(\w+)/);
      if (severityMatch) {
        metadata.severity = severityMatch[1];
      }

      // Extract validator
      const validatorMatch = line.match(/- \*\*Validator\*\*:\s*(.+)/);
      if (validatorMatch) {
        metadata.validator = validatorMatch[1].trim();
      }
    }
  }

  return metadata;
}

/**
 * Find all rule documentation files and extract metadata
 */
async function findRuleDocs(): Promise<void> {
  const rulesDir = join(projectRoot, 'docs', 'rules');

  if (!existsSync(rulesDir)) {
    return;
  }

  async function scanDirectory(dir: string): Promise<void> {
    const entries = await readdir(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        await scanDirectory(fullPath);
      } else if (entry.endsWith('.md') && entry !== 'index.md' && entry !== 'TEMPLATE.md') {
        const ruleId = entry.replace('.md', '');
        const metadata = await parseDocMetadata(fullPath);
        ruleDocs.set(ruleId, {
          file: relative(projectRoot, fullPath),
          ...metadata,
        });
      }
    }
  }

  await scanDirectory(rulesDir);
}

/**
 * Map validator names to their canonical forms
 */
const VALIDATOR_NAME_MAP: Record<string, string> = {
  'claude-md': 'CLAUDE.md',
  skills: 'Skills',
  agents: 'Agents',
  settings: 'Settings',
  hooks: 'Hooks',
  mcp: 'MCP',
  plugin: 'Plugin',
  commands: 'Commands',
  lsp: 'LSP',
  'output-styles': 'Output Styles',
};

/**
 * Get canonical validator name from directory path
 */
function getValidatorFromPath(filePath: string): string {
  // Extract validator directory name from path
  const parts = filePath.split('/');
  const rulesIndex = parts.indexOf('rules');

  if (rulesIndex >= 0 && rulesIndex < parts.length - 1) {
    const validatorDir = parts[rulesIndex + 1];
    return VALIDATOR_NAME_MAP[validatorDir] || validatorDir;
  }

  return 'Unknown';
}

/**
 * Check severity consistency
 */
function checkSeverityConsistency(): void {
  for (const [ruleId, usage] of ruleIdSeverity) {
    const doc = ruleDocs.get(ruleId);

    if (!doc) {
      // No documentation - warning already reported by check-rule-docs
      continue;
    }

    if (!doc.severity) {
      // No severity in docs - warning already reported by check-rule-docs
      continue;
    }

    // Get the severity from code (should be consistent across all uses)
    const codeSeverities = new Set(usage.map((u) => u.severity));

    if (codeSeverities.size > 1) {
      // Inconsistent severity in code
      violations.push({
        file: usage[0].file,
        line: usage[0].line,
        issue: `Inconsistent severity for rule "${ruleId}" in code (used as both error and warning)`,
      });
      usage.slice(1).forEach((u) => {
        violations.push({
          file: u.file,
          line: u.line,
          issue: `  Also used here as ${u.severity}`,
        });
      });
    }

    const codeSeverity = usage[0].severity;

    // Compare with documentation
    if (doc.severity !== codeSeverity) {
      violations.push({
        file: doc.file,
        issue: `Severity mismatch for rule "${ruleId}": docs say "${doc.severity}" but code uses "${codeSeverity}"`,
        suggestion: `Update metadata to: **Severity**: ${codeSeverity}`,
      });

      // Show where it's used in code
      usage.forEach((u) => {
        violations.push({
          file: u.file,
          line: u.line,
          issue: `  Used as ${codeSeverity} here`,
        });
      });
    }
  }
}

/**
 * Check validator consistency
 */
function checkValidatorConsistency(): void {
  for (const [ruleId, doc] of ruleDocs) {
    if (!doc.validator) {
      // No validator in docs - warning already reported by check-rule-docs
      continue;
    }

    // Get expected validator from file path
    const expectedValidator = getValidatorFromPath(doc.file);

    if (expectedValidator !== 'Unknown' && doc.validator !== expectedValidator) {
      violations.push({
        file: doc.file,
        issue: `Validator mismatch for rule "${ruleId}": metadata says "${doc.validator}" but file is in docs/rules/${expectedValidator.toLowerCase()}/`,
        suggestion: `Update metadata to: **Validator**: ${expectedValidator}`,
      });
    }
  }
}

/**
 * Check filename consistency
 */
function checkFilenameConsistency(): void {
  for (const [ruleId, doc] of ruleDocs) {
    const filename = basename(doc.file, '.md');

    if (filename !== ruleId) {
      violations.push({
        file: doc.file,
        issue: `Filename mismatch: file is named "${filename}.md" but should be "${ruleId}.md"`,
        suggestion: `Rename file to: ${dirname(doc.file)}/${ruleId}.md`,
      });
    }
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('Checking code/documentation consistency...\n');

  // Scan validators for rule usage
  await scanValidators();

  // Find all rule documentation
  await findRuleDocs();

  // Run consistency checks
  checkSeverityConsistency();
  checkValidatorConsistency();
  checkFilenameConsistency();

  // Report results
  let hasErrors = false;

  if (violations.length > 0) {
    console.log(`[FAIL] Found ${violations.length} consistency violations:\n`);
    for (const violation of violations) {
      const location = violation.line ? `${violation.file}:${violation.line}` : violation.file;
      console.log(`  ${location}`);
      console.log(`    ${violation.issue}`);
      if (violation.suggestion) {
        console.log(`    Suggestion: ${violation.suggestion}`);
      }
      console.log();
    }
    hasErrors = true;
  }

  if (warnings.length > 0) {
    console.log(`[WARN] Found ${warnings.length} warnings:\n`);
    for (const warning of warnings) {
      console.log(`  ${warning.file}`);
      console.log(`    ${warning.issue}`);
      console.log();
    }
  }

  if (!hasErrors && warnings.length === 0) {
    console.log('[PASS] Code and documentation are consistent');
    console.log(`  Rules with code: ${ruleIdSeverity.size}`);
    console.log(`  Rules with docs: ${ruleDocs.size}`);
  }

  // Exit with error if violations found
  if (hasErrors) {
    console.log('Fix violations before committing.');
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
