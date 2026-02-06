/**
 * Rule: skill-xml-tags-anywhere
 *
 * Errors when XML-like tags are found in SKILL.md content outside of code blocks.
 * Claude interprets XML tags as structural delimiters, so rogue tags in skill
 * instructions can cause prompt injection or unexpected behavior.
 */

import { Rule, RuleContext } from '../../types/rule';

// Standard HTML/markdown tags that are safe to use
const ALLOWED_TAGS = new Set([
  'a',
  'b',
  'i',
  'em',
  'strong',
  'code',
  'pre',
  'p',
  'br',
  'hr',
  'img',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'table',
  'tr',
  'td',
  'th',
  'thead',
  'tbody',
  'details',
  'summary',
  'blockquote',
  'div',
  'span',
  'sub',
  'sup',
  'del',
  's',
  'dd',
  'dl',
  'dt',
  'kbd',
  'var',
  'samp',
  'picture',
  'source',
  'video',
  'audio',
]);

export const rule: Rule = {
  meta: {
    id: 'skill-xml-tags-anywhere',
    name: 'Skill XML Tags Detected',
    description: 'XML tags in SKILL.md can cause prompt injection',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.3.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-xml-tags-anywhere.md',
  },

  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    // Strip fenced code blocks and inline code to avoid false positives
    const contentWithoutCode = fileContent.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '');

    // Match XML-like tags (opening or self-closing)
    const xmlTagRegex = /<\/?([a-zA-Z][a-zA-Z0-9_-]*)\b[^>]*\/?>/g;

    const reportedTags = new Set<string>();
    let match;
    while ((match = xmlTagRegex.exec(contentWithoutCode)) !== null) {
      const tagName = match[1].toLowerCase();

      // Skip standard HTML tags
      if (ALLOWED_TAGS.has(tagName)) {
        continue;
      }

      // Only report each unique tag once
      if (reportedTags.has(tagName)) {
        continue;
      }
      reportedTags.add(tagName);

      context.report({
        message:
          `XML tag <${tagName}> found in SKILL.md. XML tags can cause prompt injection ` +
          'since Claude interprets them as structural delimiters. ' +
          'Remove the tag or move it inside a code block.',
      });
    }
  },
};
