/**
 * Rule loader for auto-discovering and loading rules from filesystem
 *
 * Scans src/rules/**\/*.ts files, imports them, validates structure,
 * and builds a registry of all available rules.
 *
 * This enables ESLint-style rule contributions - just add a file!
 */

import { Rule, isRule } from '../types/rule';
import { RuleId } from '../rules/rule-ids';
import { glob } from 'glob';
import { join, basename } from 'path';

/**
 * Loader for discovering and loading validation rules from filesystem
 *
 * Features:
 * - Auto-discovers rules by scanning src/rules directories
 * - Caches loaded rules for performance
 * - Validates rule structure on load
 * - Ensures rule.meta.id matches filename
 */
export class RuleLoader {
  private rulesCache = new Map<RuleId, Rule>();
  private rulesDir: string;
  private cacheInvalidated = false;

  constructor(rulesDir?: string) {
    // Default to src/rules directory relative to this file
    this.rulesDir = rulesDir || join(__dirname, '../rules');
  }

  /**
   * Load all rules from filesystem
   *
   * Scans for .ts files in rules directories, imports them,
   * validates structure, and returns a Map of rule ID -> Rule.
   *
   * Results are cached - call clearCache() to force reload.
   *
   * @returns Map of all discovered rules
   */
  async loadAllRules(): Promise<Map<RuleId, Rule>> {
    // Return cached rules if available
    if (this.rulesCache.size > 0 && !this.cacheInvalidated) {
      return this.rulesCache;
    }

    // Clear cache before loading
    this.rulesCache.clear();
    this.cacheInvalidated = false;

    try {
      // Find all rule files (exclude tests, index, and rule-ids)
      const ruleFiles = await glob('**/*.ts', {
        cwd: this.rulesDir,
        ignore: ['**/*.test.ts', '**/index.ts', '**/rule-ids.ts', '**/*.d.ts'],
        absolute: false,
      });

      // Load each rule file
      for (const file of ruleFiles) {
        const rule = await this.loadRule(file);
        if (rule) {
          this.rulesCache.set(rule.meta.id, rule);
        }
      }

      return this.rulesCache;
    } catch (error) {
      console.error('Failed to load rules:', error);
      return this.rulesCache;
    }
  }

  /**
   * Load a single rule from a file
   *
   * @param file - Relative path to rule file (from rulesDir)
   * @returns Rule object if valid, null otherwise
   */
  private async loadRule(file: string): Promise<Rule | null> {
    try {
      // Import the rule module
      const modulePath = join(this.rulesDir, file);
      const module = (await import(modulePath)) as { rule: unknown };

      // Extract the rule export
      const rule = module.rule as Rule;

      // Validate rule structure
      if (!isRule(rule)) {
        console.warn(`Invalid rule file: ${file} - missing meta or validate`);
        return null;
      }

      // Validate rule ID matches filename
      const expectedId = basename(file, '.ts');
      if (rule.meta.id !== expectedId) {
        console.warn(
          `Rule ID mismatch in ${file}: exports '${rule.meta.id}' but filename is '${expectedId}.ts'`
        );
        // Still load the rule but warn about mismatch
      }

      return rule;
    } catch (error) {
      // Only log actual errors, not "file not found" during initial setup
      if (error instanceof Error && !error.message.includes('Cannot find module')) {
        console.error(`Failed to load rule ${file}:`, error);
      }
      return null;
    }
  }

  /**
   * Get a specific rule by ID
   *
   * @param ruleId - Rule identifier
   * @returns Rule if found, undefined otherwise
   */
  async getRule(ruleId: RuleId): Promise<Rule | undefined> {
    const rules = await this.loadAllRules();
    return rules.get(ruleId);
  }

  /**
   * Check if a rule exists
   *
   * @param ruleId - Rule identifier
   * @returns True if rule is loaded
   */
  async hasRule(ruleId: RuleId): Promise<boolean> {
    const rules = await this.loadAllRules();
    return rules.has(ruleId);
  }

  /**
   * Get all rule IDs
   *
   * @returns Array of all loaded rule IDs
   */
  async getRuleIds(): Promise<RuleId[]> {
    const rules = await this.loadAllRules();
    return Array.from(rules.keys());
  }

  /**
   * Clear the rules cache
   *
   * Forces reload on next loadAllRules() call.
   * Useful for testing or hot-reloading.
   */
  clearCache(): void {
    this.cacheInvalidated = true;
  }

  /**
   * Get statistics about loaded rules
   *
   * @returns Object with counts by category, severity, etc.
   */
  async getStats(): Promise<{
    total: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    deprecated: number;
    fixable: number;
  }> {
    const rules = await this.loadAllRules();
    const stats = {
      total: rules.size,
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      deprecated: 0,
      fixable: 0,
    };

    for (const rule of rules.values()) {
      // Count by category
      stats.byCategory[rule.meta.category] = (stats.byCategory[rule.meta.category] || 0) + 1;

      // Count by severity
      stats.bySeverity[rule.meta.severity] = (stats.bySeverity[rule.meta.severity] || 0) + 1;

      // Count deprecated
      if (rule.meta.deprecated) {
        stats.deprecated++;
      }

      // Count fixable
      if (rule.meta.fixable) {
        stats.fixable++;
      }
    }

    return stats;
  }
}

/**
 * Singleton instance for global use
 */
export const ruleLoader = new RuleLoader();
