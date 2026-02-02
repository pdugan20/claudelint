import { SchemaValidator, SchemaValidatorOptions } from './schema-validator';
import { findSettingsFiles, readFileContent } from '../utils/filesystem/files';
import { z } from 'zod';
import { SettingsSchema } from './schemas';
import { ValidatorRegistry } from '../utils/validators/factory';
import { validateSettingsHooks } from '../utils/validators/helpers';

// Auto-register all rules
import '../rules';

/**
 * Options specific to Settings validator
 * Extends SchemaValidatorOptions with no additional options
 */
export type SettingsValidatorOptions = SchemaValidatorOptions;

/**
 * Validates Claude Code settings.json files
 */
export class SettingsValidator extends SchemaValidator<typeof SettingsSchema> {
  protected findConfigFiles(basePath: string): Promise<string[]> {
    return findSettingsFiles(basePath);
  }

  protected getSchema(): typeof SettingsSchema {
    return SettingsSchema;
  }

  protected getNoFilesMessage(): string {
    return 'No settings.json files found';
  }

  protected async validateSemantics(
    filePath: string,
    settings: z.infer<typeof SettingsSchema>
  ): Promise<void> {
    // Read file content for rule execution
    const content = await readFileContent(filePath);

    // Execute ALL Settings rules via category-based discovery
    await this.executeRulesForCategory('Settings', filePath, content);

    // Validate hooks (settings.json uses object format with event keys)
    if (settings.hooks) {
      const issues = validateSettingsHooks(settings.hooks);
      for (const issue of issues) {
        this.report(issue.message, filePath, undefined, issue.ruleId);
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
