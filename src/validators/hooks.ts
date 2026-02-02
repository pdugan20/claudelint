import { SchemaValidator, SchemaValidatorOptions } from './schema-validator';
import { findHooksFiles, readFileContent } from '../utils/filesystem/files';
import { z } from 'zod';
import { HooksConfigSchema } from './schemas';
import { ValidatorRegistry } from '../utils/validators/factory';
import { validateHook as validateHookHelper } from '../utils/validators/helpers';

// Auto-register all rules
import '../rules';

/**
 * Options specific to Hooks validator
 * Extends SchemaValidatorOptions with no additional options
 */
export type HooksValidatorOptions = SchemaValidatorOptions;

/**
 * Validates Claude Code hooks.json files
 */
export class HooksValidator extends SchemaValidator<typeof HooksConfigSchema> {
  protected findConfigFiles(basePath: string): Promise<string[]> {
    return findHooksFiles(basePath);
  }

  protected getSchema(): typeof HooksConfigSchema {
    return HooksConfigSchema;
  }

  protected getNoFilesMessage(): string {
    return 'No hooks.json files found';
  }

  protected async validateSemantics(
    filePath: string,
    config: z.infer<typeof HooksConfigSchema>
  ): Promise<void> {
    // Read file content for rule execution
    const content = await readFileContent(filePath);

    // Execute ALL Hooks rules via category-based discovery
    await this.executeRulesForCategory('Hooks', filePath, content);

    // Keep additional validation not covered by registered rules
    for (const hook of config.hooks) {
      // Use shared validation utility for common checks
      const issues = validateHookHelper(hook);
      for (const issue of issues) {
        this.report(issue.message, filePath, undefined, issue.ruleId);
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
