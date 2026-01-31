/**
 * Rule: skill-time-sensitive-content
 *
 * Warns when SKILL.md contains time-sensitive references that will become outdated.
 */

import { Rule } from '../../types/rule';

const TIME_SENSITIVE_PATTERNS = [
  /\btoday\b/i,
  /\byesterday\b/i,
  /\btomorrow\b/i,
  /\bthis (week|month|year)\b/i,
  /\blast (week|month|year)\b/i,
  /\bnext (week|month|year)\b/i,
  /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+20\d{2}\b/i,
  /\b20\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/, // ISO date format
];

/**
 * Validates SKILL.md for time-sensitive content
 */
export const rule: Rule = {
  meta: {
    id: 'skill-time-sensitive-content',
    name: 'Skill Time Sensitive Content',
    description: 'SKILL.md should avoid time-sensitive references',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/skills/skill-time-sensitive-content.md',
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only validate SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    // Extract body content (everything after frontmatter)
    const parts = fileContent.split('---');
    if (parts.length < 3) {
      return; // No body content or invalid frontmatter
    }

    const body = parts.slice(2).join('---');
    const lines = body.split('\n');

    // Check for time-sensitive content
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of TIME_SENSITIVE_PATTERNS) {
        if (pattern.test(line)) {
          context.report({
            message:
              `Time-sensitive content detected: "${line.trim()}". ` +
              'Avoid using specific dates or time references that become outdated. ' +
              'Use relative terms like "recent versions" or update the content regularly.',
            line: i + 1,
          });
          break; // Only warn once per line
        }
      }
    }
  },
};
