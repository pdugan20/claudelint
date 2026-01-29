import { JSONConfigValidator, JSONConfigValidatorOptions } from './json-config-validator';
import { findPluginManifests, fileExists } from '../utils/file-system';
import { z } from 'zod';
import { PluginManifestSchema, MarketplaceMetadataSchema } from './schemas';
import { dirname, join } from 'path';
import { ValidatorRegistry } from '../utils/validator-factory';
import { readFileContent } from '../utils/file-system';

// Auto-register all rules
import '../rules';

// Import new-style rules
import { rule as pluginInvalidVersionRule } from '../rules/plugin/plugin-invalid-version';
import { rule as commandsInPluginDeprecatedRule } from '../rules/plugin/commands-in-plugin-deprecated';
import { rule as pluginDependencyInvalidVersionRule } from '../rules/plugin/plugin-dependency-invalid-version';
import { rule as pluginCircularDependencyRule } from '../rules/plugin/plugin-circular-dependency';
import { rule as pluginMissingFileRule } from '../rules/plugin/plugin-missing-file';
import { rule as pluginInvalidManifestRule } from '../rules/plugin/plugin-invalid-manifest';

/**
 * Options specific to Plugin validator
 * Extends JSONConfigValidatorOptions with no additional options
 */
export type PluginValidatorOptions = JSONConfigValidatorOptions;

/**
 * Validates Claude Code plugin manifests (plugin.json)
 */
export class PluginValidator extends JSONConfigValidator<typeof PluginManifestSchema> {
  private pluginRoot = '';

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
    plugin: z.infer<typeof PluginManifestSchema>
  ): Promise<void> {
    // Store plugin root for file path resolution
    this.pluginRoot = dirname(filePath);

    // Read file content for rule execution
    const content = await readFileContent(filePath);

    // NEW: Execute new-style rules
    await this.executeRule(pluginInvalidVersionRule, filePath, content);
    await this.executeRule(commandsInPluginDeprecatedRule, filePath, content);
    await this.executeRule(pluginDependencyInvalidVersionRule, filePath, content);
    await this.executeRule(pluginCircularDependencyRule, filePath, content);
    await this.executeRule(pluginMissingFileRule, filePath, content);
    await this.executeRule(pluginInvalidManifestRule, filePath, content);

    // OLD: Keep additional validation not covered by registered rules
    // Validate required fields (schema may not catch empty strings)
    this.validateRequiredFields(filePath, plugin);

    // Validate directory structure (not a registered rule)
    await this.validateDirectoryStructure(filePath);

    // Validate marketplace.json file references (warnings for missing icon, screenshots, etc.)
    await this.validateMarketplaceFiles(filePath);
  }

  private validateRequiredFields(
    filePath: string,
    plugin: z.infer<typeof PluginManifestSchema>
  ): void {
    if (!plugin.name || plugin.name.trim().length === 0) {
      this.reportError('Plugin name is required and cannot be empty', filePath);
    }

    if (!plugin.version || plugin.version.trim().length === 0) {
      this.reportError('Plugin version is required and cannot be empty', filePath);
    }

    if (!plugin.description || plugin.description.trim().length === 0) {
      this.reportError('Plugin description is required and cannot be empty', filePath);
    }
  }


  private async validateDirectoryStructure(filePath: string): Promise<void> {
    // Check that plugin.json is at root, not in .claude-plugin/
    if (filePath.includes('.claude-plugin/')) {
      this.reportError(
        'plugin.json should be at the repository root, not inside .claude-plugin/',
        filePath
      );
    }

    // Plugin components should be at root level
    const componentsToCheck = ['skills', 'agents', 'hooks', 'commands'];
    for (const component of componentsToCheck) {
      const wrongPath = join(this.pluginRoot, '.claude-plugin', component);

      if (await fileExists(wrongPath)) {
        this.reportWarning(
          `${component} directory should be in .claude/${component}, not .claude-plugin/${component}`,
          filePath
        );
      }
    }
  }



  private async validateMarketplaceFiles(_filePath: string): Promise<void> {
    const marketplacePath = join(this.pluginRoot, 'marketplace.json');

    if (!(await fileExists(marketplacePath))) {
      // marketplace.json is optional
      return;
    }

    // Read and parse marketplace.json
    const marketplaceData = await this.readAndParseJSON(marketplacePath);
    if (!marketplaceData) {
      return;
    }

    const result = MarketplaceMetadataSchema.safeParse(marketplaceData);
    if (!result.success) {
      return; // Schema validation handled by plugin-invalid-manifest rule
    }

    // Validate icon path if present
    if (result.data.icon) {
      const iconPath = join(this.pluginRoot, result.data.icon);
      if (!(await fileExists(iconPath))) {
        this.reportWarning(`Icon file not found: ${result.data.icon}`, marketplacePath);
      }
    }

    // Validate screenshot paths if present
    if (result.data.screenshots) {
      for (const screenshot of result.data.screenshots) {
        const screenshotPath = join(this.pluginRoot, screenshot);
        if (!(await fileExists(screenshotPath))) {
          this.reportWarning(`Screenshot file not found: ${screenshot}`, marketplacePath);
        }
      }
    }

    // Validate readme path if present
    if (result.data.readme) {
      const readmePath = join(this.pluginRoot, result.data.readme);
      if (!(await fileExists(readmePath))) {
        this.reportWarning(`Readme file not found: ${result.data.readme}`, marketplacePath);
      }
    }

    // Validate changelog path if present
    if (result.data.changelog) {
      const changelogPath = join(this.pluginRoot, result.data.changelog);
      if (!(await fileExists(changelogPath))) {
        this.reportWarning(`Changelog file not found: ${result.data.changelog}`, marketplacePath);
      }
    }
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
