/**
 * Type guard utilities for safe runtime type checking
 */

/**
 * Check if value is a plain object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Check if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Check if object has a specific property
 */
export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isObject(obj) && key in obj;
}

/**
 * Safely get MCP servers from context.data
 * Returns null if not present or invalid type
 */
export function getMCPServers(data: unknown): Record<string, unknown> | null {
  if (!hasProperty(data, 'mcpServers')) return null;
  if (!isObject(data.mcpServers)) return null;
  return data.mcpServers;
}

/**
 * Safely get a specific MCP server by name
 */
export function getMCPServer(data: unknown, serverName: string): Record<string, unknown> | null {
  const servers = getMCPServers(data);
  if (!servers) return null;

  const server = servers[serverName];
  if (!isObject(server)) return null;

  return server;
}

/**
 * Safely get LSP servers from context.data
 */
export function getLSPServers(data: unknown): Record<string, unknown> | null {
  if (!hasProperty(data, 'lspServers')) return null;
  if (!isObject(data.lspServers)) return null;
  return data.lspServers;
}

/**
 * Safely get LSP server configuration
 */
export function getLSPServerConfig(data: unknown): Record<string, unknown> | null {
  if (!hasProperty(data, 'lspConfig')) return null;
  if (!isObject(data.lspConfig)) return null;
  return data.lspConfig;
}

/**
 * Safely get a specific LSP server by name
 */
export function getLSPServer(data: unknown, serverName: string): Record<string, unknown> | null {
  const config = getLSPServerConfig(data);
  if (!config) return null;

  if (!hasProperty(config, 'servers')) return null;
  if (!isObject(config.servers)) return null;

  const server = config.servers[serverName];
  if (!isObject(server)) return null;

  return server;
}

/**
 * Safely get plugins from context.data
 */
export function getPlugins(data: unknown): Record<string, unknown> | null {
  if (!hasProperty(data, 'plugins')) return null;
  if (!isObject(data.plugins)) return null;
  return data.plugins;
}

/**
 * Safely get a specific plugin by name
 */
export function getPlugin(data: unknown, pluginName: string): Record<string, unknown> | null {
  const plugins = getPlugins(data);
  if (!plugins) return null;

  const plugin = plugins[pluginName];
  if (!isObject(plugin)) return null;

  return plugin;
}

/**
 * Safely get settings from context.data
 */
export function getSettings(data: unknown): Record<string, unknown> | null {
  if (!hasProperty(data, 'settings')) return null;
  if (!isObject(data.settings)) return null;
  return data.settings;
}

/**
 * Safely get extension mapping from settings
 */
export function getExtensionMapping(data: unknown): Record<string, unknown> | null {
  const settings = getSettings(data);
  if (!settings) return null;

  if (!hasProperty(settings, 'extensionMapping')) return null;
  if (!isObject(settings.extensionMapping)) return null;

  return settings.extensionMapping;
}
