import { JSONConfigValidator, JSONConfigValidatorOptions } from './json-config-validator';
import { findHooksFiles, fileExists } from '../utils/file-system';
import { z } from 'zod';
import { dirname, join, resolve } from 'path';
import { HookSchema, HooksConfigSchema, MatcherSchema } from './schemas';
// Import rules to ensure they're registered
import '../rules';
import { ValidatorRegistry } from '../utils/validator-factory';
import {
  validateHook as validateHookHelper,
  hasVariableExpansion,
} from '../utils/validation-helpers';

/**
 * Options specific to Hooks validator
 * Extends JSONConfigValidatorOptions with no additional options
 */
export type HooksValidatorOptions = JSONConfigValidatorOptions;

/**
 * Validates Claude Code hooks.json files
 */
export class HooksValidator extends JSONConfigValidator<typeof HooksConfigSchema> {
  protected findConfigFiles(basePath: string): Promise<string[]> {
    return findHooksFiles(basePath);
  }

  protected getSchema(): typeof HooksConfigSchema {
    return HooksConfigSchema;
  }

  protected getNoFilesMessage(): string {
    return 'No hooks.json files found';
  }

  protected async validateConfig(
    filePath: string,
    config: z.infer<typeof HooksConfigSchema>
  ): Promise<void> {
    for (const hook of config.hooks) {
      await this.validateHook(filePath, hook);
    }
  }

  private async validateHook(filePath: string, hook: z.infer<typeof HookSchema>): Promise<void> {
    // Use shared validation utility for common checks
    const issues = validateHookHelper(hook);
    for (const issue of issues) {
      if (issue.severity === 'warning') {
        this.reportWarning(issue.message, filePath, undefined, issue.ruleId);
      } else {
        this.reportError(issue.message, filePath, undefined, issue.ruleId);
      }
    }

    // Validate command script exists if it's a file path
    if (hook.type === 'command' && hook.command) {
      await this.validateCommandScript(filePath, hook.command);
    }

    // Validate matcher tool name (requires validator context)
    if (hook.matcher) {
      this.validateMatcher(filePath, hook.matcher);
    }
  }

  private validateMatcher(filePath: string, matcher: z.infer<typeof MatcherSchema>): void {
    // Validate tool name (regex pattern validation is handled by shared utility)
    if (matcher.tool) {
      this.validateToolName(matcher.tool, filePath, 'tool in matcher');
    }
  }

  private async validateCommandScript(filePath: string, command: string): Promise<void> {
    // Skip validation for inline commands (contain spaces or shell operators)
    if (
      command.includes(' ') ||
      command.includes('&&') ||
      command.includes('||') ||
      command.includes('|')
    ) {
      return;
    }

    // Skip validation for commands with variables
    if (hasVariableExpansion(command)) {
      return;
    }

    // Check if it's a relative path script
    if (command.startsWith('./') || command.startsWith('../')) {
      const baseDir = dirname(filePath);
      const scriptPath = resolve(join(baseDir, command));

      const exists = await fileExists(scriptPath);
      if (!exists) {
        this.reportError(`Hook script not found: ${command}`, filePath, undefined, 'hooks-missing-script');
        return;
      }

      // TODO: Could add executability check on Unix systems
      // For now, just check existence
    }

    // For absolute paths or commands in PATH, we can't reliably check without executing
    // So we skip validation for those
  }
}

// Register validator with factory
ValidatorRegistry.register(
  {
    id: 'hooks',
    name: 'Hooks Validator',
    description: 'Validates Claude Code hooks.json files',
    filePatterns: ['**/.claude/hooks.json'],
    enabled: true,
  },
  (options) => new HooksValidator(options)
);
