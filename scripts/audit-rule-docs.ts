#!/usr/bin/env ts-node

/**
 * Audit rule documentation files for compliance with new template
 *
 * Checks:
 * 1. Metadata badges at top (not bottom table)
 * 2. Line count targets
 * 3. Example count limits
 * 4. Redundant sections
 * 5. Source code links
 * 6. Resource link format (must use "Rule Implementation" and "Rule Tests")
 */

import * as fs from 'fs';
import * as path from 'path';

interface AuditIssue {
  file: string;
  severity: 'error' | 'warning' | 'info';
  issue: string;
  line?: number;
}

interface AuditResult {
  file: string;
  lineCount: number;
  hasMetadataAtTop: boolean;
  hasMetadataTable: boolean;
  exampleCount: {
    incorrect: number;
    correct: number;
  };
  redundantSections: string[];
  hasSourceLinks: boolean;
  complexity: 'simple' | 'complex';
  issues: AuditIssue[];
}

function auditRuleDoc(filePath: string): AuditResult {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const lineCount = lines.length;

  const result: AuditResult = {
    file: path.basename(filePath),
    lineCount,
    hasMetadataAtTop: false,
    hasMetadataTable: false,
    exampleCount: { incorrect: 0, correct: 0 },
    redundantSections: [],
    hasSourceLinks: false,
    complexity: 'simple',
    issues: [],
  };

  // Check for metadata badges at top (within first 10 lines)
  const topSection = lines.slice(0, 10).join('\n');
  if (topSection.includes('**Severity**:') || topSection.includes('**Fixable**:')) {
    result.hasMetadataAtTop = true;
  }

  // Check for old metadata table format
  if (content.includes('## Metadata\n\n-')) {
    result.hasMetadataTable = true;
  }

  // Count examples
  let inCodeBlock = false;
  let lastHeading = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track headings
    if (line.startsWith('###')) {
      lastHeading = line.toLowerCase();
    }

    // Check for redundant sections
    if (line.startsWith('##')) {
      const heading = line.toLowerCase();
      if (heading.includes('benefits of') || heading.includes('why it matters') ||
          heading.includes('why ') && heading.includes(' matters')) {
        result.redundantSections.push(line.trim());
      }
      if (heading.includes('good directory patterns') || heading.includes('common directory structures')) {
        result.redundantSections.push(line.trim());
      }
      if (heading.includes('migration steps') && !heading.includes('how to fix')) {
        result.redundantSections.push(line.trim());
      }
    }

    // Count examples
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      if (inCodeBlock) {
        if (lastHeading.includes('incorrect') || lastHeading.includes('violation')) {
          result.exampleCount.incorrect++;
        } else if (lastHeading.includes('correct')) {
          result.exampleCount.correct++;
        }
      }
    }
  }

  // Check for source code links
  if (content.includes('Rule Implementation') || content.includes('../../src/validators/')) {
    result.hasSourceLinks = true;
  }

  // Check for non-standard Resource link format
  const hasNonStandardImplementation = /^\- \[Implementation\]/m.test(content);
  const hasNonStandardTests = /^\- \[Tests\]/m.test(content);

  if (hasNonStandardImplementation || hasNonStandardTests) {
    const wrongFormats = [];
    if (hasNonStandardImplementation) wrongFormats.push('[Implementation]');
    if (hasNonStandardTests) wrongFormats.push('[Tests]');

    result.issues.push({
      file: result.file,
      severity: 'error',
      issue: `Non-standard Resource link format: ${wrongFormats.join(', ')} - should use [Rule Implementation] and [Rule Tests]`,
    });
  }

  // Determine complexity (simple heuristic: has options = complex)
  const hasOptions = content.includes('## Options') &&
                    !content.includes('does not have any configuration options');
  result.complexity = hasOptions ? 'complex' : 'simple';

  // Generate issues
  const target = result.complexity === 'simple' ? 120 : 250;

  if (!result.hasMetadataAtTop) {
    result.issues.push({
      file: result.file,
      severity: 'error',
      issue: 'Missing metadata badges at top (should be within first 10 lines)',
    });
  }

  if (result.hasMetadataTable) {
    result.issues.push({
      file: result.file,
      severity: 'error',
      issue: 'Uses old metadata table format (## Metadata) - should use badges at top',
    });
  }

  if (result.lineCount > target) {
    const excess = result.lineCount - target;
    result.issues.push({
      file: result.file,
      severity: 'warning',
      issue: `Exceeds ${result.complexity} rule target of ${target} lines by ${excess} lines (${result.lineCount} total)`,
    });
  }

  if (result.exampleCount.incorrect > 2) {
    result.issues.push({
      file: result.file,
      severity: 'warning',
      issue: `Too many incorrect examples (${result.exampleCount.incorrect}) - maximum 2 recommended`,
    });
  }

  if (result.exampleCount.correct > 2) {
    result.issues.push({
      file: result.file,
      severity: 'warning',
      issue: `Too many correct examples (${result.exampleCount.correct}) - maximum 2 recommended`,
    });
  }

  if (result.redundantSections.length > 0) {
    result.issues.push({
      file: result.file,
      severity: 'warning',
      issue: `Has redundant sections: ${result.redundantSections.join(', ')}`,
    });
  }

  if (!result.hasSourceLinks) {
    result.issues.push({
      file: result.file,
      severity: 'info',
      issue: 'Missing source code links to implementation/tests',
    });
  }

  return result;
}

