import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { RuleRegistry } from '../rules/registry';
import { isRuleDeprecated, getReplacementRuleIds } from '../../types/rule';

/**
 * Configuration for a single validation rule
 */
export interface RuleConfig {
  /** Rule severity level */
  severity: 'off' | 'warn' | 'error';
  /** Additional rule-specific options */
  options?: Record<string, unknown>;
}

/**
 * File-specific rule overrides
 */
export interface ConfigOverride {
  /** Glob patterns for files this override applies to */
  files: string[];
  /** Rule configurations to apply for matched files */
  rules: Record<string, RuleConfig | 'off' | 'warn' | 'error'>;
}

/**
 * Complete claudelint configuration
 */
export interface ClaudeLintConfig {
  /**
   * Extend one or more base configurations
   *
   * Can be:
   * - Relative path: "./base.json" or "../../.claudelintrc.json"
   * - Node modules package: "claudelint-config-standard" or "@acme/claudelint-config"
   * - Array of configs (merged in order): ["./base.json", "./strict.json"]
   *
   * @example
   * // Single extend
   * { "extends": "../../.claudelintrc.json" }
   *
   * @example
   * // Multiple extends
   * { "extends": ["./base.json", "@acme/claudelint-config"] }
   */
  extends?: string | string[];
  /** Rule configurations (rule-id -> config) */
  rules?: Record<string, RuleConfig | 'off' | 'warn' | 'error'>;
  /** File-specific overrides */
  overrides?: ConfigOverride[];
  /** Glob patterns for files/directories to ignore */
  ignorePatterns?: string[];
  /** Output formatting options */
  output?: {
    format?: 'stylish' | 'json' | 'compact' | 'sarif' | 'github';
    verbose?: boolean;
    color?: boolean;
  };
  /** Warn about unused disable directives */
  reportUnusedDisableDirectives?: boolean;
  /** Maximum warnings before failing (0 = unlimited) */
  maxWarnings?: number;
}

/**
 * Find configuration file by walking up directory tree
 */
export function findConfigFile(startDir: string): string | null {
  const configNames = ['.claudelintrc.json', 'package.json'];

  let currentDir = startDir;
  const root = '/';

  while (currentDir !== root) {
    for (const configName of configNames) {
      const configPath = join(currentDir, configName);
      if (existsSync(configPath)) {
        // If package.json, check if it has claudelint config
        if (configName === 'package.json') {
          try {
            const pkg = JSON.parse(readFileSync(configPath, 'utf-8')) as Record<string, unknown>;
            if (pkg.claudelint) {
              return configPath;
            }
          } catch {
            // Invalid package.json, skip
          }
        } else {
          return configPath;
        }
      }
    }

    // Move up one directory
    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      break; // Reached root
    }
    currentDir = parentDir;
  }

  return null;
}

/**
 * Load configuration from file
 */
export function loadConfig(configPath: string): ClaudeLintConfig {
  const ext = configPath.split('.').pop();

  if (configPath.endsWith('package.json')) {
    const pkg = JSON.parse(readFileSync(configPath, 'utf-8')) as Record<string, unknown>;
    return (pkg.claudelint as ClaudeLintConfig) || {};
  }

  if (ext === 'json') {
    return JSON.parse(readFileSync(configPath, 'utf-8')) as ClaudeLintConfig;
  }

  throw new Error(`Unsupported config file format: ${configPath}. Use .claudelintrc.json instead.`);
}

/**
 * Merge config with defaults
 *
 * Note: The 'extends' field is intentionally not merged.
 * It should be resolved before merging configs.
 */
export function mergeConfig(
  userConfig: ClaudeLintConfig,
  defaults: Partial<ClaudeLintConfig>
): ClaudeLintConfig {
  return {
    // extends is NOT merged - it's resolved before merging
    rules: { ...defaults.rules, ...userConfig.rules },
    overrides: [...(defaults.overrides || []), ...(userConfig.overrides || [])],
    ignorePatterns: [
      ...new Set([...(defaults.ignorePatterns || []), ...(userConfig.ignorePatterns || [])]),
    ],
    output: { ...defaults.output, ...userConfig.output },
    reportUnusedDisableDirectives:
      userConfig.reportUnusedDisableDirectives ?? defaults.reportUnusedDisableDirectives ?? false,
    maxWarnings: userConfig.maxWarnings ?? defaults.maxWarnings,
  };
}

/**
 * Normalize rule config to full format
 */
export function normalizeRuleConfig(config: RuleConfig | 'off' | 'warn' | 'error'): RuleConfig {
  if (typeof config === 'string') {
    return { severity: config };
  }
  return config;
}

/**
 * Validation error for config
 */
export interface ConfigValidationError {
  message: string;
  ruleId?: string;
  severity: 'error' | 'warning';
}

/**
 * Validate config against rule registry
 */
export function validateConfig(config: ClaudeLintConfig): ConfigValidationError[] {
  const errors: ConfigValidationError[] = [];

  // Validate extends field
  if (config.extends !== undefined) {
    if (typeof config.extends === 'string') {
      // Single extend - validate it's not empty
      if (config.extends.trim() === '') {
        errors.push({
          message: `Empty string in 'extends' field. Provide a valid config path or package name.`,
          severity: 'error',
        });
      }
    } else if (Array.isArray(config.extends)) {
      // Array of extends - validate each entry
      if (config.extends.length === 0) {
        errors.push({
          message: `Empty array in 'extends' field. Provide at least one config to extend or remove the field.`,
          severity: 'error',
        });
      }
      for (let i = 0; i < config.extends.length; i++) {
        const ext = config.extends[i];
        if (typeof ext !== 'string') {
          errors.push({
            message: `Invalid extends value at index ${i}: must be a string, got ${typeof ext}`,
            severity: 'error',
          });
        } else if (ext.trim() === '') {
          errors.push({
            message: `Empty string in 'extends' array at index ${i}`,
            severity: 'error',
          });
        }
      }
    } else {
      errors.push({
        message: `Invalid 'extends' value: must be a string or array of strings, got ${typeof config.extends}`,
        severity: 'error',
      });
    }
  }

  // Validate rules
  if (config.rules) {
    for (const ruleId of Object.keys(config.rules)) {
      if (!RuleRegistry.exists(ruleId)) {
        errors.push({
          message: `Unknown rule: '${ruleId}'. Run 'claudelint list-rules' to see available rules.`,
          ruleId,
          severity: 'error',
        });
      } else {
        const rule = RuleRegistry.getRule(ruleId);
        if (rule && isRuleDeprecated(rule)) {
          const replacements = getReplacementRuleIds(rule);
          const replacementMsg =
            replacements.length > 0 ? ` Use '${replacements.join("', '")}' instead.` : '';
          errors.push({
            message: `Rule '${ruleId}' is deprecated.${replacementMsg}`,
            ruleId,
            severity: 'warning',
          });
        }
      }
    }
  }

  // Validate overrides
  if (config.overrides) {
    for (let i = 0; i < config.overrides.length; i++) {
      const override = config.overrides[i];
      if (!override.files || override.files.length === 0) {
        errors.push({
          message: `Override at index ${i} has no file patterns`,
          severity: 'error',
        });
      }
      if (override.rules) {
        for (const ruleId of Object.keys(override.rules)) {
          if (!RuleRegistry.exists(ruleId)) {
            errors.push({
              message: `Unknown rule in override: '${ruleId}'`,
              ruleId,
              severity: 'error',
            });
          }
        }
      }
    }
  }

  return errors;
}
