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
    if (!hasProperty(config, 'extensionMapping') || !isObject(config.extensionMapping)) {
      return; // No extension mapping or invalid JSON
    }

    // Check each extension
    for (const extension of Object.keys(config.extensionMapping)) {
      if (!extension.startsWith('.')) {
        context.report({
          message: `Extension "${extension}" must start with a dot (e.g., ".ts").`,
        });
      }
    }
  },
};
