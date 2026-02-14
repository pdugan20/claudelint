/**
 * Rule: skill-path-traversal
 *
 * Warns when skill scripts contain potential path traversal patterns (../ or ..\)
 * which could be exploited to access files outside the intended directory.
 */

import { Rule } from '../../types/rule';

// Regex pattern for path traversal detection
const PATH_TRAVERSAL_REGEX = /\.\.[/\\]/; // Matches ../ or ..\ path traversal

/**
 * Path traversal validation rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'skill-path-traversal',
    name: 'Skill Path Traversal',
    description: 'Potential path traversal pattern detected',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-path-traversal.md',
    docs: {
      recommended: true,
      summary:
        'Detects path traversal patterns in skill scripts that could access files outside the intended directory.',
      rationale:
        'Path traversal patterns are a security risk, potentially allowing access to sensitive files outside the skill.',
      details:
        'This rule scans skill script files (.sh, .py, .js, .ts) for path traversal sequences ' +
        'such as `../` or `..\\`. These patterns can be exploited to escape the skill working directory ' +
        'and access or modify files elsewhere on the filesystem. ' +
        'Path traversal is a common attack vector in web applications and script-based tools. ' +
        'All file path references in skills should use absolute paths or resolve paths safely.',
      examples: {
        incorrect: [
          {
            description: 'Script that reads a file outside the skill directory',
            code: '#!/bin/bash\ncat ../../../etc/passwd',
            language: 'bash',
          },
          {
            description: 'Script that copies files using relative path traversal',
            code: '#!/bin/bash\ncp ../../secrets/config.json ./output/',
            language: 'bash',
          },
        ],
        correct: [
          {
            description: 'Script that uses an absolute path within the project',
            code: '#!/bin/bash\ncat "$PROJECT_ROOT/config/settings.json"',
            language: 'bash',
          },
          {
            description: 'Script that resolves paths safely before use',
            code: '#!/bin/bash\nREAL_PATH=$(realpath --relative-to="$SKILL_DIR" "$INPUT_PATH")\nif [[ "$REAL_PATH" == ..* ]]; then\n  echo "Error: path escapes skill directory"\n  exit 1\nfi',
            language: 'bash',
          },
        ],
      },
      howToFix:
        'Replace relative path traversals with absolute paths or use path resolution utilities ' +
        '(such as `realpath` or `path.resolve()`) and validate that the resolved path remains ' +
        'within the expected directory before accessing it.',
      whenNotToUse:
        'Disable this rule only if your skill legitimately needs to reference parent directories ' +
        'and you have verified that the paths are safe and not influenced by external input.',
      relatedRules: ['skill-dangerous-command', 'skill-eval-usage'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent } = context;
    const scriptName = filePath.split('/').pop() || filePath;

    // Only check script files
    const scriptExtensions = ['.sh', '.py', '.js', '.ts'];
    const isScriptFile = scriptExtensions.some((ext) => filePath.endsWith(ext));

    if (!isScriptFile) {
      return;
    }

    // Check for path traversal patterns
    if (PATH_TRAVERSAL_REGEX.test(fileContent)) {
      context.report({
        message: `Path traversal in "${scriptName}"`,
      });
    }
  },
};
