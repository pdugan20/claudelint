/**
 * list-rules command - List all available validation rules
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { RuleRegistry, RuleMetadata } from '../../utils/rules/registry';
import { logger } from '../utils/logger';

/**
 * Register the list-rules command
 *
 * @param program - Commander program instance
 */
export function registerListRulesCommand(program: Command): void {
  program
    .command('list-rules')
    .description('List all available validation rules')
    .option(
      '--category <category>',
      'Filter by category (CLAUDE.md, Skills, Settings, Hooks, MCP, Plugin)'
    )
    .option('--format <format>', 'Output format: table, json (default: table)')
    .option('--fixable', 'Show only rules that support auto-fix')
    .action((options: { category?: string; format?: string; fixable?: boolean }) => {
      let rules = options.category
        ? RuleRegistry.getByCategory(options.category)
        : RuleRegistry.getAll();

      if (options.fixable) {
        rules = rules.filter((rule) => rule.fixable);
      }

      if (options.format === 'json') {
        logger.log(JSON.stringify(rules, null, 2));
        return;
      }

      // Table format (default)
      logger.section(`Available Rules (${rules.length})`);

      // Group by category
      const byCategory = new Map<string, RuleMetadata[]>();
      for (const rule of rules) {
        if (!byCategory.has(rule.category)) {
          byCategory.set(rule.category, []);
        }
        byCategory.get(rule.category)!.push(rule);
      }

      // Print each category
      for (const [category, categoryRules] of byCategory.entries()) {
        logger.log(chalk.bold(`${category}:`));
        categoryRules.forEach((rule: RuleMetadata) => {
          const badge = rule.fixable ? chalk.gray(' [fixable]') : '';
          const severityBadge =
            rule.severity === 'error' ? chalk.red('error  ') : chalk.yellow('warning');
          logger.detail(`${severityBadge} ${chalk.cyan(rule.id)}${badge} - ${rule.description}`);
        });
        logger.newline();
      }
    });
}
