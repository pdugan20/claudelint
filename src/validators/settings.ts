import { JSONConfigValidator, JSONConfigValidatorOptions } from './json-config-validator';
import { findSettingsFiles, fileExists, readFileContent } from '../utils/file-system';
import { z } from 'zod';
import { SettingsSchema, PermissionRuleSchema, HookSchema } from './schemas';
import { ValidatorRegistry } from '../utils/validator-factory';
import {
  validateHook as validateHookHelper,
  hasVariableExpansion,
} from '../utils/validation-helpers';

// Auto-register all rules
import '../rules';

// Import new-style rules
import { rule as settingsInvalidPermissionRule } from '../rules/settings/settings-invalid-permission';
import { rule as settingsPermissionInvalidRuleRule } from '../rules/settings/settings-permission-invalid-rule';
import { rule as settingsPermissionEmptyPatternRule } from '../rules/settings/settings-permission-empty-pattern';
import { rule as settingsInvalidEnvVarRule } from '../rules/settings/settings-invalid-env-var';

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
    // Read file content for rule execution
    const content = await readFileContent(filePath);

    // NEW: Execute new-style rules
    await this.executeRule(settingsInvalidPermissionRule, filePath, content);
    await this.executeRule(settingsPermissionInvalidRuleRule, filePath, content);
    await this.executeRule(settingsPermissionEmptyPatternRule, filePath, content);
    await this.executeRule(settingsInvalidEnvVarRule, filePath, content);

    // OLD: Keep additional validation not covered by registered rules
    // Validate permission rules - tool name validation only
    if (settings.permissions) {
      for (const rule of settings.permissions) {
        this.validatePermissionRuleToolName(filePath, rule);
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

    // Validate output style path
    if (settings.outputStyle) {
      await this.validateFilePath(filePath, settings.outputStyle, 'outputStyle');
    }
  }

  private validatePermissionRuleToolName(
    filePath: string,
    rule: z.infer<typeof PermissionRuleSchema>
  ): void {
    // Parse Tool(pattern) syntax if present to extract tool name
    const toolPatternMatch = rule.tool.match(/^([^(]+)\(([^)]*)\)$/);
    const toolName = toolPatternMatch ? toolPatternMatch[1].trim() : rule.tool;

    // Validate tool name (not part of registered rules)
    this.validateToolName(toolName, filePath, 'tool in permission rule');
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
