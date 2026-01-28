import { JSONConfigValidator, JSONConfigValidatorOptions } from './json-config-validator';
import { findPluginManifests, fileExists } from '../utils/file-system';
import { z } from 'zod';
import { SEMVER_PATTERN } from './constants';
import { PluginManifestSchema, MarketplaceMetadataSchema } from './schemas';
import { dirname, join } from 'path';
// Import rules to ensure they're registered
import '../rules';
import { ValidatorRegistry } from '../utils/validator-factory';

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

    // Validate required fields
    this.validateRequiredFields(filePath, plugin);

    // Validate version follows semver
    this.validateVersion(filePath, plugin.version);

    // Validate directory structure
    await this.validateDirectoryStructure(filePath);

    // Validate file references
    await this.validateFileReferences(filePath, plugin);

    // Validate dependencies
    if (plugin.dependencies) {
      this.validateDependencies(filePath, plugin);
    }

    // Warn about deprecated commands field
    if (plugin.commands && plugin.commands.length > 0) {
      this.reportWarning(
        'The "commands" field in plugin.json is deprecated. Please migrate to "skills" instead. ' +
        'Skills provide better structure, versioning, and documentation.',
        filePath,
        undefined,
        'commands-in-plugin-deprecated'
      );
    }

    // Validate marketplace.json if it exists
    await this.validateMarketplaceMetadata(filePath);
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

  private validateVersion(filePath: string, version: string): void {
    if (!SEMVER_PATTERN.test(version)) {
      this.reportError(
        `Invalid semantic version: ${version}. Must follow semver format (e.g., 1.0.0, 2.1.3-beta)`,
        filePath,
        undefined,
        'plugin-invalid-version'
      );
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

  private async validateFileReferences(
    filePath: string,
    plugin: z.infer<typeof PluginManifestSchema>
  ): Promise<void> {
    // Validate skills references
    if (plugin.skills) {
      for (const skillName of plugin.skills) {
        await this.validateSkillReference(filePath, skillName);
      }
    }

    // Validate agents references
    if (plugin.agents) {
      for (const agentName of plugin.agents) {
        await this.validateAgentReference(filePath, agentName);
      }
    }

    // Validate hooks references
    if (plugin.hooks) {
      for (const hookName of plugin.hooks) {
        await this.validateHookReference(filePath, hookName);
      }
    }

    // Validate commands references
    if (plugin.commands) {
      for (const commandName of plugin.commands) {
        await this.validateCommandReference(filePath, commandName);
      }
    }

    // Validate MCP servers references
    if (plugin.mcpServers) {
      for (const mcpServerName of plugin.mcpServers) {
        await this.validateMCPServerReference(filePath, mcpServerName);
      }
    }
  }

  private async validateSkillReference(filePath: string, skillName: string): Promise<void> {
    const skillPath = join(this.pluginRoot, '.claude', 'skills', skillName, 'SKILL.md');
    if (!(await fileExists(skillPath))) {
      this.reportError(
        `Referenced skill not found: ${skillName} (expected at ${skillPath})`,
        filePath,
        undefined,
        'plugin-missing-file'
      );
    }
  }

  private async validateAgentReference(filePath: string, agentName: string): Promise<void> {
    const agentPath = join(this.pluginRoot, '.claude', 'agents', `${agentName}.md`);
    if (!(await fileExists(agentPath))) {
      this.reportError(
        `Referenced agent not found: ${agentName} (expected at ${agentPath})`,
        filePath,
        undefined,
        'plugin-missing-file'
      );
    }
  }

  private async validateHookReference(filePath: string, hookName: string): Promise<void> {
    const hookPath = join(this.pluginRoot, '.claude', 'hooks', `${hookName}.json`);
    if (!(await fileExists(hookPath))) {
      this.reportError(
        `Referenced hook not found: ${hookName} (expected at ${hookPath})`,
        filePath,
        undefined,
        'plugin-missing-file'
      );
    }
  }

  private async validateCommandReference(filePath: string, commandName: string): Promise<void> {
    const commandPath = join(this.pluginRoot, '.claude', 'commands', `${commandName}.md`);
    if (!(await fileExists(commandPath))) {
      this.reportError(
        `Referenced command not found: ${commandName} (expected at ${commandPath})`,
        filePath,
        undefined,
        'plugin-missing-file'
      );
    }
  }

  private async validateMCPServerReference(filePath: string, mcpServerName: string): Promise<void> {
    // MCP servers can be defined in .mcp.json at the root
    const mcpConfigPath = join(this.pluginRoot, '.mcp.json');
    if (!(await fileExists(mcpConfigPath))) {
      this.reportWarning(
        `Referenced MCP server ${mcpServerName} but .mcp.json not found`,
        filePath
      );
    }
    // Note: We don't validate the actual server exists in the config here
    // That's the job of the MCP validator
  }

  private validateDependencies(
    filePath: string,
    plugin: z.infer<typeof PluginManifestSchema>
  ): void {
    if (!plugin.dependencies) {
      return;
    }

    const pluginName = plugin.name;
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    // Check each dependency
    for (const [depName, depVersion] of Object.entries(plugin.dependencies)) {
      // Validate dependency version is valid semver or range
      if (!this.isValidSemverRange(depVersion)) {
        this.reportWarning(
          `Invalid semver range for dependency "${depName}": ${depVersion}`,
          filePath,
          undefined,
          'plugin-dependency-invalid-version'
        );
      }

      // Check for direct self-dependency
      if (depName === pluginName) {
        this.reportError(
          `Circular dependency detected: ${pluginName} → ${depName}`,
          filePath,
          undefined,
          'plugin-circular-dependency'
        );
        continue;
      }

      // Check for circular dependencies through dependency chain
      if (this.hasCircularDependency(pluginName, depName, visited, recursionStack, new Map())) {
        this.reportError(
          `Circular dependency detected: ${pluginName} → ${depName} → ... → ${pluginName}`,
          filePath,
          undefined,
          'plugin-circular-dependency'
        );
      }
    }
  }

  private isValidSemverRange(version: string): boolean {
    // Basic semver range validation
    // Supports: exact (1.0.0), caret (^1.0.0), tilde (~1.0.0), range (>=1.0.0 <2.0.0)
    const semverRangePattern =
      /^(\^|~|>=?|<=?|=)?\s*\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\s+(<=?|>=?)\s*\d+\.\d+\.\d+)?$/;
    return semverRangePattern.test(version.trim());
  }

  private hasCircularDependency(
    _currentPlugin: string,
    targetDep: string,
    visited: Set<string>,
    recursionStack: Set<string>,
    _dependencyCache: Map<string, string[]>
  ): boolean {
    // If we've already checked this path, skip
    if (visited.has(targetDep)) {
      return false;
    }

    // If this dependency is in our current recursion stack, we have a cycle
    if (recursionStack.has(targetDep)) {
      return true;
    }

    // Mark this dependency as being processed
    recursionStack.add(targetDep);

    // In a real implementation, we would:
    // 1. Fetch the plugin manifest for targetDep from registry/marketplace
    // 2. Check its dependencies recursively
    // For now, we'll just mark as visited since we don't have a registry
    visited.add(targetDep);

    // Remove from recursion stack
    recursionStack.delete(targetDep);

    return false;
  }

  private async validateMarketplaceMetadata(filePath: string): Promise<void> {
    const marketplacePath = join(this.pluginRoot, 'marketplace.json');

    if (!(await fileExists(marketplacePath))) {
      // marketplace.json is optional
      return;
    }

    // Read and validate marketplace.json
    const marketplaceData = await this.readAndParseJSON(marketplacePath);
    if (!marketplaceData) {
      return;
    }

    const result = MarketplaceMetadataSchema.safeParse(marketplaceData);
    if (!result.success) {
      for (const issue of result.error.issues) {
        this.reportError(`marketplace.json: ${issue.path.join('.')}: ${issue.message}`, filePath, undefined, 'plugin-invalid-manifest');
      }
      return;
    }

    // Validate that marketplace version matches plugin version
    const pluginData = await this.readAndParseJSON(filePath);
    if (pluginData && typeof pluginData === 'object' && 'version' in pluginData) {
      const pluginVersion = (pluginData as { version: string }).version;
      if (result.data.version !== pluginVersion) {
        this.reportWarning(
          `marketplace.json version (${result.data.version}) does not match plugin.json version (${pluginVersion})`,
          filePath
        );
      }
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
