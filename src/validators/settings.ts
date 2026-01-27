import { JSONConfigValidator } from './json-config-validator';
import { findSettingsFiles, fileExists } from '../utils/file-system';
import { z } from 'zod';
import { VALID_PERMISSION_ACTIONS } from './constants';
import { SettingsSchema, PermissionRuleSchema, HookSchema } from './schemas';
import { RuleRegistry } from '../utils/rule-registry';
import {
  validateEnvironmentVariables,
  validateHook as validateHookHelper,
} from '../utils/validation-helpers';

// Register Settings rules
RuleRegistry.register({
  id: 'settings-invalid-schema',
  name: 'Invalid Schema',
  description: 'Settings file does not match JSON schema',
  category: 'Settings',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'settings-invalid-permission',
  name: 'Invalid Permission',
  description: 'Permission rule has invalid action or pattern',
  category: 'Settings',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'settings-invalid-env-var',
  name: 'Invalid Environment Variable',
  description: 'Environment variable name or value is invalid',
  category: 'Settings',
  severity: 'warning',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

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
    // Validate tool name
    this.validateToolName(rule.tool, filePath, 'tool in permission rule');

    // Validate action
    if (!VALID_PERMISSION_ACTIONS.includes(rule.action)) {
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
    if (path.includes('${') || path.includes('$')) {
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
