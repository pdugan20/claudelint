/**
 * LSP config schema
 */

import { z } from 'zod';

/**
 * LSP transport types
 */
const LSPTransportType = z.enum(['stdio', 'socket']);

/**
 * LSP server configuration (inline)
 */
const LSPServerInlineSchema = z.object({
  command: z.string().min(1, 'Command cannot be empty'),
  args: z.array(z.string()).optional(),
  env: z.record(z.string()).optional(),
  transport: LSPTransportType.optional(),
});

/**
 * LSP server configuration (file reference)
 */
const LSPServerFileSchema = z.object({
  configFile: z.string().min(1, 'Config file path cannot be empty'),
});

/**
 * LSP server configuration (either inline or file)
 * Uses superRefine to validate that both aren't present
 */
const LSPServerSchema = z
  .object({
    command: z.string().optional(),
    configFile: z.string().optional(),
    args: z.array(z.string()).optional(),
    env: z.record(z.string()).optional(),
    transport: LSPTransportType.optional(),
  })
  .superRefine((data, ctx) => {
    // Must have either command or configFile, but not both
    const hasCommand = data.command !== undefined;
    const hasConfigFile = data.configFile !== undefined;

    if (hasCommand && hasConfigFile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Server cannot have both inline config (command) and configFile',
      });
    }

    if (!hasCommand && !hasConfigFile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Server must have either command or configFile',
      });
    }

    // If using inline config, command must not be empty
    if (hasCommand && data.command!.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Command cannot be empty',
        path: ['command'],
      });
    }

    // If using file config, configFile must not be empty
    if (hasConfigFile && data.configFile!.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Config file path cannot be empty',
        path: ['configFile'],
      });
    }
  });

/**
 * Extension to language mapping
 */
const ExtensionMappingSchema = z.record(
  z.string().regex(/^\.[a-z0-9]+$/, 'Extension must start with "." and be lowercase'),
  z.string().min(1, 'Language ID cannot be empty')
);

/**
 * Full LSP configuration schema
 */
export const LSPConfigSchema = z.object({
  servers: z.record(z.string(), LSPServerSchema),
  extensionMapping: ExtensionMappingSchema.optional(),
});

export type LSPConfig = z.infer<typeof LSPConfigSchema>;
export type LSPServerInline = z.infer<typeof LSPServerInlineSchema>;
export type LSPServerFile = z.infer<typeof LSPServerFileSchema>;
export type LSPServer = z.infer<typeof LSPServerSchema>;