function main() {
  const rulesDir = path.join(__dirname, '../docs/rules');
  const results: AuditResult[] = [];

  // Find all rule docs
  function findRuleDocs(dir: string): string[] {
    const files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...findRuleDocs(fullPath));
      } else if (entry.name.endsWith('.md') && entry.name !== 'TEMPLATE.md' && entry.name !== 'index.md') {
        files.push(fullPath);
      }
    }

    return files;
  }

  const ruleDocs = findRuleDocs(rulesDir);
  console.log(`Auditing ${ruleDocs.length} rule documentation files...\n`);

  // Audit each doc
  for (const docPath of ruleDocs) {
    const result = auditRuleDoc(docPath);
    results.push(result);
  }

  // Generate report
  const errors = results.filter(r => r.issues.some(i => i.severity === 'error'));
  const warnings = results.filter(r => r.issues.some(i => i.severity === 'warning'));
  const clean = results.filter(r => r.issues.length === 0);

  console.log('='.repeat(80));
  console.log('AUDIT SUMMARY');
  console.log('='.repeat(80));
  console.log();
  console.log(`Total docs: ${results.length}`);
  console.log(`Clean: ${clean.length}`);
  console.log(`With warnings: ${warnings.length}`);
  console.log(`With errors: ${errors.length}`);
  console.log();

  // Line count stats
  const lineCounts = results.map(r => r.lineCount);
  const avgLines = lineCounts.reduce((a, b) => a + b, 0) / lineCounts.length;
  const underTarget = results.filter(r => r.lineCount <= (r.complexity === 'simple' ? 120 : 250));
  const overTarget = results.filter(r => r.lineCount > (r.complexity === 'simple' ? 120 : 250));

  console.log('LINE COUNT ANALYSIS:');
  console.log(`  Average: ${Math.round(avgLines)} lines`);
  console.log(`  Within target: ${underTarget.length} (${Math.round(underTarget.length / results.length * 100)}%)`);
  console.log(`  Over target: ${overTarget.length} (${Math.round(overTarget.length / results.length * 100)}%)`);
  console.log();

  // Metadata analysis
  const withBadges = results.filter(r => r.hasMetadataAtTop).length;
  const withTables = results.filter(r => r.hasMetadataTable).length;
  const withSourceLinks = results.filter(r => r.hasSourceLinks).length;

  console.log('TEMPLATE COMPLIANCE:');
  console.log(`  With metadata badges (new format): ${withBadges} (${Math.round(withBadges / results.length * 100)}%)`);
  console.log(`  With metadata table (old format): ${withTables} (${Math.round(withTables / results.length * 100)}%)`);
  console.log(`  With source code links: ${withSourceLinks} (${Math.round(withSourceLinks / results.length * 100)}%)`);
  console.log();

  // Redundant sections
  const withRedundant = results.filter(r => r.redundantSections.length > 0).length;
  console.log('REDUNDANT SECTIONS:');
  console.log(`  Docs with redundant sections: ${withRedundant} (${Math.round(withRedundant / results.length * 100)}%)`);
  console.log();

  // Priority list
  console.log('='.repeat(80));
  console.log('PRIORITY: DOCS NEEDING UPDATES');
  console.log('='.repeat(80));
  console.log();

  // Sort by issue severity and line count
  const prioritized = results
    .filter(r => r.issues.length > 0)
    .sort((a, b) => {
      // Errors first
      const aHasError = a.issues.some(i => i.severity === 'error');
      const bHasError = b.issues.some(i => i.severity === 'error');
      if (aHasError && !bHasError) return -1;
      if (!aHasError && bHasError) return 1;

      // Then by line count (most verbose first)
      return b.lineCount - a.lineCount;
    });

  for (const result of prioritized) {
    const target = result.complexity === 'simple' ? 120 : 250;
    const status = result.lineCount > target ? `[FAIL] ${result.lineCount}/${target}` : `✓ ${result.lineCount}/${target}`;

    console.log(`${result.file} (${result.complexity}) ${status}`);

    for (const issue of result.issues) {
      const icon = issue.severity === 'error' ? '  [FAIL]' : issue.severity === 'warning' ? '  [WARN] ' : '  [INFO] ';
      console.log(`${icon} ${issue.issue}`);
    }
    console.log();
  }

  // Exit code
  process.exit(errors.length > 0 ? 1 : 0);
}

main();
