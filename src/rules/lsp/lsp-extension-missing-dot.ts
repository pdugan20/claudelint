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
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/lsp/lsp-extension-missing-dot.md',
    docs: {
      recommended: true,
      summary: 'Ensures file extension mappings in LSP config start with a dot.',
      rationale:
        'Extensions without a leading dot fail to match files, preventing language server features from activating.',
      details:
        'This rule validates keys in the `extensionToLanguage` mapping of each LSP ' +
        'server entry in `lsp.json`. File extensions must begin with a dot (e.g., ' +
        '`.ts`, `.py`) to be recognized by the LSP system. Extensions without a ' +
        'leading dot will fail to match files correctly, causing language server ' +
        'features like code completion and diagnostics to not activate.',
      examples: {
        incorrect: [
          {
            description: 'Extension keys missing the leading dot',
            code:
              '{\n' +
              '  "typescript-server": {\n' +
              '    "command": "/usr/bin/tsserver",\n' +
              '    "extensionToLanguage": {\n' +
              '      "ts": "typescript",\n' +
              '      "tsx": "typescriptreact"\n' +
              '    }\n' +
              '  }\n' +
              '}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Extension keys with leading dot',
            code:
              '{\n' +
              '  "typescript-server": {\n' +
              '    "command": "/usr/bin/tsserver",\n' +
              '    "extensionToLanguage": {\n' +
              '      ".ts": "typescript",\n' +
              '      ".tsx": "typescriptreact"\n' +
              '    }\n' +
              '  }\n' +
              '}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Add a leading dot to each extension key in the `extensionToLanguage` mapping. ' +
        'For example, change `"ts"` to `".ts"` and `"py"` to `".py"`.',
      relatedRules: ['lsp-language-id-empty', 'lsp-language-id-not-lowercase'],
    },
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
    for (const [_serverName, serverConfig] of Object.entries(config)) {
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
            message: `Extension "${extension}" missing leading dot`,
          });
        }
      }
    }
  },
};
