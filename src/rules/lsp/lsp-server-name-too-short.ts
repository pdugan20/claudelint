/**
 * Rule: lsp-server-name-too-short
 *
 * Validates that LSP server names are descriptive
 *
 * Server names should be descriptive to improve readability and
 * maintainability of LSP configuration files.
 *
 * Options:
 * - minLength: Minimum server name length (default: 2)
 */

import { Rule, RuleContext } from '../../types/rule';
import { safeParseJSON } from '../../utils/formats/json';
import { z } from 'zod';

/**
 * Options for lsp-server-name-too-short rule
 */
export interface LspServerNameTooShortOptions {
  /** Minimum server name length (default: 2) */
  minLength?: number;
}

export const rule: Rule = {
  meta: {
    id: 'lsp-server-name-too-short',
    name: 'LSP Server Name Too Short',
    description: 'LSP server names should be descriptive',
    category: 'LSP',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/lsp/lsp-server-name-too-short.md',
    schema: z.object({
      minLength: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      minLength: 2,
    },
  },
  validate: (context: RuleContext) => {
    const { filePath, fileContent, options } = context;

    // Only validate lsp.json files
    if (!filePath.endsWith('lsp.json')) {
      return;
    }

    const ruleOptions = options as LspServerNameTooShortOptions;
    const minLength = ruleOptions?.minLength ?? 2;

    const config = safeParseJSON(fileContent);
    if (!config || !config.servers) {
      return; // Invalid JSON handled by schema validation
    }

    // Check each server name
    for (const serverName of Object.keys(config.servers)) {
      if (serverName.length < minLength) {
        context.report({
          message: `LSP server name "${serverName}" is too short (${serverName.length} characters). Use descriptive names like "typescript-language-server". (minimum: ${minLength})`,
        });
      }
    }
  },
};
