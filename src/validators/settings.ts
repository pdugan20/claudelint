import { SchemaValidator, SchemaValidatorOptions } from './schema-validator';
import { findSettingsFiles } from '../utils/filesystem/files';
import { z } from 'zod';
import { SettingsSchema } from './schemas';
import { ValidatorRegistry } from '../utils/validators/factory';

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
    return 'no settings.json';
  }

  protected async validateSemantics(
    filePath: string,
    settings: z.infer<typeof SettingsSchema>
  ): Promise<void> {
    // Read file content for rule execution
    const content = await this.readContent(filePath);

    // Execute ALL Settings rules via category-based discovery
    await this.executeRulesForCategory('Settings', filePath, content);

    // Run Hooks rules against the original content: schema parsing strips unknown event
    // names. Category execution also preserves rule IDs, severity overrides and disabling.
    if (settings.hooks) {
      await this.executeRulesForCategory('Hooks', filePath, content);
    }
  }
}

// Register validator with factory
ValidatorRegistry.register(
  {
    id: 'settings',
    name: 'Settings Validator',
    description: 'Validates Claude Code settings.json files',
    filePatterns: ['**/.claude/settings.json', '**/.claude/settings.local.json'],
    enabled: true,
  },
  (options) => new SettingsValidator(options)
);
