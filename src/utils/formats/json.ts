/**
 * JSON utility functions for validation rules
 */

/**
 * Safely parses JSON content, returning null on parse errors
 *
 * Used by JSON-based rules (LSP, Plugin, Settings, Hooks, MCP) to reduce
 * boilerplate try-catch blocks.
 *
 * @param content - The JSON string to parse
 * @returns Parsed JSON object, or null if parsing fails
 *
 * @example
 * const config = safeParseJSON(context.fileContent);
 * if (!config) return; // Parse error, skip validation
 *
 * // Use config safely
 * if (config.servers) { ... }
 */
export function safeParseJSON(content: string): any | null {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}
