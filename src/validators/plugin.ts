import { JSONConfigValidator, JSONConfigValidatorOptions } from './json-config-base';
import { findPluginManifests, readFileContent } from '../utils/filesystem/files';
import { z } from 'zod';
import { PluginManifestSchema } from './schemas';
import { ValidatorRegistry } from '../utils/validators/factory';

// Auto-register all rules
import '../rules';

/**
 * Options specific to Plugin validator
 * Extends JSONConfigValidatorOptions with no additional options
 */
export type PluginValidatorOptions = JSONConfigValidatorOptions;

/**
 * Validates Claude Code plugin manifests (plugin.json)
 */
export class PluginValidator extends JSONConfigValidator<typeof PluginManifestSchema> {
  protected findConfigFiles(basePath: string): Promise<string[]> {
    return findPluginManifests(basePath);
  }

  protected getSchema(): typeof PluginManifestSchema {
    return PluginManifestSchema;
  }

  protected getNoFilesMessage(): string {
    return 'No plugin.json files found';
  }

  protected async validateConfig(
    filePath: string,
    _plugin: z.infer<typeof PluginManifestSchema>
  ): Promise<void> {
    // Read file content for rule execution
    const content = await readFileContent(filePath);

    // Execute ALL Plugin rules via category-based discovery
    // This includes: plugin.json validation, marketplace.json file references, and all other validations
    await this.executeRulesForCategory('Plugin', filePath, content);
  }
}

// Register validator with factory
ValidatorRegistry.register(
  {
    id: 'plugin',
    name: 'Plugin Validator',
    description: 'Validates Claude Code plugin manifests (plugin.json)',
    filePatterns: ['**/plugin.json', '**/.claude-plugin/marketplace.json'],
    enabled: true,
  },
  (options) => new PluginValidator(options)
);
