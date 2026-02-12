/**
 * Rule: skill-description-quality
 *
 * Warns when skill description does not start with an action verb in imperative
 * mood or lacks sufficient context. Good descriptions follow the pattern:
 * "[Action Verb] [what it does] [context/technology]"
 *
 * Consolidates the former skill-description-structure and skill-description-missing-context rules.
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

/**
 * Common imperative-mood action verbs used in skill descriptions.
 * Lowercase for case-insensitive matching.
 */
const ACTION_VERBS = new Set([
  'add',
  'analyze',
  'apply',
  'audit',
  'automate',
  'backup',
  'build',
  'check',
  'clean',
  'compile',
  'compress',
  'configure',
  'connect',
  'convert',
  'create',
  'debug',
  'delete',
  'deploy',
  'detect',
  'diagnose',
  'document',
  'download',
  'enforce',
  'evaluate',
  'execute',
  'export',
  'extract',
  'fetch',
  'filter',
  'find',
  'fix',
  'format',
  'generate',
  'help',
  'import',
  'index',
  'initialize',
  'inspect',
  'install',
  'interactively',
  'lint',
  'list',
  'load',
  'log',
  'manage',
  'merge',
  'migrate',
  'minify',
  'modify',
  'monitor',
  'move',
  'notify',
  'open',
  'optimize',
  'organize',
  'package',
  'parse',
  'patch',
  'process',
  'profile',
  'provision',
  'publish',
  'query',
  'read',
  'rebuild',
  'refactor',
  'remove',
  'rename',
  'render',
  'replace',
  'report',
  'reset',
  'resolve',
  'restart',
  'restore',
  'retrieve',
  'review',
  'run',
  'scan',
  'schedule',
  'search',
  'send',
  'serve',
  'set',
  'setup',
  'show',
  'sort',
  'split',
  'start',
  'stop',
  'store',
  'submit',
  'summarize',
  'sync',
  'tag',
  'test',
  'trace',
  'track',
  'transform',
  'translate',
  'trigger',
  'update',
  'upgrade',
  'upload',
  'use',
  'validate',
  'verify',
  'visualize',
  'watch',
  'write',
]);

/**
 * Minimum word count for a description to be considered to have sufficient context.
 */
const MIN_WORD_COUNT = 4;

/**
 * Check if a word is an action verb (supports both imperative and third-person forms).
 * "validate" -> true, "validates" -> true, "this" -> false
 */
function isActionVerb(word: string): boolean {
  const lower = word.toLowerCase();
  if (ACTION_VERBS.has(lower)) return true;
  // Try stripping third-person 's' suffix: "validates" -> "validate"
  if (lower.endsWith('es') && ACTION_VERBS.has(lower.slice(0, -2))) return true;
  if (lower.endsWith('s') && ACTION_VERBS.has(lower.slice(0, -1))) return true;
  return false;
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
    docs: {
      summary:
        'Checks that skill descriptions start with an action verb and include sufficient context.',
      details:
        'Good skill descriptions follow the pattern "[Action Verb] [what it does] [context/technology]". ' +
        'This rule performs two checks: (1) the description must start with a recognized action verb in ' +
        'imperative or third-person form (e.g., "Deploy", "Validates", "Run"), and (2) the description ' +
        'must contain at least 4 words to provide meaningful context. ' +
        'This consolidates the former skill-description-structure and skill-description-missing-context rules.',
      examples: {
        incorrect: [
          {
            description: 'Description not starting with an action verb',
            code: '---\nname: deploy\ndescription: The deployment pipeline for production\n---',
          },
          {
            description: 'Description too brief (fewer than 4 words)',
            code: '---\nname: deploy\ndescription: Deploy app\n---',
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
    const firstWord = words[0]?.toLowerCase();
    const line = getFrontmatterFieldLine(context.fileContent, 'description');

    // Check 1: starts with action verb (imperative or third-person)
    if (firstWord && !isActionVerb(firstWord)) {
      context.report({
        message:
          `Description should start with an action verb (e.g., "Validate", "Generate", "Run"). ` +
          `Found: "${words[0]}"`,
        line,
        fix: `Rewrite to start with an imperative verb: "${description}" -> "Verb ${description}"`,
      });
    }

    // Check 2: sufficient context (at least MIN_WORD_COUNT words)
    if (words.length < MIN_WORD_COUNT) {
      context.report({
        message:
          `Description is too brief (${words.length} words). ` +
          `Include what the skill does and what domain/technology it targets (at least ${MIN_WORD_COUNT} words).`,
        line,
        fix: 'Expand description to include the use case or technology context',
      });
    }
  },
};
