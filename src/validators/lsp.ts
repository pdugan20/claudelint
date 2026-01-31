import { JSONConfigValidator, JSONConfigValidatorOptions } from './json-config-base';
import { findLspFiles } from '../utils/filesystem/files';
import { z } from 'zod';
import { LSPConfigSchema } from '../schemas/lsp-config.schema';
import { ValidatorRegistry } from '../utils/validators/factory';

// Auto-register all rules
import '../rules';

/**
 * Options specific to LSP validator
 * Extends JSONConfigValidatorOptions with no additional options
 */
export type LSPValidatorOptions = JSONConfigValidatorOptions;

/**
 * Validates LSP (Language Server Protocol) configuration files
 */
export class LSPValidator extends JSONConfigValidator<typeof LSPConfigSchema> {
  protected findConfigFiles(basePath: string): Promise<string[]> {
    return findLspFiles(basePath);
  }

  protected getSchema(): typeof LSPConfigSchema {
    return LSPConfigSchema;
  }

  protected getNoFilesMessage(): string {
    return 'No lsp.json files found';
  }

  protected async validateConfig(
    filePath: string,
    config: z.infer<typeof LSPConfigSchema>
  ): Promise<void> {
    // Read file content for rule execution
    const content = JSON.stringify(config, null, 2);

    // Execute ALL LSP rules via category-based discovery
    await this.executeRulesForCategory('LSP', filePath, content);
  }
}

// Register validator with factory
ValidatorRegistry.register(
  {
    id: 'lsp',
    name: 'LSP Validator',
    description: 'Validates LSP (Language Server Protocol) configuration files',
    filePatterns: ['**/.claude/lsp.json'],
    enabled: true,
  },
  (options) => new LSPValidator(options)
);
