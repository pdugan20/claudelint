/**
 * explain command - Display full documentation for a specific rule
 *
 * Tier 3 of the progressive disclosure model: renders the complete
 * documentation page for a single rule in the terminal.
 *
 * Usage: claudelint explain <rule-id>
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { RuleRegistry } from '../../utils/rules/registry';
import { RuleCategory, RuleMetadata } from '../../types/rule';
import { logger } from '../utils/logger';

/**
 * Word-wrap text to a given width, preserving existing line breaks.
 */
function wordWrap(text: string, width: number, indent: string = ''): string {
  const lines: string[] = [];

  for (const paragraph of text.split('\n')) {
    if (paragraph.trim() === '') {
      lines.push('');
      continue;
    }

    const words = paragraph.split(/\s+/);
    let currentLine = indent;

    for (const word of words) {
      if (currentLine.length + word.length + 1 > width && currentLine.trim() !== '') {
        lines.push(currentLine);
        currentLine = indent + word;
      } else {
        currentLine += (currentLine.trim() === '' ? '' : ' ') + word;
      }
    }

    if (currentLine.trim() !== '') {
      lines.push(currentLine);
    }
  }

  return lines.join('\n');
}

/**
 * Map rule category to URL slug
 */
function getCategorySlug(category: RuleCategory): string {
  const map: Record<RuleCategory, string> = {
    'CLAUDE.md': 'claude-md',
    Skills: 'skills',
    Settings: 'settings',
    Hooks: 'hooks',
    MCP: 'mcp',
    Plugin: 'plugin',
    Commands: 'commands',
    Agents: 'agents',
    OutputStyles: 'output-styles',
    LSP: 'lsp',
  };
  return map[category];
}

/**
 * Get the documentation URL for a rule
 */
function getDocsUrl(meta: RuleMetadata): string {
  const slug = getCategorySlug(meta.category);
  return `https://claudelint.com/rules/${slug}/${meta.id}`;
}

/**
 * Render full rule documentation to the terminal
 */
function renderRuleExplanation(meta: RuleMetadata): void {
  const width = process.stdout.columns || 80;
  const docs = meta.docs;
  const output: string[] = [];

  // Title with underline
  output.push(chalk.bold(meta.id));
  output.push(chalk.bold('='.repeat(meta.id.length)));
  output.push('');

  // Summary
  if (docs?.summary) {
    output.push(wordWrap(docs.summary, width, '  '));
    output.push('');
  }

  // Details
  if (docs?.details) {
    output.push(wordWrap(docs.details, width, '  '));
    output.push('');
  }

  // How to fix
  if (docs?.howToFix) {
    output.push(chalk.bold('  How to fix:'));
    output.push('');
    output.push(wordWrap(docs.howToFix, width, '    '));
    output.push('');
  }

  // Examples
  if (docs?.examples) {
    const { incorrect, correct } = docs.examples;

    if (incorrect.length > 0 || correct.length > 0) {
      output.push(chalk.bold('  Examples:'));
      output.push('');

      for (const ex of incorrect) {
        output.push(chalk.red(`    Incorrect`) + ` - ${ex.description}:`);
        output.push('');
        for (const line of ex.code.split('\n')) {
          output.push(`      ${line}`);
        }
        output.push('');
      }

      for (const ex of correct) {
        output.push(chalk.green(`    Correct`) + ` - ${ex.description}:`);
        output.push('');
        for (const line of ex.code.split('\n')) {
          output.push(`      ${line}`);
        }
        output.push('');
      }
    }
  }

  // Metadata table
  const severityLabel = meta.severity === 'error' ? chalk.red('error') : chalk.yellow('warning');
  output.push(`  ${chalk.dim('Severity:')}  ${severityLabel}`);
  output.push(`  ${chalk.dim('Category:')}  ${meta.category}`);
  output.push(`  ${chalk.dim('Fixable:')}   ${meta.fixable ? 'yes' : 'no'}`);
  if (meta.since) {
    output.push(`  ${chalk.dim('Since:')}     ${meta.since}`);
  }
  output.push(`  ${chalk.dim('Docs:')}      ${getDocsUrl(meta)}`);
  output.push('');

  // When not to use
  if (docs?.whenNotToUse) {
    output.push(chalk.bold('  When not to use:'));
    output.push('');
    output.push(wordWrap(docs.whenNotToUse, width, '    '));
    output.push('');
  }

  // Related rules
  if (docs?.relatedRules && docs.relatedRules.length > 0) {
    output.push(chalk.bold('  Related rules:'));
    for (const related of docs.relatedRules) {
      output.push(`    - ${related}`);
    }
    output.push('');
  }

  // Print all output to stdout (this is the primary output, not chrome)
  process.stdout.write(output.join('\n') + '\n');
}

/**
 * Register the explain command
 *
 * @param program - Commander program instance
 */
export function registerExplainCommand(program: Command): void {
  program
    .command('explain <rule-id>')
    .description('Display full documentation for a specific rule')
    .action((ruleId: string) => {
      const meta = RuleRegistry.get(ruleId);

      if (!meta) {
        // Rule not found - show error with helpful suggestions
        logger.error(`Error: Rule "${ruleId}" not found.`);
        logger.newline();

        // Show category summary
        const allRules = RuleRegistry.getAll();
        const byCategory = new Map<string, number>();
        for (const rule of allRules) {
          byCategory.set(rule.category, (byCategory.get(rule.category) || 0) + 1);
        }

        logger.log('Available rules:');
        for (const [category, count] of byCategory.entries()) {
          const slug = getCategorySlug(category as RuleCategory);
          logger.detail(`${slug}-*`.padEnd(23) + `(${count} rules)`);
        }
        logger.newline();
        logger.log(`Run 'claudelint list-rules' to see all available rules.`);

        process.exit(1);
      }

      renderRuleExplanation(meta);
    });
}
