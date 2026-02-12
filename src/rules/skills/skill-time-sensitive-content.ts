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
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-time-sensitive-content.md',
    docs: {
      summary:
        'Warns when SKILL.md body contains time-sensitive references that will become outdated.',
      details:
        'Skills should contain evergreen content that remains accurate over time. References to ' +
        'specific dates ("January 15, 2025"), relative time ("last week", "this month"), or ISO ' +
        'date strings ("2025-01-15") become stale and misleading. This rule scans the SKILL.md body ' +
        '(after frontmatter) for patterns like "today", "yesterday", "tomorrow", "this/last/next ' +
        'week/month/year", full date strings, and ISO date formats. Each matching line is reported.',
      examples: {
        incorrect: [
          {
            description: 'SKILL.md body with a specific date reference',
            code:
              '---\nname: deploy-app\ndescription: Deploys the application\n---\n\n' +
              'Updated on January 15, 2025 to support the new API.',
            language: 'markdown',
          },
          {
            description: 'SKILL.md body with relative time reference',
            code:
              '---\nname: deploy-app\ndescription: Deploys the application\n---\n\n' +
              'This week we migrated to the new deploy pipeline.',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'SKILL.md body with evergreen language',
            code:
              '---\nname: deploy-app\ndescription: Deploys the application\n---\n\n' +
              'Uses the current deploy pipeline with zero-downtime rollouts.',
            language: 'markdown',
          },
          {
            description: 'Version references instead of dates',
            code:
              '---\nname: deploy-app\ndescription: Deploys the application\n---\n\n' +
              'Supports API v2 and later.',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Replace specific dates with version references or relative terms that age well. ' +
        'For example, use "recent versions" instead of "this month" and "API v2+" instead of ' +
        '"the January 2025 API update".',
      whenNotToUse:
        'If the skill documentation intentionally tracks a changelog or release history with dates, ' +
        'you may disable this rule for that specific file.',
      relatedRules: ['skill-body-word-count', 'skill-body-too-long'],
    },
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
