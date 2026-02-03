/**
 * Migration script to update configs with deprecated rules
 */

import { readFileSync, writeFileSync } from 'fs';
import { RuleRegistry } from '../rules/registry';
import { isRuleDeprecated, getDeprecationInfo, getReplacementRuleIds } from '../../types/rule';
import type { ClaudeLintConfig } from '../config/types';

export interface MigrationResult {
  configPath: string;
  changes: MigrationChange[];
  warnings: string[];
  success: boolean;
  dryRun: boolean;
}

export interface MigrationChange {
  oldRuleId: string;
  newRuleId: string | null;
  action: 'replaced' | 'removed' | 'manual';
  reason: string;
}

/**
 * Migrate a config file by replacing deprecated rules
 *
 * @param configPath - Path to config file
 * @param dryRun - If true, don't write changes (default: false)
 * @returns Migration result
 */
export function migrateConfig(configPath: string, dryRun = false): MigrationResult {
  const result: MigrationResult = {
    configPath,
    changes: [],
    warnings: [],
    success: false,
    dryRun,
  };

  try {
    // Read config file
    const configContent = readFileSync(configPath, 'utf-8');
    let config: ClaudeLintConfig;

    // Parse JSON (support for package.json with claudelint field)
    if (configPath.endsWith('package.json')) {
      const pkg = JSON.parse(configContent) as Record<string, unknown>;
      config = (pkg.claudelint as ClaudeLintConfig) || {};
    } else {
      config = JSON.parse(configContent) as ClaudeLintConfig;
    }

    if (!config.rules || Object.keys(config.rules).length === 0) {
      result.warnings.push('No rules found in config file');
      result.success = true;
      return result;
    }

    // Find deprecated rules
    const ruleIds = Object.keys(config.rules);
    const newRules = { ...config.rules };
    let hasChanges = false;

    for (const ruleId of ruleIds) {
      const rule = RuleRegistry.getRule(ruleId);

      if (!rule) {
        result.warnings.push(`Unknown rule: ${ruleId}`);
        continue;
      }

      if (!isRuleDeprecated(rule)) {
        continue;
      }

      const info = getDeprecationInfo(rule);
      if (!info) {
        continue;
      }

      const replacements = getReplacementRuleIds(rule);
      const ruleConfig = config.rules[ruleId];

      // Handle replacement based on number of replacements
      if (replacements.length === 0) {
        // No replacement - suggest removal
        result.changes.push({
          oldRuleId: ruleId,
          newRuleId: null,
          action: 'manual',
          reason: `${info.reason}. Consider removing this rule.`,
        });
        result.warnings.push(
          `Rule '${ruleId}' has no replacement. You may want to remove it manually.`
        );
      } else if (replacements.length === 1) {
        // Single replacement - auto-replace
        const newRuleId = replacements[0];
        delete newRules[ruleId];
        newRules[newRuleId] = ruleConfig;
        hasChanges = true;

        result.changes.push({
          oldRuleId: ruleId,
          newRuleId,
          action: 'replaced',
          reason: info.reason,
        });
      } else {
        // Multiple replacements - requires manual intervention
        result.changes.push({
          oldRuleId: ruleId,
          newRuleId: null,
          action: 'manual',
          reason: `${info.reason}. Split into: ${replacements.join(', ')}`,
        });
        result.warnings.push(
          `Rule '${ruleId}' has multiple replacements (${replacements.join(', ')}). Please update manually.`
        );
      }
    }

    // Write changes if not dry-run
    if (hasChanges && !dryRun) {
      const updatedConfig = { ...config, rules: newRules };

      if (configPath.endsWith('package.json')) {
        // Update package.json with claudelint field
        const pkg = JSON.parse(configContent) as Record<string, unknown>;
        pkg.claudelint = updatedConfig;
        writeFileSync(configPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
      } else {
        // Update config file directly
        writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2) + '\n', 'utf-8');
      }
    }

    result.success = true;
    return result;
  } catch (error: unknown) {
    result.success = false;
    result.warnings.push(
      `Migration failed: ${error instanceof Error ? error.message : String(error)}`
    );
    return result;
  }
}
