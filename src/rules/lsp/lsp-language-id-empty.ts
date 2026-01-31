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
    if (!config || !config.extensionMapping) {
      return; // No extension mapping or invalid JSON
    }

    const extensionMapping = config.extensionMapping;
    if (typeof extensionMapping !== 'object') {
      return;
    }

    // Check each language ID
    for (const [extension, languageId] of Object.entries(extensionMapping)) {
      if (typeof languageId !== 'string' || languageId.trim().length === 0) {
        context.report({
          message: `Language ID for extension "${extension}" cannot be empty.`,
        });
      }
    }
  },
};
