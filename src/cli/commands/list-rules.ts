/**
 * list-rules command - List all available validation rules
 */

import { Command } from 'commander';
import { RuleRegistry, RuleMetadata } from '../../utils/rule-registry';

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
    .action((options: { category?: string; format?: string }) => {
      const rules = options.category
        ? RuleRegistry.getByCategory(options.category)
        : RuleRegistry.getAll();

      if (options.format === 'json') {
        console.log(JSON.stringify(rules, null, 2));
        return;
      }

      // Table format (default)
      console.log(`\nAvailable Rules (${rules.length}):\n`);

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
        console.log(`\n${category}:`);
        categoryRules.forEach((rule: RuleMetadata) => {
          const badge = rule.fixable ? ' [fixable]' : '';
          const severity = rule.severity === 'error' ? '[ERROR]' : '[WARNING]';
          console.log(`  ${severity} ${rule.id}${badge} - ${rule.description}`);
        });
      }

      console.log('');
    });
}
