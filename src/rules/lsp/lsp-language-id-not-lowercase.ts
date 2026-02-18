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
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/lsp/lsp-language-id-not-lowercase',
    docs: {
      strict: true,
      summary: 'Warns when language IDs in LSP extension mappings are not lowercase.',
      rationale:
        'Mixed-case language IDs cause mismatches between editor expectations and server behavior.',
      details:
        'This rule checks the values in the `extensionToLanguage` mapping of each LSP ' +
        'server entry in `lsp.json` and warns when a language ID contains uppercase ' +
        'characters. The LSP specification convention is to use lowercase language IDs ' +
        '(e.g., `typescript` not `TypeScript`). Using inconsistent casing can cause ' +
        'mismatches between editor expectations and server behavior.',
      examples: {
        incorrect: [
          {
            description: 'Language IDs with uppercase characters',
            code:
              '{\n' +
              '  "my-server": {\n' +
              '    "command": "/usr/bin/my-server",\n' +
              '    "extensionToLanguage": {\n' +
              '      ".ts": "TypeScript",\n' +
              '      ".py": "Python"\n' +
              '    }\n' +
              '  }\n' +
              '}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Lowercase language IDs',
            code:
              '{\n' +
              '  "my-server": {\n' +
              '    "command": "/usr/bin/my-server",\n' +
              '    "extensionToLanguage": {\n' +
              '      ".ts": "typescript",\n' +
              '      ".py": "python"\n' +
              '    }\n' +
              '  }\n' +
              '}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Convert all language ID values to lowercase. For example, change ' +
        '`"TypeScript"` to `"typescript"` and `"Python"` to `"python"`.',
      relatedRules: ['lsp-language-id-empty', 'lsp-extension-missing-dot'],
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

      // Check each language ID in this server's mapping
      for (const [_extension, languageId] of Object.entries(serverConfig.extensionToLanguage)) {
        if (!isString(languageId)) {
          continue;
        }

        if (languageId !== languageId.toLowerCase()) {
          context.report({
            message: `Language ID "${languageId}" is not lowercase`,
          });
        }
      }
    }
  },
};
