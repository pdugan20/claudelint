#!/usr/bin/env node
/**
 * Generate rule documentation from RuleRegistry
 *
 * This script reads all registered rules from RuleRegistry and generates
 * individual markdown files for each rule in the docs/rules/ directory.
 */

import * as fs from 'fs';
import * as path from 'path';
import { RuleRegistry, RuleMetadata } from '../src/utils/rule-registry';

// Import all validators to ensure rules are registered
import '../src/validators/claude-md';
import '../src/validators/skills';
import '../src/validators/settings';
import '../src/validators/hooks';
import '../src/validators/mcp';
import '../src/validators/plugin';

const DOCS_RULES_DIR = path.join(__dirname, '../docs/rules');

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
  };
  return dirMap[category] || category.toLowerCase();
}

/**
 * Convert rule ID to filename
 */
function getRuleFilename(ruleId: string): string {
  return `${ruleId}.md`;
}

/**
 * Generate markdown content for a rule
 */
function generateRuleDoc(rule: RuleMetadata): string {
  const deprecatedNotice = rule.deprecated
    ? `\n> **⚠️ Deprecated**: This rule is deprecated${
        rule.replacedBy ? ` and replaced by ${rule.replacedBy.map((r) => `[${r}](../${getCategoryDir(rule.category)}/${r}.md)`).join(', ')}` : ''
      }.\n`
    : '';

  return `# ${rule.name}

${rule.description}
${deprecatedNotice}
## Rule Details

This rule enforces ${rule.description.toLowerCase()}.

**Category**: ${rule.category}
**Severity**: ${rule.severity}
**Fixable**: ${rule.fixable ? 'Yes' : 'No'}
**Since**: v${rule.since}

Examples of **incorrect** code for this rule:

\`\`\`text
# Add examples of code that violates this rule
\`\`\`

Examples of **correct** code for this rule:

\`\`\`text
# Add examples of code that follows this rule
\`\`\`

## Options

This rule does not have any configuration options.

## When Not To Use It

You might want to disable this rule if:

- Your project has specific requirements that conflict with this rule
- You are working with legacy code that cannot be easily updated

## Configuration

To disable this rule, add it to your \`.claudelintrc.json\`:

\`\`\`json
{
  "rules": {
    "${rule.id}": "off"
  }
}
\`\`\`

To change the severity level:

\`\`\`json
{
  "rules": {
    "${rule.id}": "warning"
  }
}
\`\`\`

## Related Rules

<!-- Add related rules here -->

## Resources

${rule.docUrl ? `- [Documentation](${rule.docUrl})` : ''}

## Version

Available since: v${rule.since}
`;
}

/**
 * Generate rule index page
 */
function generateIndexPage(rules: RuleMetadata[]): string {
  const categories = Array.from(new Set(rules.map((r) => r.category))).sort();

  let content = `# Rule Index

This directory contains documentation for all ${rules.length} claudelint rules.

## Rules by Category

`;

  for (const category of categories) {
    const categoryRules = rules.filter((r) => r.category === category).sort((a, b) => a.id.localeCompare(b.id));
    const categoryDir = getCategoryDir(category);

    content += `\n### ${category} (${categoryRules.length} rules)\n\n`;

    for (const rule of categoryRules) {
      const fixableBadge = rule.fixable ? ' 🔧' : '';
      const deprecatedBadge = rule.deprecated ? ' ⚠️' : '';
      content += `- [${rule.id}](./${categoryDir}/${rule.id}.md)${fixableBadge}${deprecatedBadge} - ${rule.description}\n`;
    }
  }

  content += `\n## Legend

- 🔧 Fixable - Rule supports auto-fixing with \`--fix\`
- ⚠️ Deprecated - Rule is deprecated and may be removed in future versions

## Statistics

- **Total Rules**: ${rules.length}
- **Fixable Rules**: ${rules.filter((r) => r.fixable).length}
- **Deprecated Rules**: ${rules.filter((r) => r.deprecated).length}

## Categories

`;

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

  // Generate documentation for each rule
  for (const rule of rules) {
    const categoryDir = getCategoryDir(rule.category);
    const targetDir = path.join(DOCS_RULES_DIR, categoryDir);
    const filename = getRuleFilename(rule.id);
    const filepath = path.join(targetDir, filename);

    // Ensure directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const content = generateRuleDoc(rule);

    // Check if file exists
    if (fs.existsSync(filepath)) {
      const existingContent = fs.readFileSync(filepath, 'utf-8');
      if (existingContent === content) {
        console.log(`  ⏭️  Skipped ${rule.id} (no changes)`);
        continue;
      }
      console.log(`  📝 Updated ${rule.id}`);
      updatedCount++;
    } else {
      console.log(`  ✨ Created ${rule.id}`);
      generatedCount++;
    }

    fs.writeFileSync(filepath, content, 'utf-8');
  }

  // Generate index page
  const indexContent = generateIndexPage(rules);
  const indexPath = path.join(DOCS_RULES_DIR, 'index.md');
  fs.writeFileSync(indexPath, indexContent, 'utf-8');
  console.log(`\n  📋 Generated index.md`);

  console.log(`\n✅ Documentation generation complete!`);
  console.log(`   Created: ${generatedCount} files`);
  console.log(`   Updated: ${updatedCount} files`);
  console.log(`   Total: ${rules.length} rule docs + 1 index\n`);
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { generateRuleDoc, generateIndexPage };
