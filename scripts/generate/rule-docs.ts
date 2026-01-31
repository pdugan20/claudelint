#!/usr/bin/env node
/**
 * Generate rule documentation from RuleRegistry
 *
 * This script reads all registered rules from RuleRegistry and generates
 * individual markdown files for each rule in the docs/rules/ directory.
 *
 * Generated content (from metadata):
 * - Title, severity, fixable, validator, category badges
 * - Brief description
 * - Version
 * - Implementation/test links
 *
 * Preserved content (manually written):
 * - Rule Details section
 * - Incorrect/Correct examples
 * - How To Fix section
 * - Options section
 * - When Not To Use It section
 * - Related Rules section
 * - Additional Resources
 */

import * as fs from 'fs';
import * as path from 'path';
import { RuleRegistry, RuleMetadata } from '../../src/utils/rule-registry';

// Import all validators to ensure rules are registered
import '../../src/validators/claude-md';
import '../../src/validators/skills';
import '../../src/validators/settings';
import '../../src/validators/hooks';
import '../../src/validators/mcp';
import '../../src/validators/plugin';
import '../../src/validators/commands';
import '../../src/validators/agents';
import '../../src/validators/lsp';
import '../../src/validators/output-styles';

const DOCS_RULES_DIR = path.join(__dirname, '../../docs/rules');

/**
 * Convert category name to directory name
 */
function getCategoryDir(category: string): string {
  const dirMap: Record<string, string> = {
    'CLAUDE.md': 'claude-md',
    'Skills': 'skills',
    'Settings': 'settings',
    'Hooks': 'hooks',
    'MCP': 'mcp',
    'Plugin': 'plugin',
    'Commands': 'commands',
    'Agents': 'agents',
    'LSP': 'lsp',
    'OutputStyles': 'output-styles',
  };
  return dirMap[category] || category.toLowerCase();
}

/**
 * Read existing documentation to preserve manually-written sections
 */
function readExistingSections(filepath: string): Map<string, string> {
  const sections = new Map<string, string>();

  if (!fs.existsSync(filepath)) {
    return sections;
  }

  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n');

  let currentSection: string | null = null;
  let sectionContent: string[] = [];
  let inMetadata = true;

  for (const line of lines) {
    // Skip title and metadata badges at the top
    if (inMetadata) {
      if (line.startsWith('##')) {
        inMetadata = false;
      } else {
        continue;
      }
    }

    // Check for section headers
    if (line.startsWith('## ')) {
      // Save previous section
      if (currentSection && sectionContent.length > 0) {
        sections.set(currentSection, sectionContent.join('\n').trim());
      }

      currentSection = line.substring(3).trim();
      sectionContent = [];
    } else if (currentSection) {
      sectionContent.push(line);
    }
  }

  // Save last section
  if (currentSection && sectionContent.length > 0) {
    sections.set(currentSection, sectionContent.join('\n').trim());
  }

  return sections;
}

/**
 * Determine rule category based on ID patterns
 */
function determineRuleType(ruleId: string): string {
  if (ruleId.includes('schema') || ruleId.includes('invalid')) {
    return 'Schema Validation';
  }
  if (
    ruleId.includes('missing') ||
    ruleId.includes('not-found') ||
    ruleId.includes('reference') ||
    ruleId.includes('circular')
  ) {
    return 'Cross-Reference';
  }
  if (
    ruleId.includes('dangerous') ||
    ruleId.includes('eval') ||
    ruleId.includes('secret') ||
    ruleId.includes('traversal')
  ) {
    return 'Security';
  }
  if (ruleId.includes('deprecated') || ruleId.includes('migrate')) {
    return 'Deprecation';
  }
  if (ruleId.includes('size') || ruleId.includes('too-many') || ruleId.includes('too-long')) {
    return 'File System';
  }
  return 'Best Practices';
}

/**
 * Generate markdown content for a rule
 */
