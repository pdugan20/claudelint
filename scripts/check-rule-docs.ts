#!/usr/bin/env ts-node
/**
 * Rule Documentation Validator
 *
 * Validates that:
 * 1. All registered rule IDs have corresponding documentation files
 * 2. All documentation files have required sections
 * 3. Documentation metadata matches implementation
 * 4. Code examples have language identifiers
 * 5. No orphaned documentation files exist
 */

import { readFile, readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { existsSync } from 'fs';

interface Violation {
  file: string;
  line?: number;
  issue: string;
  section?: string;
}

const violations: Violation[] = [];
const warnings: Violation[] = [];
const projectRoot = join(__dirname, '..');

// Required sections in rule documentation
const REQUIRED_SECTIONS = [
  'Rule Details',
  'Options',
  'When Not To Use It',
  'Version',
  // Note: 'Metadata' section is now optional - new format uses badges at top
];

// Required metadata fields
const METADATA_FIELDS = ['Category', 'Severity', 'Fixable', 'Validator'];

// Valid validators
const VALID_VALIDATORS = [
  'CLAUDE.md',
  'Skills',
  'Agents',
  'Settings',
  'Hooks',
  'MCP',
  'Plugin',
  'Commands',
  'LSP',
  'Output Styles',
];

/**
 * Load all registered rule IDs
 */
async function loadRegisteredRuleIds(): Promise<Set<string>> {
  const ruleIdsPath = join(projectRoot, 'src', 'rules', 'rule-ids.ts');

  if (!existsSync(ruleIdsPath)) {
    throw new Error('src/rules/rule-ids.ts not found');
  }

  const ruleIdsModule = await import(ruleIdsPath);
  const allRuleIds: readonly string[] = ruleIdsModule.ALL_RULE_IDS || [];

  return new Set(allRuleIds);
}

/**
 * Find all rule documentation files
 */
async function findRuleDocs(): Promise<Map<string, string>> {
  const rulesDir = join(projectRoot, 'docs', 'rules');
  const ruleDocs = new Map<string, string>();

  if (!existsSync(rulesDir)) {
    return ruleDocs;
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
        ruleDocs.set(ruleId, fullPath);
      }
    }
  }

  await scanDirectory(rulesDir);
  return ruleDocs;
}

/**
 * Parse documentation file and extract sections
 */
async function parseDocumentation(
  filePath: string
): Promise<{
  sections: Set<string>;
  metadata: Map<string, string>;
  hasTitle: boolean;
  hasExamples: boolean;
  codeBlocksWithoutLang: number;
}> {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');

  const sections = new Set<string>();
  const metadata = new Map<string, string>();
  let hasTitle = false;
  let hasExamples = false;
  let codeBlocksWithoutLang = 0;
  let inMetadataSection = false;
  let insideCodeBlock = false;
  let currentFenceLength = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for H1 title (must be first non-empty line)
    if (i === 0 && line.startsWith('# Rule:')) {
      hasTitle = true;
    }

    // Extract metadata from badges at top (new format) - within first 15 lines
    if (i < 15 && line.startsWith('**') && line.includes('**:')) {
      const match = line.match(/\*\*([^*]+)\*\*:\s*(.+)/);
      if (match) {
        metadata.set(match[1], match[2].trim());
      }
    }

    // Check for H2 sections
    if (line.startsWith('## ')) {
      const sectionName = line.replace('## ', '').trim();
      sections.add(sectionName);

      if (sectionName === 'Metadata') {
        inMetadataSection = true;
      } else {
        inMetadataSection = false;
      }
    }

    // Extract metadata from old Metadata section (for backward compatibility)
    if (inMetadataSection && line.startsWith('- **')) {
      const match = line.match(/- \*\*([^*]+)\*\*:\s*(.+)/);
      if (match) {
        metadata.set(match[1], match[2].trim());
      }
    }

    // Check for examples - accept multiple formats:
    // - "### Incorrect" or "### Correct" headings (new format)
    // - Lines with "incorrect"/"correct" AND "example" keywords (old format)
    // - Lines with "violation" (old format)
    const lineLower = line.toLowerCase();
    const isExampleHeading = line.startsWith('###') &&
      (lineLower.includes('incorrect') || lineLower.includes('correct') || lineLower.includes('violation'));
    const hasIncorrectExample = lineLower.includes('incorrect') || lineLower.includes('violation');
    const hasCorrectExample = lineLower.includes('correct');
    const hasExampleKeyword = lineLower.includes('example');

    if (isExampleHeading || (hasExampleKeyword && (hasIncorrectExample || hasCorrectExample))) {
      hasExamples = true;
    }

    // Check for code blocks without language identifiers
    // Support both 3-backtick (```) and 4-backtick (````) fences
    // Must properly handle nesting by tracking fence lengths
    const fenceMatch = line.match(/^(`{3,})/);
    if (fenceMatch) {
      const fenceLength = fenceMatch[1].length;

      if (insideCodeBlock && fenceLength >= currentFenceLength) {
        // This is a closing fence (must be same or longer length)
        insideCodeBlock = false;
        currentFenceLength = 0;
      } else if (!insideCodeBlock) {
        // This is an opening fence - check if it has a language
        // Only count 3-backtick fences without language (4-backtick are typically for nesting)
        if (fenceLength === 3 && line.trim() === '```') {
          codeBlocksWithoutLang++;
        }
        insideCodeBlock = true;
        currentFenceLength = fenceLength;
      }
      // Else: shorter fence inside a longer fence block - ignore it (it's content, not a fence)
    }
  }

  return { sections, metadata, hasTitle, hasExamples, codeBlocksWithoutLang };
}

