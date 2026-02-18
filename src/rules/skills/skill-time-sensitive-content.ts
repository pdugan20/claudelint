/**
 * Rule: skill-time-sensitive-content
 *
 * Warns when SKILL.md contains time-sensitive references that will become outdated.
 */

import { Rule } from '../../types/rule';
import { extractBodyContent } from '../../utils/formats/markdown';
import { z } from 'zod';

/**
 * Options for skill-time-sensitive-content rule
 */
export interface SkillTimeSensitiveContentOptions {
  /** Maximum age in days before a date is considered stale (default: 180) */
  maxAgeDays?: number;
}

// Relative time words — always flagged regardless of maxAgeDays
const RELATIVE_TIME_PATTERNS = [
  /\btoday\b/i,
  /\byesterday\b/i,
  /\btomorrow\b/i,
  /\bthis (week|month|year)\b/i,
  /\blast (week|month|year)\b/i,
  /\bnext (week|month|year)\b/i,
];

// Date patterns that can be parsed and age-checked
const MONTH_NAMES: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

const NAMED_DATE_RE =
  /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(20\d{2})\b/i;
const ISO_DATE_RE = /\b(20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/;

/**
 * Parse a date from a line and return it, or null if no date found.
 */
function parseDateFromLine(line: string): Date | null {
  const namedMatch = NAMED_DATE_RE.exec(line);
  if (namedMatch) {
    const month = MONTH_NAMES[namedMatch[1].toLowerCase()];
    const day = parseInt(namedMatch[2], 10);
    const year = parseInt(namedMatch[3], 10);
    return new Date(year, month, day);
  }

  const isoMatch = ISO_DATE_RE.exec(line);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    return new Date(year, month, day);
  }

  return null;
}

/**
 * Check if a date is older than maxAgeDays from now.
 */
function isStaleDate(date: Date, maxAgeDays: number): boolean {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays > maxAgeDays;
}

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
    docUrl: 'https://claudelint.com/rules/skills/skill-time-sensitive-content',
    schema: z.object({
      maxAgeDays: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxAgeDays: 180,
    },
    docs: {
      strict: true,
      summary:
        'Warns when SKILL.md body contains time-sensitive references that will become outdated.',
      rationale:
        'Time-sensitive references like specific dates or versions become stale, producing incorrect guidance.',
      details:
        'Skills should contain evergreen content that remains accurate over time. Relative time words ' +
        '("today", "yesterday", "this week") are always flagged. Specific dates ("January 15, 2025", ' +
        '"2025-01-15") are only flagged if they are older than `maxAgeDays` (default: 180 days). ' +
        'This allows recently-added dates to exist without noise while catching stale references.',
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
      optionExamples: [
        {
          description: 'Only flag dates older than 1 year',
          config: { maxAgeDays: 365 },
        },
        {
          description: 'Flag dates older than 90 days',
          config: { maxAgeDays: 90 },
        },
      ],
      whenNotToUse:
        'If the skill documentation intentionally tracks a changelog or release history with dates, ' +
        'you may disable this rule for that specific file.',
      relatedRules: ['skill-body-word-count', 'skill-body-too-long'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent, options } = context;

    // Only validate SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    // Extract body content (everything after frontmatter)
    const body = extractBodyContent(fileContent);
    if (!body) {
      return; // No body content or invalid frontmatter
    }

    const maxAgeDays = (options as SkillTimeSensitiveContentOptions).maxAgeDays ?? 180;
    const lines = body.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check relative time words — always flagged
      let flagged = false;
      for (const pattern of RELATIVE_TIME_PATTERNS) {
        if (pattern.test(line)) {
          context.report({
            message: `Time-sensitive content: "${line.trim()}"`,
            line: i + 1,
          });
          flagged = true;
          break;
        }
      }
      if (flagged) continue;

      // Check date patterns — only flag if older than maxAgeDays
      const date = parseDateFromLine(line);
      if (date && isStaleDate(date, maxAgeDays)) {
        context.report({
          message: `Time-sensitive content: "${line.trim()}"`,
          line: i + 1,
        });
      }
    }
  },
};
