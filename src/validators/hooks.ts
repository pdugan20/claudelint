import { JSONConfigValidator, JSONConfigValidatorOptions } from './json-config-validator';
import { findHooksFiles, readFileContent } from '../utils/file-system';
import { z } from 'zod';
import { HooksConfigSchema } from './schemas';
import { ValidatorRegistry } from '../utils/validator-factory';
import { validateHook as validateHookHelper } from '../utils/validation-helpers';

// Auto-register all rules
import '../rules';

// Import new-style rules
import { rule as hooksInvalidEventRule } from '../rules/hooks/hooks-invalid-event';
import { rule as hooksMissingScriptRule } from '../rules/hooks/hooks-missing-script';
import { rule as hooksInvalidConfigRule } from '../rules/hooks/hooks-invalid-config';

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
    // Read file content for rule execution
    const content = await readFileContent(filePath);

    // NEW: Execute new-style rules (these handle registered rule IDs)
    await this.executeRule(hooksInvalidEventRule, filePath, content);
    await this.executeRule(hooksMissingScriptRule, filePath, content);
    await this.executeRule(hooksInvalidConfigRule, filePath, content);

    // OLD: Keep additional validation not covered by registered rules
    for (const hook of config.hooks) {
      // Use shared validation utility for common checks
      const issues = validateHookHelper(hook);
      for (const issue of issues) {
        if (issue.severity === 'warning') {
          this.reportWarning(issue.message, filePath, undefined, issue.ruleId);
        } else {
          this.reportError(issue.message, filePath, undefined, issue.ruleId);
        }
      }

      // Validate matcher tool name
      if (hook.matcher?.tool) {
        this.validateToolName(hook.matcher.tool, filePath, 'tool in matcher');
      }
    }
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
