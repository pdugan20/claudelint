/**
 * Rule: lsp-extension-missing-dot
 *
 * Validates that extension mappings start with a dot
 *
 * File extensions must start with a dot (e.g., ".ts") to be recognized
 * correctly by the LSP system.
 */

import { Rule, RuleContext } from '../../types/rule';
import { safeParseJSON } from '../../utils/formats/json';
import { hasProperty, isObject } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'lsp-extension-missing-dot',
    name: 'LSP Extension Missing Dot',
    description: 'LSP extension mappings must start with a dot',
    category: 'LSP',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/lsp/lsp-extension-missing-dot.md',
  },
  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate lsp.json files
    if (!filePath.endsWith('lsp.json')) {
      return;
    }

    const config = safeParseJSON(fileContent);
    if (!isObject(config)) {
      return; // Invalid JSON
    }

    // Check each server's extensionToLanguage mapping
    for (const [serverName, serverConfig] of Object.entries(config)) {
      if (!isObject(serverConfig)) {
        continue;
      }

      if (
        !hasProperty(serverConfig, 'extensionToLanguage') ||
        !isObject(serverConfig.extensionToLanguage)
      ) {
        continue;
      }

      // Check each extension in this server's mapping
      for (const extension of Object.keys(serverConfig.extensionToLanguage)) {
        if (!extension.startsWith('.')) {
          context.report({
            message: `Extension "${extension}" in server "${serverName}" must start with a dot (e.g., ".ts").`,
          });
        }
      }
    }
  },
};
