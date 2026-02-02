/**
 * Rule: lsp-language-id-empty
 *
 * Validates that language IDs in extension mappings are not empty
 *
 * Language IDs must be non-empty strings to properly identify the
 * language for syntax highlighting and language server features.
 */

import { Rule, RuleContext } from '../../types/rule';
import { safeParseJSON } from '../../utils/formats/json';
import { hasProperty, isObject, isString } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'lsp-language-id-empty',
    name: 'LSP Language ID Empty',
    description: 'LSP language IDs cannot be empty',
    category: 'LSP',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/lsp/lsp-language-id-empty.md',
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

      // Check each language ID in this server's mapping
      for (const [extension, languageId] of Object.entries(serverConfig.extensionToLanguage)) {
        if (!isString(languageId) || languageId.trim().length === 0) {
          context.report({
            message: `Language ID for extension "${extension}" in server "${serverName}" cannot be empty.`,
          });
        }
      }
    }
  },
};