/**
 * Validate a single documentation file
 */
async function validateDocumentation(_ruleId: string, filePath: string): Promise<void> {
  const relativePath = relative(projectRoot, filePath);
  const parsed = await parseDocumentation(filePath);

  // Check for title
  if (!parsed.hasTitle) {
    violations.push({
      file: relativePath,
      issue: 'Missing required H1 title in format "# Rule: rule-id"',
    });
  }

  // Check for required sections
  for (const requiredSection of REQUIRED_SECTIONS) {
    if (!parsed.sections.has(requiredSection)) {
      violations.push({
        file: relativePath,
        issue: `Missing required section: ## ${requiredSection}`,
        section: requiredSection,
      });
    }
  }

  // Check for examples
  if (!parsed.hasExamples) {
    warnings.push({
      file: relativePath,
      issue: 'No code examples found (should have "incorrect" and "correct" examples)',
    });
  }

  // Check for code blocks without language identifiers
  if (parsed.codeBlocksWithoutLang > 0) {
    violations.push({
      file: relativePath,
      issue: `Found ${parsed.codeBlocksWithoutLang} code block(s) without language identifier`,
    });
  }

  // Check metadata fields
  for (const field of METADATA_FIELDS) {
    if (!parsed.metadata.has(field)) {
      violations.push({
        file: relativePath,
        issue: `Missing metadata field: ${field}`,
        section: 'Metadata',
      });
    }
  }

  // Validate metadata values
  if (parsed.metadata.has('Severity')) {
    const severity = parsed.metadata.get('Severity')?.toLowerCase();
    if (severity !== 'error' && severity !== 'warning') {
      violations.push({
        file: relativePath,
        issue: `Invalid severity "${severity}" (must be "error" or "warning")`,
        section: 'Metadata',
      });
    }
  }

  if (parsed.metadata.has('Fixable')) {
    const fixable = parsed.metadata.get('Fixable');
    if (fixable !== 'Yes' && fixable !== 'No') {
      violations.push({
        file: relativePath,
        issue: `Invalid fixable value "${fixable}" (must be "Yes" or "No")`,
        section: 'Metadata',
      });
    }
  }

  if (parsed.metadata.has('Validator')) {
    const validator = parsed.metadata.get('Validator');
    if (!VALID_VALIDATORS.includes(validator!)) {
      violations.push({
        file: relativePath,
        issue: `Invalid validator "${validator}" (must be one of: ${VALID_VALIDATORS.join(', ')})`,
        section: 'Metadata',
      });
    }
  }
}

/**
 * Check for missing documentation
 */
function checkMissingDocs(registeredRuleIds: Set<string>, ruleDocs: Map<string, string>): void {
  for (const ruleId of registeredRuleIds) {
    if (!ruleDocs.has(ruleId)) {
      warnings.push({
        file: 'docs/rules/',
        issue: `Missing documentation for registered rule ID "${ruleId}"`,
      });
    }
  }
}

/**
 * Check for orphaned documentation
 */
function checkOrphanedDocs(registeredRuleIds: Set<string>, ruleDocs: Map<string, string>): void {
  for (const [ruleId, filePath] of ruleDocs) {
    if (!registeredRuleIds.has(ruleId)) {
      const relativePath = relative(projectRoot, filePath);
      warnings.push({
        file: relativePath,
        issue: `Orphaned documentation: rule ID "${ruleId}" not registered in rule-ids.ts`,
      });
    }
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('Checking rule documentation...\n');

  // Load registered rule IDs
  const registeredRuleIds = await loadRegisteredRuleIds();

  // Find all rule documentation files
  const ruleDocs = await findRuleDocs();

  // Validate each documentation file
  for (const [ruleId, filePath] of ruleDocs) {
    await validateDocumentation(ruleId, filePath);
  }

  // Check for missing documentation
  checkMissingDocs(registeredRuleIds, ruleDocs);

  // Check for orphaned documentation
  checkOrphanedDocs(registeredRuleIds, ruleDocs);

  // Report results
  let hasErrors = false;

  if (violations.length > 0) {
    console.log(`[FAIL] Found ${violations.length} documentation violations:\n`);
    for (const violation of violations) {
      console.log(`  ${violation.file}`);
      if (violation.line) {
        console.log(`    Line ${violation.line}: ${violation.issue}`);
      } else {
        console.log(`    ${violation.issue}`);
      }
      if (violation.section) {
        console.log(`    Section: ${violation.section}`);
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
    console.log('[PASS] All rule documentation is complete and valid');
    console.log(`  Documented rules: ${ruleDocs.size}`);
    console.log(`  Registered rules: ${registeredRuleIds.size}`);
    console.log(`  Coverage: ${Math.round((ruleDocs.size / registeredRuleIds.size) * 100)}%`);
  } else if (!hasErrors) {
    console.log(`\n[PASS] Documentation validation passed (with ${warnings.length} warnings)`);
    console.log(`  Documented rules: ${ruleDocs.size}/${registeredRuleIds.size}`);
    console.log(`  Coverage: ${Math.round((ruleDocs.size / registeredRuleIds.size) * 100)}%`);
  }

  // Exit with error if violations found
  if (hasErrors) {
    console.log('\nFix violations before committing.');
    console.log('See docs/rule-development-enforcement.md for documentation requirements.');
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
