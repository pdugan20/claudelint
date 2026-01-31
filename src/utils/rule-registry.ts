/**
 * Rule Registry
 *
 * Central registry for all validation rules in claudelint.
 * Stores full Rule objects (metadata + validate function) for execution.
 * Provides category-based discovery for validator auto-execution.
 */

import { RuleId } from '../rules/rule-ids';
import { Rule, RuleMetadata, RuleCategory } from '../types/rule';

// Re-export for backwards compatibility
export type { RuleMetadata };

export class RuleRegistry {
  private static rules = new Map<RuleId, Rule>();
  private static categoryCache = new Map<RuleCategory, Rule[]>();

  /**
   * Register a new rule in the registry
   * Accepts either full Rule object or just RuleMetadata for backwards compatibility
   */
  static register(rule: Rule | RuleMetadata): void {
    const ruleId = 'meta' in rule ? rule.meta.id : rule.id;

    if (this.rules.has(ruleId)) {
      throw new Error(`Rule '${ruleId}' is already registered`);
    }

    // Store full Rule object (convert metadata-only to Rule with no-op validate)
    if ('meta' in rule && 'validate' in rule) {
      this.rules.set(ruleId, rule);
    } else {
      // Backwards compatibility: wrap metadata in Rule object
      const ruleObj: Rule = {
        meta: rule as RuleMetadata,
        validate: () => {
          throw new Error(`Rule '${ruleId}' has no validate function - metadata-only registration`);
        },
      };
      this.rules.set(ruleId, ruleObj);
    }

    // Invalidate category cache
    this.categoryCache.clear();
  }

  /**
   * Get full Rule object for a specific rule ID
   * Accepts string to allow validation of external rule IDs
   */
  static getRule(ruleId: string): Rule | undefined {
    return this.rules.get(ruleId as RuleId);
  }

  /**
   * Get metadata for a specific rule
   * Accepts string to allow validation of external rule IDs
   */
  static get(ruleId: string): RuleMetadata | undefined {
    const rule = this.rules.get(ruleId as RuleId);
    return rule?.meta;
  }

  /**
   * Get all registered rules (full Rule objects)
   */
  static getAllRules(): Rule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get all registered rules (metadata only)
   */
  static getAll(): RuleMetadata[] {
    return Array.from(this.rules.values()).map((rule) => rule.meta);
  }

  /**
   * Get all rules in a specific category (full Rule objects)
   * Uses caching for performance
   */
  static getRulesByCategory(category: RuleCategory): Rule[] {
    // Check cache first
    const cached = this.categoryCache.get(category);
    if (cached) {
      return cached;
    }

    // Build category list
    const rules = Array.from(this.rules.values()).filter((rule) => rule.meta.category === category);

    // Cache for future lookups
    this.categoryCache.set(category, rules);

    return rules;
  }

  /**
   * Get all rules for a specific validator ID
   * Maps validator IDs to their corresponding rule categories
   */
  static getRulesForValidator(validatorId: string): Rule[] {
    const categoryMap: Record<string, RuleCategory> = {
      'claude-md': 'CLAUDE.md',
      skills: 'Skills',
      agents: 'Agents',
      mcp: 'MCP',
      hooks: 'Hooks',
      settings: 'Settings',
      plugin: 'Plugin',
      commands: 'Commands',
      'output-styles': 'OutputStyles',
      lsp: 'LSP',
    };

    const category = categoryMap[validatorId];
    return category ? this.getRulesByCategory(category) : [];
  }

  /**
   * Get all rules in a specific category (metadata only)
   */
  static getByCategory(category: string): RuleMetadata[] {
    return this.getRulesByCategory(category as RuleCategory).map((rule) => rule.meta);
  }

  /**
   * Check if a rule exists in the registry
   * Accepts string to allow validation of external rule IDs
   */
  static exists(ruleId: string): boolean {
    return this.rules.has(ruleId as RuleId);
  }

  /**
   * Clear all registered rules (useful for testing)
   */
  static clear(): void {
    this.rules.clear();
    this.categoryCache.clear();
  }

  /**
   * Get count of registered rules
   */
  static count(): number {
    return this.rules.size;
  }

  /**
   * Get all rule IDs
   */
  static getAllIds(): RuleId[] {
    return Array.from(this.rules.keys());
  }
}
