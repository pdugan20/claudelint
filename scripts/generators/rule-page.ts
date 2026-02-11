/**
 * Rule Page Template Generator
 *
 * Generates VitePress-compatible markdown pages from rule metadata.
 * Output follows the structure defined in docs/rules/TEMPLATE.md.
 *
 * Usage: Called by scripts/generate/rule-docs.ts
 */

import { RuleMetadata, RuleCategory } from '../../src/types/rule';

/**
 * Map RuleCategory to directory name used in docs/rules/ and website/rules/
 */
const CATEGORY_DIR_MAP: Record<RuleCategory, string> = {
  'CLAUDE.md': 'claude-md',
  Skills: 'skills',
  Settings: 'settings',
  Hooks: 'hooks',
  MCP: 'mcp',
  Plugin: 'plugin',
  Commands: 'commands',
  Agents: 'agents',
  OutputStyles: 'output-styles',
  LSP: 'lsp',
};

/**
 * Map RuleCategory to display name used in documentation
 */
const CATEGORY_DISPLAY_MAP: Record<RuleCategory, string> = {
  'CLAUDE.md': 'CLAUDE.md',
  Skills: 'Skills',
  Settings: 'Settings',
  Hooks: 'Hooks',
  MCP: 'MCP',
  Plugin: 'Plugin',
  Commands: 'Commands',
  Agents: 'Agents',
  OutputStyles: 'Output Styles',
  LSP: 'LSP',
};

/**
 * Get the directory name for a rule category
 */
export function getCategoryDir(category: RuleCategory): string {
  return CATEGORY_DIR_MAP[category];
}

/**
 * Generate a complete VitePress markdown page for a rule
 */
export function generateRulePage(meta: RuleMetadata): string {
  const docs = meta.docs;
  if (!docs) {
    throw new Error(`Rule ${meta.id} missing docs metadata`);
  }

  const categoryDir = getCategoryDir(meta.category);
  const categoryDisplay = CATEGORY_DISPLAY_MAP[meta.category];
  const parts: string[] = [];

  // Title
  parts.push(`# Rule: ${meta.id}`);
  parts.push('');

  // Metadata badges
  parts.push(
    `**Severity**: ${capitalize(meta.severity)}`,
  );
  parts.push(`**Fixable**: ${meta.fixable ? 'Yes' : 'No'}`);
  parts.push(`**Validator**: ${categoryDisplay}`);
  if (docs.recommended) {
    parts.push('**Recommended**: Yes');
  }
  parts.push('');

  // Summary
  parts.push(meta.description);
  parts.push('');

  // Rule Details
  parts.push('## Rule Details');
  parts.push('');
  parts.push(docs.details.trim());
  parts.push('');

  // Examples - Incorrect
  if (docs.examples.incorrect.length > 0) {
    parts.push('### Incorrect');
    parts.push('');
    for (const example of docs.examples.incorrect) {
      parts.push(example.description);
      parts.push('');
      const fence = example.code.includes('```') ? '````' : '```';
      parts.push(fence + (example.language || 'yaml'));
      parts.push(example.code);
      parts.push(fence);
      parts.push('');
    }
  }

  // Examples - Correct
  if (docs.examples.correct.length > 0) {
    parts.push('### Correct');
    parts.push('');
    for (const example of docs.examples.correct) {
      parts.push(example.description);
      parts.push('');
      const fence = example.code.includes('```') ? '````' : '```';
      parts.push(fence + (example.language || 'yaml'));
      parts.push(example.code);
      parts.push(fence);
      parts.push('');
    }
  }

  // How To Fix
  if (docs.howToFix) {
    parts.push('## How To Fix');
    parts.push('');
    parts.push(docs.howToFix.trim());
    parts.push('');
  }

  // Options
  if (docs.optionExamples && docs.optionExamples.length > 0) {
    parts.push('## Options');
    parts.push('');
    if (meta.defaultOptions) {
      parts.push('Default options:');
      parts.push('');
      parts.push('```json');
      parts.push(JSON.stringify(meta.defaultOptions, null, 2));
      parts.push('```');
      parts.push('');
    }
    for (const example of docs.optionExamples) {
      parts.push(example.description + ':');
      parts.push('');
      parts.push('```json');
      parts.push(JSON.stringify(example.config, null, 2));
      parts.push('```');
      parts.push('');
    }
  } else if (!docs.options) {
    parts.push('## Options');
    parts.push('');
    parts.push('This rule does not have any configuration options.');
    parts.push('');
  }

  // When Not To Use It
  if (docs.whenNotToUse) {
    parts.push('## When Not To Use It');
    parts.push('');
    parts.push(docs.whenNotToUse.trim());
    parts.push('');
  }

  // Related Rules
  if (docs.relatedRules && docs.relatedRules.length > 0) {
    parts.push('## Related Rules');
    parts.push('');
    for (const relatedId of docs.relatedRules) {
      parts.push(`- [\`${relatedId}\`](/rules/${getCategoryDirForRuleId(relatedId)}/${relatedId})`);
    }
    parts.push('');
  }

  // Further Reading
  if (docs.furtherReading && docs.furtherReading.length > 0) {
    parts.push('## Further Reading');
    parts.push('');
    for (const link of docs.furtherReading) {
      parts.push(`- [${link.title}](${link.url})`);
    }
    parts.push('');
  }

  // Resources
  parts.push('## Resources');
  parts.push('');
  parts.push(
    `- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/${categoryDir}/${meta.id}.ts)`,
  );
  parts.push(
    `- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/${categoryDir}/${meta.id}.test.ts)`,
  );
  parts.push('');

  // Version
  parts.push('## Version');
  parts.push('');
  parts.push(`Available since: v${meta.since}`);
  parts.push('');

  return parts.join('\n');
}

/**
 * Capitalize first letter of a string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Best-effort category directory lookup for a rule ID.
 * Uses the rule ID prefix to determine the category directory.
 */
function getCategoryDirForRuleId(ruleId: string): string {
  const prefixMap: Record<string, string> = {
    'claude-md': 'claude-md',
    skill: 'skills',
    settings: 'settings',
    hooks: 'hooks',
    mcp: 'mcp',
    plugin: 'plugin',
    commands: 'commands',
    agent: 'agents',
    'output-style': 'output-styles',
    lsp: 'lsp',
  };

  for (const [prefix, dir] of Object.entries(prefixMap)) {
    if (ruleId.startsWith(prefix)) {
      return dir;
    }
  }

  return 'unknown';
}
