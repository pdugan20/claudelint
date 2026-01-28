import { JSONConfigValidator, JSONConfigValidatorOptions } from './json-config-validator';
import { findLspFiles } from '../utils/file-system';
import { z } from 'zod';
import { LSPConfigSchema } from '../schemas/lsp-config.schema';
// Import rules to ensure they're registered
import '../rules';
import { ValidatorRegistry } from '../utils/validator-factory';

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

  // eslint-disable-next-line @typescript-eslint/require-await
  protected async validateConfig(
    filePath: string,
    config: z.infer<typeof LSPConfigSchema>
  ): Promise<void> {
    // Validate each LSP server configuration
    for (const [serverName, serverConfig] of Object.entries(config.servers)) {
      this.validateServerConfig(filePath, serverName, serverConfig);
    }

    // Validate extension mappings if present
    if (config.extensionMapping) {
      this.validateExtensionMapping(filePath, config.extensionMapping);
    }
  }

  private validateServerConfig(
    filePath: string,
    serverName: string,
    serverConfig: z.infer<typeof LSPConfigSchema>['servers'][string]
  ): void {
    // Server name should be descriptive
    if (serverName.length < 2) {
      this.reportWarning(
        `LSP server name "${serverName}" is too short. Use descriptive names like "typescript-language-server".`,
        filePath
      );
    }

    // Check for inline config (command-based)
    if ('command' in serverConfig && serverConfig.command) {
      this.validateInlineServerConfig(filePath, serverName, serverConfig);
    }

    // Check for file config (configFile-based)
    if ('configFile' in serverConfig && serverConfig.configFile) {
      this.validateFileServerConfig(filePath, serverName, serverConfig);
    }
  }

  private validateInlineServerConfig(
    filePath: string,
    serverName: string,
    serverConfig: z.infer<typeof LSPConfigSchema>['servers'][string]
  ): void {
    if (!serverConfig.command) {
      return;
    }

    // Warn if command might not be in PATH
    const commandName = serverConfig.command.split(' ')[0];
    if (!commandName.startsWith('/') && !commandName.startsWith('./')) {
      this.reportWarning(
        `LSP server "${serverName}" command "${commandName}" should be in PATH or use absolute path.`,
        filePath
      );
    }

    // Validate transport type if specified
    if ('transport' in serverConfig && serverConfig.transport) {
      if (serverConfig.transport !== 'stdio' && serverConfig.transport !== 'socket') {
        this.reportError(
          `Invalid transport type "${serverConfig.transport}" for server "${serverName}". Must be "stdio" or "socket".`,
          filePath
        );
      }
    }
  }

  private validateFileServerConfig(
    filePath: string,
    serverName: string,
    serverConfig: z.infer<typeof LSPConfigSchema>['servers'][string]
  ): void {
    if (!serverConfig.configFile) {
      return;
    }

    // Check if configFile path looks reasonable
    if (!serverConfig.configFile.endsWith('.json')) {
      this.reportWarning(
        `LSP server "${serverName}" configFile "${serverConfig.configFile}" should be a JSON file.`,
        filePath
      );
    }

    // Warn about relative paths
    if (!serverConfig.configFile.startsWith('/') && !serverConfig.configFile.startsWith('.')) {
      this.reportWarning(
        `LSP server "${serverName}" configFile "${serverConfig.configFile}" uses relative path. Consider using absolute or explicit relative path (./...).`,
        filePath
      );
    }
  }

  private validateExtensionMapping(
    filePath: string,
    extensionMapping: Record<string, string>
  ): void {
    for (const [extension, languageId] of Object.entries(extensionMapping)) {
      // Extension should start with dot
      if (!extension.startsWith('.')) {
        this.reportError(
          `Extension "${extension}" must start with a dot (e.g., ".ts").`,
          filePath
        );
      }

      // Language ID should not be empty
      if (!languageId || languageId.trim().length === 0) {
        this.reportError(
          `Language ID for extension "${extension}" cannot be empty.`,
          filePath
        );
      }

      // Language ID should be lowercase
      if (languageId !== languageId.toLowerCase()) {
        this.reportWarning(
          `Language ID "${languageId}" for extension "${extension}" should be lowercase.`,
          filePath
        );
      }
    }
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
