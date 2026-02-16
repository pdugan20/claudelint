import { SchemaValidator, SchemaValidatorOptions } from './schema-validator';
import { findHooksFiles, readFileContent } from '../utils/filesystem/files';
import { z } from 'zod';
import { HooksConfigSchema } from './schemas';
import { ValidatorRegistry } from '../utils/validators/factory';

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
    return 'no hooks.json';
  }

  protected async validateSemantics(
    filePath: string,
    _config: z.infer<typeof HooksConfigSchema>
  ): Promise<void> {
    // Read file content for rule execution
    const content = await readFileContent(filePath);

    // Execute ALL Hooks rules via category-based discovery
    // Rules cover: type validation, required fields, mutual exclusivity,
    // timeout validation (hooks-invalid-config), event name validation
    // (hooks-invalid-event), and script existence (hooks-missing-script)
    await this.executeRulesForCategory('Hooks', filePath, content);
  }
}

// Register validator with factory
ValidatorRegistry.register(
  {
    id: 'hooks',
    name: 'Hooks Validator',
    description: 'Validates Claude Code hooks.json files',
    filePatterns: ['hooks/hooks.json'],
    enabled: true,
  },
  (options) => new HooksValidator(options)
);
