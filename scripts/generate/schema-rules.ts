/**
 * Generate schema-based rule files
 *
 * Creates rule files for schema validations that currently use unsafe
 * `as RuleId` casting. These rules register metadata but have no custom
 * validation logic - the actual validation happens in Zod schemas.
 *
 * Run: npm run generate:schema-rules
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { log } from '../util/logger';

const rootDir = process.cwd();

interface SchemaRuleConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  schemaName: string;
  schemaValidation: string;
}

/**
 * All schema-based rules that need files
 * Organized by category for clarity
 */
const SCHEMA_RULES: SchemaRuleConfig[] = [
  // Skills rules
  {
    id: 'skill-name',
    name: 'Skill Name Format',
    description:
      'Skill name must be lowercase-with-hyphens, under 64 characters, with no XML tags or reserved words',
    category: 'skills',
    schemaName: 'SkillFrontmatterSchema',
    schemaValidation:
      'lowercaseHyphens(), max(64), noXMLTags(), noReservedWords()',
  },
  {
    id: 'skill-description',
    name: 'Skill Description Format',
    description:
      'Skill description must be at least 10 characters, written in third person, with no XML tags',
    category: 'skills',
    schemaName: 'SkillFrontmatterSchema',
    schemaValidation: 'min(10), noXMLTags(), thirdPerson()',
  },
  {
    id: 'skill-version',
    name: 'Skill Version Format',
    description:
      'Skill version must follow semantic versioning format (e.g., 1.0.0)',
    category: 'skills',
    schemaName: 'SkillFrontmatterSchema',
    schemaValidation: 'semver() refinement',
  },
  {
    id: 'skill-model',
    name: 'Skill Model Value',
    description: 'Skill model must be one of: sonnet, opus, haiku, inherit',
    category: 'skills',
    schemaName: 'SkillFrontmatterSchema',
    schemaValidation: 'ModelNames enum',
  },
  {
    id: 'skill-context',
    name: 'Skill Context Mode',
    description: 'Skill context must be one of: fork, inline, auto',
    category: 'skills',
    schemaName: 'SkillFrontmatterSchema',
    schemaValidation: 'ContextModes enum',
  },
  {
    id: 'skill-agent',
    name: 'Skill Agent Requirement',
    description:
      'When skill context is "fork", agent field is required to specify which agent to use',
    category: 'skills',
    schemaName: 'SkillFrontmatterWithRefinements',
    schemaValidation: 'Cross-field refinement: requires agent when context=fork',
  },
  {
    id: 'skill-allowed-tools',
    name: 'Skill Allowed Tools Format',
    description:
      'Skill allowed-tools must be an array of tool names, cannot be used with disallowed-tools',
    category: 'skills',
    schemaName: 'SkillFrontmatterWithRefinements',
    schemaValidation:
      'Array of strings, mutex refinement with disallowed-tools',
  },
  {
    id: 'skill-disallowed-tools',
    name: 'Skill Disallowed Tools Format',
    description: 'Skill disallowed-tools must be an array of tool names',
    category: 'skills',
    schemaName: 'SkillFrontmatterSchema',
    schemaValidation: 'Array of strings',
  },
  {
    id: 'skill-tags',
    name: 'Skill Tags Format',
    description: 'Skill tags must be an array of strings',
    category: 'skills',
    schemaName: 'SkillFrontmatterSchema',
    schemaValidation: 'Array of strings',
  },
  {
    id: 'skill-dependencies',
    name: 'Skill Dependencies Format',
    description: 'Skill dependencies must be an array of strings',
    category: 'skills',
    schemaName: 'SkillFrontmatterSchema',
    schemaValidation: 'Array of strings',
  },

  // Agents rules
  {
    id: 'agent-name',
    name: 'Agent Name Format',
    description:
      'Agent name must be lowercase-with-hyphens, under 64 characters, with no XML tags',
    category: 'agents',
    schemaName: 'AgentFrontmatterSchema',
    schemaValidation: 'lowercaseHyphens(), max(64), noXMLTags()',
  },
  {
    id: 'agent-description',
    name: 'Agent Description Format',
    description:
      'Agent description must be at least 10 characters, written in third person, with no XML tags',
    category: 'agents',
    schemaName: 'AgentFrontmatterSchema',
    schemaValidation: 'min(10), noXMLTags(), thirdPerson()',
  },
  {
    id: 'agent-model',
    name: 'Agent Model Value',
    description: 'Agent model must be one of: sonnet, opus, haiku, inherit',
    category: 'agents',
    schemaName: 'AgentFrontmatterSchema',
    schemaValidation: 'ModelNames enum',
  },
  {
    id: 'agent-tools',
    name: 'Agent Tools Format',
    description:
      'Agent tools must be an array of tool names, cannot be used with disallowed-tools',
    category: 'agents',
    schemaName: 'AgentFrontmatterWithRefinements',
    schemaValidation: 'Array of strings, mutex refinement with disallowed-tools',
  },
  {
    id: 'agent-disallowed-tools',
    name: 'Agent Disallowed Tools Format',
    description: 'Agent disallowed-tools must be an array of tool names',
    category: 'agents',
    schemaName: 'AgentFrontmatterSchema',
    schemaValidation: 'Array of strings',
  },
  {
    id: 'agent-skills',
    name: 'Agent Skills Format',
    description: 'Agent skills must be an array of skill names',
    category: 'agents',
    schemaName: 'AgentFrontmatterSchema',
    schemaValidation: 'Array of strings',
  },
  {
    id: 'agent-events',
    name: 'Agent Events Format',
    description: 'Agent events must be an array with maximum 3 event names',
    category: 'agents',
    schemaName: 'AgentFrontmatterWithRefinements',
    schemaValidation: 'Array of strings, max 3 items refinement',
  },
  {
    id: 'agent-hooks',
    name: 'Agent Hooks Format',
    description: 'Agent hooks must be an object with event name keys',
    category: 'agents',
    schemaName: 'AgentFrontmatterSchema',
    schemaValidation: 'SettingsHooksSchema object',
  },

  // Claude MD rules
  {
    id: 'claude-md-paths',
    name: 'Claude MD Paths Format',
    description:
      'Claude MD paths must be a non-empty array with at least one path pattern',
    category: 'claude-md',
    schemaName: 'ClaudeMdFrontmatterSchema',
    schemaValidation:
      'Array of strings, min 1 item, each string min 1 character',
  },

  // Output Styles rules
  {
    id: 'output-style-name',
    name: 'Output Style Name Format',
    description:
      'Output style name must be lowercase-with-hyphens, under 64 characters, with no XML tags',
    category: 'output-styles',
    schemaName: 'OutputStyleFrontmatterSchema',
    schemaValidation: 'lowercaseHyphens(), max(64), noXMLTags()',
  },
  {
    id: 'output-style-description',
    name: 'Output Style Description Format',
    description:
      'Output style description must be at least 10 characters, written in third person, with no XML tags',
    category: 'output-styles',
    schemaName: 'OutputStyleFrontmatterSchema',
    schemaValidation: 'min(10), noXMLTags(), thirdPerson()',
  },
  {
    id: 'output-style-examples',
    name: 'Output Style Examples Format',
    description: 'Output style examples must be an array of strings',
    category: 'output-styles',
    schemaName: 'OutputStyleFrontmatterSchema',
    schemaValidation: 'Array of strings',
  },
];

