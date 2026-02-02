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
    if (!hasProperty(config, 'extensionMapping') || !isObject(config.extensionMapping)) {
      return; // No extension mapping or invalid JSON
    }

    // Check each language ID
    for (const [extension, languageId] of Object.entries(config.extensionMapping)) {
      if (!isString(languageId)) {
        continue;
      }

      if (languageId !== languageId.toLowerCase()) {
        context.report({
          message: `Language ID "${languageId}" for extension "${extension}" should be lowercase.`,
        });
      }
    }
  },
};
