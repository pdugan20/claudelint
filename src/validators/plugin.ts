import { SchemaValidator, SchemaValidatorOptions } from './schema-validator';
import { findMarketplaceManifests, findPluginManifests } from '../utils/filesystem/files';
import { basename } from 'path';
import { z } from 'zod';
import { PluginManifestSchema } from './schemas';
import { ValidatorRegistry } from '../utils/validators/factory';

// Auto-register all rules
import '../rules';

/**
 * Options specific to Plugin validator
 * Extends SchemaValidatorOptions with no additional options
 */
export type PluginValidatorOptions = SchemaValidatorOptions;

/**
 * Validates Claude Code plugin manifests (plugin.json) and marketplace manifests
 * (.claude-plugin/marketplace.json)
 */
export class PluginValidator extends SchemaValidator<typeof PluginManifestSchema> {
  protected async findConfigFiles(basePath: string): Promise<string[]> {
    const [manifests, marketplaces] = await Promise.all([
      findPluginManifests(basePath),
      findMarketplaceManifests(basePath),
    ]);
    return [...manifests, ...marketplaces];
  }

  protected getSchema(): typeof PluginManifestSchema {
    return PluginManifestSchema;
  }

  protected getNoFilesMessage(): string {
    return 'no plugin.json';
  }

  /**
   * marketplace.json is not a plugin manifest — it has owner/plugins and legitimately lacks
   * plugin fields. Validating it against PluginManifestSchema would emit misleading errors,
   * so it skips the schema step; plugin-invalid-marketplace-manifest validates it against
   * MarketplaceMetadataSchema instead.
   */
  protected isSchemaExempt(filePath: string): boolean {
    return basename(filePath) === 'marketplace.json';
  }

  protected async validateSchemaExemptFile(filePath: string, content: string): Promise<void> {
    await this.executeRulesForCategory('Plugin', filePath, content);
  }

  protected async validateSemantics(
    filePath: string,
    _plugin: z.infer<typeof PluginManifestSchema>
  ): Promise<void> {
    // Read file content for rule execution
    const content = await this.readContent(filePath);

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