function generateRuleDoc(rule: RuleMetadata, existingSections: Map<string, string>): string {
  let doc = `# Rule: ${rule.id}\n\n`;

  // Generate metadata badges
  doc += `**Severity**: ${rule.severity === 'error' ? 'Error' : 'Warning'}\n`;
  doc += `**Fixable**: ${rule.fixable ? 'Yes' : 'No'}\n`;
  doc += `**Validator**: ${rule.category}\n`;

  const ruleType = determineRuleType(rule.id);
  doc += `**Category**: ${ruleType}\n`;

  if (rule.deprecated) {
    doc += `**Deprecated**: Yes`;
    if (rule.replacedBy && rule.replacedBy.length > 0) {
      doc += ` (use ${rule.replacedBy.join(', ')} instead)`;
    }
    doc += '\n';
  }

  // Add description
  doc += `\n${rule.description}\n\n`;

  // Add manually-written sections
  const manualSections = [
    'Rule Details',
    'Options',
    'When Not To Use It',
    'Related Rules',
  ];

  for (const section of manualSections) {
    if (existingSections.has(section)) {
      doc += `## ${section}\n\n`;
      doc += existingSections.get(section)!;
      doc += '\n\n';
    }
  }

  // Add Resources section
  doc += `## Resources\n\n`;
  if (existingSections.has('Resources')) {
    doc += existingSections.get('Resources')!;
    doc += '\n\n';
  } else {
    // Generate default resource links
    const categoryDir = getCategoryDir(rule.category);
    doc += `- [Rule Implementation](../../src/rules/${categoryDir}/${rule.id}.ts)\n`;
    doc += `- [Rule Tests](../../tests/rules/${categoryDir}/${rule.id}.test.ts)\n`;
    if (rule.docUrl) {
      doc += `- [Documentation](${rule.docUrl})\n`;
    }
    doc += '\n';
  }

  // Add version
  doc += `## Version\n\n`;
  doc += `Available since: v${rule.since}\n`;

  return doc;
}

/**
 * Generate rule index page
 */
function generateIndexPage(rules: RuleMetadata[]): string {
  const categories = Array.from(new Set(rules.map((r) => r.category))).sort();

  let content = `# Rule Index\n\n`;
  content += `This directory contains documentation for all ${rules.length} claudelint rules.\n\n`;
  content += `## Rules by Category\n\n`;

  for (const category of categories) {
    const categoryRules = rules.filter((r) => r.category === category).sort((a, b) => a.id.localeCompare(b.id));
    const categoryDir = getCategoryDir(category);

    content += `\n### ${category} (${categoryRules.length} rules)\n\n`;

    for (const rule of categoryRules) {
      const fixableBadge = rule.fixable ? ' [FIXABLE]' : '';
      const deprecatedBadge = rule.deprecated ? ' [DEPRECATED]' : '';
      content += `- [${rule.id}](./${categoryDir}/${rule.id}.md)${fixableBadge}${deprecatedBadge} - ${rule.description}\n`;
    }
  }

  content += `\n## Legend\n\n`;
  content += `- [FIXABLE] - Rule supports auto-fixing with \`--fix\`\n`;
  content += `- [DEPRECATED] - Rule is deprecated and may be removed in future versions\n\n`;

  content += `## Statistics\n\n`;
  content += `- **Total Rules**: ${rules.length}\n`;
  content += `- **Fixable Rules**: ${rules.filter((r) => r.fixable).length}\n`;
  content += `- **Deprecated Rules**: ${rules.filter((r) => r.deprecated).length}\n\n`;

  content += `## Categories\n\n`;

  for (const category of categories) {
    const categoryRules = rules.filter((r) => r.category === category);
    const categoryDir = getCategoryDir(category);
    content += `- [${category}](./${categoryDir}/) - ${categoryRules.length} rules\n`;
  }

  return content;
}

/**
 * Main function
 */
function main(): void {
  console.log('Generating rule documentation from RuleRegistry...\n');

  const rules = RuleRegistry.getAll();

  if (rules.length === 0) {
    console.error('Error: No rules found in RuleRegistry');
    process.exit(1);
  }

  console.log(`Found ${rules.length} registered rules\n`);

  let generatedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  // Generate documentation for each rule
  for (const rule of rules) {
    const categoryDir = getCategoryDir(rule.category);
    const targetDir = path.join(DOCS_RULES_DIR, categoryDir);
    const filename = `${rule.id}.md`;
    const filepath = path.join(targetDir, filename);

    // Ensure directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Read existing sections to preserve manual content
    const existingSections = readExistingSections(filepath);

    // Generate new content
    const content = generateRuleDoc(rule, existingSections);

    // Check if file exists and content changed
    if (fs.existsSync(filepath)) {
      const existingContent = fs.readFileSync(filepath, 'utf-8');
      if (existingContent === content) {
        console.log(`[SKIP] ${rule.id} (no changes)`);
        skippedCount++;
        continue;
      }
      console.log(`[UPDATE] ${rule.id}`);
      updatedCount++;
    } else {
      console.log(`[CREATE] ${rule.id}`);
      generatedCount++;
    }

    fs.writeFileSync(filepath, content, 'utf-8');
  }

  // Generate index page
  const indexContent = generateIndexPage(rules);
  const indexPath = path.join(DOCS_RULES_DIR, 'index.md');
  fs.writeFileSync(indexPath, indexContent, 'utf-8');
  console.log(`\n[CREATE] index.md`);

  console.log(`\nDocumentation generation complete!`);
  console.log(`  Created: ${generatedCount} files`);
  console.log(`  Updated: ${updatedCount} files`);
  console.log(`  Skipped: ${skippedCount} files`);
  console.log(`  Total: ${rules.length} rule docs + 1 index\n`);
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { generateRuleDoc, generateIndexPage };
