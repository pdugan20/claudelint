import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { RuleRegistry } from './rule-registry';

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
 * Complete claude-code-lint configuration
 */
export interface ClaudeLintConfig {
  /** Rule configurations (rule-id -> config) */
  rules?: Record<string, RuleConfig | 'off' | 'warn' | 'error'>;
  /** File-specific overrides */
  overrides?: ConfigOverride[];
  /** Glob patterns for files/directories to ignore */
  ignorePatterns?: string[];
  /** Output formatting options */
  output?: {
    format?: 'stylish' | 'json' | 'compact';
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
  const configNames = [
    '.claudelintrc.json',
    '.claudelintrc.yaml',
    '.claudelintrc.yml',
    'claude-code-lint.config.js',
    'package.json',
  ];

  let currentDir = startDir;
  const root = '/';

  while (currentDir !== root) {
    for (const configName of configNames) {
      const configPath = join(currentDir, configName);
      if (existsSync(configPath)) {
        // If package.json, check if it has claude-code-lint config
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

  if (ext === 'yaml' || ext === 'yml') {
    // For now, just support JSON. YAML support can be added later with a library
    throw new Error('YAML config files not yet supported. Use .claudelintrc.json instead.');
  }

  if (ext === 'js') {
    // For now, just support JSON. JS support can be added later with dynamic import
    throw new Error('JavaScript config files not yet supported. Use .claudelintrc.json instead.');
  }

  return {};
}

/**
 * Merge config with defaults
 */
export function mergeConfig(
  userConfig: ClaudeLintConfig,
  defaults: Partial<ClaudeLintConfig>
): ClaudeLintConfig {
  return {
    rules: { ...defaults.rules, ...userConfig.rules },
    overrides: userConfig.overrides || defaults.overrides || [],
    ignorePatterns: userConfig.ignorePatterns || defaults.ignorePatterns || [],
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

  // Validate rules
  if (config.rules) {
    for (const ruleId of Object.keys(config.rules)) {
      if (!RuleRegistry.exists(ruleId)) {
        errors.push({
          message: `Unknown rule: '${ruleId}'. Run 'claude-code-lint list-rules' to see available rules.`,
          ruleId,
          severity: 'error',
        });
      } else {
        const rule = RuleRegistry.get(ruleId);
        if (rule?.deprecated) {
          const replacementMsg = rule.replacedBy
            ? ` Use '${rule.replacedBy.join("', '")}' instead.`
            : '';
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
