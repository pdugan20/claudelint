/**
 * LSP config schema
 * Based on https://code.claude.com/docs/en/plugins-reference#lsp-servers
 */

import { z } from 'zod';

/**
 * LSP transport types
 */
const LSPTransportType = z.enum(['stdio', 'socket']);

/**
 * LSP server configuration
 * Server name is the key in the config object (not a field)
 */
const LSPServerSchema = z.object({
  // Required fields
  command: z.string().min(1, 'Command cannot be empty'),
  extensionToLanguage: z.record(
    z.string().regex(/^\.[a-z0-9]+$/, 'Extension must start with "." and be lowercase'),
    z.string().min(1, 'Language ID cannot be empty')
  ),

  // Optional fields
  args: z.array(z.string()).optional(),
  transport: LSPTransportType.optional(),
  env: z.record(z.string()).optional(),
  initializationOptions: z.record(z.unknown()).optional(),
  settings: z.record(z.unknown()).optional(),
  workspaceFolder: z.string().optional(),
  startupTimeout: z.number().min(0).optional(),
  shutdownTimeout: z.number().min(0).optional(),
  restartOnCrash: z.boolean().optional(),
  maxRestarts: z.number().min(0).optional(),
});

/**
 * Full LSP configuration schema (.lsp.json)
 * Maps server names to their configurations (flat structure)
 */
export const LSPConfigSchema = z.record(z.string(), LSPServerSchema);

export type LSPConfig = z.infer<typeof LSPConfigSchema>;
export type LSPServer = z.infer<typeof LSPServerSchema>;
