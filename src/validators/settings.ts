import { JSONConfigValidator, JSONConfigValidatorOptions } from './json-config-validator';
import { findSettingsFiles, fileExists } from '../utils/file-system';
import { z } from 'zod';
import { VALID_PERMISSION_ACTIONS } from '../schemas/constants';
import { SettingsSchema, PermissionRuleSchema, HookSchema } from './schemas';
// Import rules to ensure they're registered
import '../rules';
import { ValidatorRegistry } from '../utils/validator-factory';
import {
  validateEnvironmentVariables,
  validateHook as validateHookHelper,
  hasVariableExpansion,
} from '../utils/validation-helpers';

/**
 * Options specific to Settings validator
 * Extends JSONConfigValidatorOptions with no additional options
 */
export type SettingsValidatorOptions = JSONConfigValidatorOptions;

/**
 * Validates Claude Code settings.json files
 */
export class SettingsValidator extends JSONConfigValidator<typeof SettingsSchema> {
  protected findConfigFiles(basePath: string): Promise<string[]> {
    return findSettingsFiles(basePath);
  }

  protected getSchema(): typeof SettingsSchema {
    return SettingsSchema;
  }

  protected getNoFilesMessage(): string {
    return 'No settings.json files found';
  }

  protected async validateConfig(
    filePath: string,
    settings: z.infer<typeof SettingsSchema>
  ): Promise<void> {
    // Validate permission rules
    if (settings.permissions) {
      for (const rule of settings.permissions) {
        this.validatePermissionRule(filePath, rule);
      }
    }

    // Validate hooks
    if (settings.hooks) {
      for (const hook of settings.hooks) {
        this.validateHook(filePath, hook);
      }
    }

    // Validate file paths
    if (settings.apiKeyHelper) {
      await this.validateFilePath(filePath, settings.apiKeyHelper, 'apiKeyHelper');
    }

    // Validate environment variables
    if (settings.env) {
      this.validateEnvironmentVariables(filePath, settings.env);
    }

    // Validate output style path
    if (settings.outputStyle) {
      await this.validateFilePath(filePath, settings.outputStyle, 'outputStyle');
    }
  }

  private validatePermissionRule(
    filePath: string,
    rule: z.infer<typeof PermissionRuleSchema>
  ): void {
    // Parse Tool(pattern) syntax if present
    const toolPatternMatch = rule.tool.match(/^([^(]+)\(([^)]*)\)$/);
    let toolName = rule.tool;
    let inlinePattern: string | null = null;

    if (toolPatternMatch) {
      toolName = toolPatternMatch[1].trim();
      inlinePattern = toolPatternMatch[2].trim();

      // Check if both inline pattern and separate pattern field are specified
      if (inlinePattern && rule.pattern) {
        this.reportError(
          `Permission rule has both inline pattern "${inlinePattern}" in tool field and separate pattern field "${rule.pattern}". ` +
          `Use only one format: either "tool": "${toolName}(${inlinePattern})" OR "tool": "${toolName}", "pattern": "${rule.pattern}"`,
          filePath,
          undefined,
          'settings-permission-invalid-rule'
        );
      }

      // Validate inline pattern
      if (inlinePattern !== null && inlinePattern.length === 0) {
        this.reportWarning(
          `Empty inline pattern in Tool(pattern) syntax: ${rule.tool}`,
          filePath,
          undefined,
          'settings-permission-invalid-rule'
        );
      }
    }

    // Validate tool name
    this.validateToolName(toolName, filePath, 'tool in permission rule');

    // Validate action
    if (!VALID_PERMISSION_ACTIONS.includes(rule.action as any)) {
      this.reportError(
        `Invalid permission action: ${rule.action}. Must be one of: ${VALID_PERMISSION_ACTIONS.join(', ')}`,
        filePath
      );
    }

    // Validate pattern if present
    if (rule.pattern) {
      // Basic pattern validation - could be enhanced
      if (rule.pattern.trim().length === 0) {
        this.reportWarning('Empty permission pattern', filePath);
      }
    }
  }

  private validateHook(filePath: string, hook: z.infer<typeof HookSchema>): void {
    // Use shared validation utility for common checks
    const issues = validateHookHelper(hook);
    for (const issue of issues) {
      if (issue.severity === 'warning') {
        this.reportWarning(issue.message, filePath, undefined, issue.ruleId);
      } else {
        this.reportError(issue.message, filePath, undefined, issue.ruleId);
      }
    }

    // Validate matcher tool if present (requires validator context)
    if (hook.matcher?.tool) {
      this.validateToolName(hook.matcher.tool, filePath, 'tool in hook matcher');
    }
  }

  private async validateFilePath(filePath: string, path: string, fieldName: string): Promise<void> {
    // Skip validation for paths with variables
    if (hasVariableExpansion(path)) {
      return;
    }

    const exists = await fileExists(path);
    if (!exists) {
      this.reportWarning(`${fieldName} file not found: ${path}`, filePath);
    }
  }

  private validateEnvironmentVariables(filePath: string, env: Record<string, string>): void {
    const issues = validateEnvironmentVariables(env);
    for (const issue of issues) {
      if (issue.severity === 'warning') {
        this.reportWarning(issue.message, filePath, undefined, issue.ruleId);
      } else {
        this.reportError(issue.message, filePath, undefined, issue.ruleId);
      }
    }
  }
}

// Register validator with factory
ValidatorRegistry.register(
  {
    id: 'settings',
    name: 'Settings Validator',
    description: 'Validates Claude Code settings.json files',
    filePatterns: ['**/.claude/settings.json'],
    enabled: true,
  },
  (options) => new SettingsValidator(options)
);
