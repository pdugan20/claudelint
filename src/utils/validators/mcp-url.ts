/**
 * Shared MCP URL validation helpers
 *
 * Extracts the common validation logic used by all 6 MCP URL rules
 * (mcp-{sse,http,websocket}-{empty,invalid}-url). Each rule keeps its own
 * rule ID for per-transport disabling, but delegates to these helpers.
 */

import { RuleContext } from '../../types/rule';
import { containsEnvVar } from '../patterns';
import { formatError } from './helpers';
import { hasProperty, isObject, isString } from '../type-guards';

/**
 * Iterates MCP servers of a specific transport type, yielding the url string
 * for each one that has a string url field. Handles all the boilerplate:
 * file path check, JSON parsing, mcpServers extraction, type filtering.
 */
export function* mcpServerUrls(
  context: RuleContext,
  transportType: string
): Generator<{ url: string }> {
  const { filePath, fileContent } = context;

  if (!filePath.endsWith('.mcp.json')) {
    return;
  }

  let config: unknown;
  try {
    config = JSON.parse(fileContent);
  } catch {
    return;
  }

  if (!hasProperty(config, 'mcpServers') || !isObject(config.mcpServers)) {
    return;
  }

  for (const server of Object.values(config.mcpServers)) {
    if (!isObject(server)) continue;
    if (!hasProperty(server, 'type') || server.type !== transportType) continue;
    if (!hasProperty(server, 'url') || !isString(server.url)) continue;

    yield { url: server.url };
  }
}

/**
 * Iterates MCP servers of a specific transport type, yielding those
 * that are MISSING a url field entirely or have a non-string url.
 */
export function* mcpServersMissingUrl(
  context: RuleContext,
  transportType: string
): Generator<void> {
  const { filePath, fileContent } = context;

  if (!filePath.endsWith('.mcp.json')) {
    return;
  }

  let config: unknown;
  try {
    config = JSON.parse(fileContent);
  } catch {
    return;
  }

  if (!hasProperty(config, 'mcpServers') || !isObject(config.mcpServers)) {
    return;
  }

  for (const server of Object.values(config.mcpServers)) {
    if (!isObject(server)) continue;
    if (!hasProperty(server, 'type') || server.type !== transportType) continue;

    if (!hasProperty(server, 'url') || !isString(server.url)) {
      yield;
    }
  }
}

/**
 * Validates that a URL is well-formed. Skips env var placeholders
 * and empty/whitespace-only strings (handled by *-empty-url rules).
 * Reports via context.report() if the URL is invalid.
 */
export function validateMcpUrl(url: string, transportType: string, context: RuleContext): void {
  if (containsEnvVar(url)) return;
  if (url.trim().length === 0) return;

  try {
    new URL(url);
  } catch (error) {
    context.report({
      message: `Invalid URL in ${transportType} transport: ${formatError(error)}`,
    });
  }
}
