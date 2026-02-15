/**
 * Rule: skill-description-quality
 *
 * Warns when skill description starts with a non-verb word (article, pronoun,
 * determiner) or lacks sufficient context. Good descriptions follow the pattern:
 * "[Action Verb] [what it does] [context/technology]"
 *
 * Uses a blocklist approach: a small set of known non-verb starters is rejected,
 * rather than maintaining an allowlist of valid verbs. This avoids false positives
 * for unusual but valid verbs (e.g., "Scaffold", "Orchestrate", "Transpile").
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';
import { z } from 'zod';

/**
 * Words that should never start a skill description. These are articles,
 * pronouns, determiners, prepositions, and filler words that indicate the
 * description is not in imperative/action form.
 */
const NON_VERB_STARTERS = new Set([
  'a',
  'an',
  'the',
  'this',
  'that',
  'these',
  'those',
  'my',
  'our',
  'your',
  'its',
  'their',
  'some',
  'any',
  'every',
  'for',
  'with',
  'about',
  'just',
  'simply',
  'basically',
  'it',
  'we',
  'i',
]);

const DEFAULT_MIN_WORDS = 6;

export interface SkillDescriptionQualityOptions {
  /** Minimum word count for descriptions (default: 6) */
  minWords?: number;
}

export const rule: Rule = {
  meta: {
    id: 'skill-description-quality',
    name: 'Skill Description Quality',
    description:
      'Skill description should start with an action verb and include sufficient context',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-description-quality.md',
    schema: z.object({
      minWords: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      minWords: DEFAULT_MIN_WORDS,
    },
    docs: {
      recommended: true,
      summary:
        'Checks that skill descriptions start with an action verb and include sufficient context.',
      rationale:
        'Low-quality descriptions make it harder for the model to determine when and how to invoke the skill.',
      details:
        'Good skill descriptions follow the pattern "[Action Verb] [what it does] [context/technology]". ' +
        'This rule performs two checks: (1) the description must not start with an article, pronoun, or ' +
        'filler word (e.g., "The", "This", "A", "Just"), and (2) the description must contain at least ' +
        '6 words (configurable via `minWords`) to provide meaningful context.',
      examples: {
        incorrect: [
          {
            description: 'Description starting with an article',
            code: '---\nname: deploy\ndescription: The deployment pipeline for production\n---',
          },
          {
            description: 'Description too brief (fewer than 6 words)',
            code: '---\nname: deploy\ndescription: Deploy the app\n---',
          },
        ],
        correct: [
          {
            description: 'Starts with action verb and has sufficient context',
            code: '---\nname: deploy\ndescription: Deploys the application to the staging environment\n---',
          },
          {
            description: 'Third-person verb form with technology context',
            code: '---\nname: lint\ndescription: Validates TypeScript code against project style guidelines\n---',
          },
        ],
      },
      options: {
        minWords: {
          type: 'number',
          description: 'Minimum word count for descriptions (default: 6)',
          default: DEFAULT_MIN_WORDS,
          examples: [
            { description: 'Require longer descriptions', config: { minWords: 8 } },
            { description: 'Allow shorter descriptions', config: { minWords: 4 } },
          ],
        },
      },
      howToFix:
        'Rewrite the description to start with an imperative or third-person action verb ' +
        '(e.g., "Deploy", "Generate", "Validates") and include enough words to describe what the skill does ' +
        'and what technology or domain it targets.',
      relatedRules: [
        'skill-description',
        'skill-description-missing-trigger',
        'skill-description-max-length',
      ],
    },
  },

  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (
      !frontmatter ||
      !frontmatter['description'] ||
      typeof frontmatter['description'] !== 'string'
    ) {
      return; // No description to check (handled by skill-description rule)
    }

    const description = frontmatter['description'];
    const words = description.trim().split(/\s+/);
    const firstWord = words[0];
    const line = getFrontmatterFieldLine(context.fileContent, 'description');
    const minWords =
      (context.options as SkillDescriptionQualityOptions).minWords ?? DEFAULT_MIN_WORDS;

    // Check 1: should not start with a non-verb word
    if (firstWord && NON_VERB_STARTERS.has(firstWord.toLowerCase())) {
      context.report({
        message: `Should start with action verb, found: "${firstWord}"`,
        line,
        fix: `Rewrite to start with an imperative verb: "${description}" -> "Verb ${description}"`,
      });
    }

    // Check 2: sufficient context (at least minWords words)
    if (words.length < minWords) {
      context.report({
        message: `Description has only ${words.length} words, minimum is ${minWords}`,
        line,
        fix: 'Expand description to include the use case or technology context',
      });
    }
  },
};
