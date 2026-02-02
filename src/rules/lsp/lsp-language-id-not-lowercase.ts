/**
 * Rule: lsp-language-id-not-lowercase
 *
 * Validates that language IDs in extension mappings are lowercase
 *
 * Language IDs should be lowercase to follow LSP conventions and
 * ensure consistent behavior across different language servers.
 */

import { Rule, RuleContext } from '../../types/rule';
import { safeParseJSON } from '../../utils/formats/json';
import { hasProperty, isObject, isString } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'lsp-language-id-not-lowercase',
    name: 'LSP Language ID Not Lowercase',
    description: 'LSP language IDs should be lowercase',
    category: 'LSP',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/lsp/lsp-language-id-not-lowercase.md',
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
        if (!isString(languageId)) {
          continue;
        }

        if (languageId !== languageId.toLowerCase()) {
          context.report({
            message: `Language ID "${languageId}" for extension "${extension}" in server "${serverName}" should be lowercase.`,
          });
        }
      }
    }
  },
};
