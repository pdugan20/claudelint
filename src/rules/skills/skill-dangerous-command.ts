/**
 * Rule: skill-dangerous-command
 *
 * Validates that skill scripts don't contain dangerous commands that could cause
 * system damage or data loss. This is a critical security check.
 */

import { Rule } from '../../types/rule';

// Dangerous command patterns for security checks
const DANGEROUS_COMMANDS = [
  {
    pattern: /rm\s+-rf\s+\/(?!\s*\$|[a-zA-Z])/,
    message: 'rm -rf / (deletes entire filesystem)',
  },
  { pattern: /:\(\)\{.*\|.*&\s*\}/, message: 'fork bomb pattern' },
  {
    pattern: /dd\s+if=.*of=\/dev\/[sh]d[a-z]/,
    message: 'dd writing to raw disk (data loss risk)',
  },
  { pattern: /mkfs\.[a-z]+\s+\/dev/, message: 'mkfs (formats disk, data loss risk)' },
  { pattern: />\s*\/dev\/[sh]d[a-z]/, message: 'writing to raw disk device' },
];

/**
 * Dangerous command validation rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'skill-dangerous-command',
    name: 'Skill Dangerous Command',
    description: 'Skill script contains dangerous commands that could cause system damage',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-dangerous-command.md',
    docs: {
      recommended: true,
      summary:
        'Detects dangerous shell commands in skill scripts that could cause system damage or data loss.',
      rationale:
        'Dangerous commands like rm -rf / or chmod 777 risk data loss or security compromise when executed.',
      details:
        'This rule scans skill script files (.sh, .py, .js, .ts) for known dangerous command patterns. ' +
        'It checks for destructive operations such as `rm -rf /`, fork bombs, raw disk writes with `dd`, ' +
        'filesystem formatting with `mkfs`, and direct writes to block devices. ' +
        'These commands can cause irreversible data loss or render a system inoperable. ' +
        'This is a critical security rule that should remain enabled for all skill projects.',
      examples: {
        incorrect: [
          {
            description: 'Script that deletes the root filesystem',
            code: '#!/bin/bash\nrm -rf / --no-preserve-root',
            language: 'bash',
          },
          {
            description: 'Script that writes directly to a raw disk device',
            code: '#!/bin/bash\ndd if=/dev/zero of=/dev/sda bs=1M',
            language: 'bash',
          },
          {
            description: 'Script that formats a disk partition',
            code: '#!/bin/bash\nmkfs.ext4 /dev/sdb1',
            language: 'bash',
          },
        ],
        correct: [
          {
            description: 'Script that removes a specific project directory safely',
            code: '#!/bin/bash\nrm -rf "$PROJECT_DIR/build"',
            language: 'bash',
          },
          {
            description: 'Script that writes to a regular file instead of a device',
            code: '#!/bin/bash\ndd if=/dev/zero of=./test-image.img bs=1M count=100',
            language: 'bash',
          },
        ],
      },
      howToFix:
        'Remove the dangerous command and replace it with a safer alternative. ' +
        'For file deletion, use targeted paths instead of root-level operations. ' +
        'For disk operations, write to regular files or use higher-level tools with safety checks.',
      whenNotToUse:
        'This rule should almost never be disabled. If you are writing a system administration ' +
        'tool that intentionally performs low-level disk operations, consider using an allowlist ' +
        'approach instead of disabling the rule entirely.',
      relatedRules: ['skill-eval-usage', 'skill-path-traversal'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only check script files
    const isScriptFile =
      filePath.endsWith('.sh') ||
      filePath.endsWith('.py') ||
      filePath.endsWith('.js') ||
      filePath.endsWith('.ts');

    if (!isScriptFile) {
      return;
    }

    // Check for each dangerous command pattern
    for (const { pattern, message } of DANGEROUS_COMMANDS) {
      if (pattern.test(fileContent)) {
        const scriptName = filePath.split('/').pop() || filePath;

        context.report({
          message: `Dangerous command in "${scriptName}": ${message}`,
          fix: 'Remove or replace the dangerous command with a safer alternative',
        });
      }
    }
  },
};