/**
 * Generate a single schema-based rule file
 */
function generateRuleFile(config: SchemaRuleConfig): string {
  // Map category slugs to proper RuleCategory values
  const categoryMap: Record<string, string> = {
    'skills': 'Skills',
    'agents': 'Agents',
    'claude-md': 'CLAUDE.md',
    'output-styles': 'OutputStyles',
    'settings': 'Settings',
    'hooks': 'Hooks',
    'mcp': 'MCP',
    'plugin': 'Plugin',
    'commands': 'Commands',
    'lsp': 'LSP',
  };

  const categoryName = categoryMap[config.category] || config.category;

  return `/**
 * Rule: ${config.id}
 *
 * ${config.description}
 *
 * This validation is implemented in ${config.schemaName} which validates
 * the field using ${config.schemaValidation}.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: '${config.id}',
    name: '${config.name}',
    description: '${config.description}',
    category: '${categoryName}',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/${config.category}/${config.id}.md',
  },
  validate: () => {
    // No-op: Validation implemented in ${config.schemaName}
    // Schema validates using ${config.schemaValidation}
  },
};
`;
}

/**
 * Main generation function
 */
function main() {
  log.info('Generating schema-based rule files...');
  log.blank();

  let created = 0;
  let errors = 0;

  for (const config of SCHEMA_RULES) {
    const filePath = join(
      rootDir,
      'src',
      'rules',
      config.category,
      `${config.id}.ts`
    );

    try {
      // Create directory if it doesn't exist
      mkdirSync(dirname(filePath), { recursive: true });

      // Generate and write file
      const content = generateRuleFile(config);
      writeFileSync(filePath, content, 'utf-8');

      log.bracket.success(`Created: ${config.id}`);
      created++;
    } catch (error) {
      log.bracket.fail(`Failed: ${config.id} - ${error}`);
      errors++;
    }
  }

  log.blank();
  log.divider();
  log.info(`Total: ${SCHEMA_RULES.length} rules`);
  log.info(`Created: ${created}`);
  log.info(`Errors: ${errors}`);
  log.divider();
  log.blank();

  if (errors > 0) {
    process.exit(1);
  }

  log.bracket.success('Schema rule generation complete!');
  log.blank();
  log.info('Next steps:');
  log.info('1. Run: npm run generate:types');
  log.info('2. Remove `as RuleId` from src/utils/schema-helpers.ts');
  log.info('3. Run: npm test');
}

main();
