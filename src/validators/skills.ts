import { BaseValidator, ValidationResult } from './base';
import {
  findSkillDirectories,
  readFileContent,
  fileExists,
  resolvePath,
} from '../utils/file-system';
import { extractFrontmatter, startsWithH1, validateMarkdownStructure } from '../utils/markdown';
import { basename, dirname, join } from 'path';

interface SkillFrontmatter {
  name: string;
  description: string;
  'argument-hint'?: string;
  'disable-model-invocation'?: boolean;
  'user-invocable'?: boolean;
  'allowed-tools'?: string[];
  model?: 'sonnet' | 'opus' | 'haiku' | 'inherit';
  context?: 'fork' | 'inline' | 'auto';
  agent?: string;
  hooks?: unknown;
  [key: string]: unknown;
}

const VALID_TOOLS = [
  'Bash',
  'Read',
  'Write',
  'Edit',
  'Glob',
  'Grep',
  'Task',
  'WebFetch',
  'WebSearch',
  'LSP',
  'AskUserQuestion',
  'EnterPlanMode',
  'ExitPlanMode',
  'Skill',
  'TaskCreate',
  'TaskUpdate',
  'TaskGet',
  'TaskList',
  'TaskOutput',
  'TaskStop',
  'NotebookEdit',
];

const VALID_MODELS = ['sonnet', 'opus', 'haiku', 'inherit'];
const VALID_CONTEXTS = ['fork', 'inline', 'auto'];

/**
 * Validates Claude Code skills for structure and frontmatter
 */
export class SkillsValidator extends BaseValidator {
  private basePath: string;
  private specificSkill?: string;

  constructor(
    options: { path?: string; skill?: string; verbose?: boolean; warningsAsErrors?: boolean } = {}
  ) {
    super(options);
    this.basePath = options.path || process.cwd();
    this.specificSkill = options.skill;
  }

  async validate(): Promise<ValidationResult> {
    const skillDirs = await this.findSkillDirs();

    if (skillDirs.length === 0) {
      this.reportWarning('No skill directories found');
      return this.getResult();
    }

    for (const skillDir of skillDirs) {
      await this.validateSkill(skillDir);
    }

    return this.getResult();
  }

  private async findSkillDirs(): Promise<string[]> {
    const allSkillDirs = await findSkillDirectories(this.basePath);

    if (this.specificSkill) {
      // Filter to specific skill
      return allSkillDirs.filter((dir) => basename(dir) === this.specificSkill);
    }

    return allSkillDirs;
  }

  private async validateSkill(skillDir: string): Promise<void> {
    const skillName = basename(skillDir);
    const skillMdPath = join(skillDir, 'SKILL.md');

    // Check SKILL.md exists
    const exists = await fileExists(skillMdPath);
    if (!exists) {
      this.reportError(`SKILL.md not found in skill directory`, skillDir);
      return;
    }

    // Read content
    const content = await readFileContent(skillMdPath);

    // Validate frontmatter
    await this.validateFrontmatter(skillMdPath, content, skillName);

    // Validate markdown structure
    this.validateMarkdownContent(skillMdPath, content);

    // Validate string substitutions
    this.validateStringSubstitutions(skillMdPath, content);
  }

  private async validateFrontmatter(
    filePath: string,
    content: string,
    skillName: string
  ): Promise<void> {
    try {
      const { frontmatter, hasFrontmatter } = extractFrontmatter<SkillFrontmatter>(content);

      if (!hasFrontmatter) {
        this.reportError('Missing frontmatter in SKILL.md', filePath);
        return;
      }

      if (!frontmatter) {
        this.reportError('Invalid frontmatter YAML syntax', filePath);
        return;
      }

      // Check required fields
      this.validateRequiredFields(filePath, frontmatter);

      // Check optional fields
      await this.validateOptionalFields(filePath, frontmatter, skillName);

      // Check name matches directory
      if (frontmatter.name !== skillName) {
        this.reportError(
          `Skill name "${frontmatter.name}" does not match directory name "${skillName}"`,
          filePath
        );
      }
    } catch (error) {
      this.reportError(
        `Failed to parse frontmatter: ${error instanceof Error ? error.message : String(error)}`,
        filePath
      );
    }
  }

  private validateRequiredFields(filePath: string, frontmatter: SkillFrontmatter): void {
    // name is required
    if (!frontmatter.name) {
      this.reportError('Missing required field: name', filePath);
    } else {
      // Validate name format
      if (!/^[a-z0-9-]+$/.test(frontmatter.name)) {
        this.reportError(
          'Skill name must be lowercase with hyphens only (a-z, 0-9, -)',
          filePath
        );
      }

      if (frontmatter.name.length > 64) {
        this.reportError('Skill name must be 64 characters or less', filePath);
      }
    }

    // description is required
    if (!frontmatter.description) {
      this.reportError('Missing required field: description', filePath);
    } else if (typeof frontmatter.description !== 'string') {
      this.reportError('description must be a string', filePath);
    } else if (frontmatter.description.length < 10) {
      this.reportWarning('description should be at least 10 characters', filePath);
    }
  }

  private async validateOptionalFields(
    filePath: string,
    frontmatter: SkillFrontmatter,
    skillName: string
  ): Promise<void> {
    // allowed-tools validation
    if (frontmatter['allowed-tools']) {
      if (!Array.isArray(frontmatter['allowed-tools'])) {
        this.reportError('allowed-tools must be an array', filePath);
      } else {
        for (const tool of frontmatter['allowed-tools']) {
          if (typeof tool !== 'string') {
            this.reportError(`Invalid tool name (must be string): ${String(tool)}`, filePath);
          } else if (!VALID_TOOLS.includes(tool)) {
            this.reportWarning(`Unknown tool: ${tool}`, filePath);
          }
        }
      }
    }

    // model validation
    if (frontmatter.model) {
      if (!VALID_MODELS.includes(frontmatter.model)) {
        this.reportError(
          `Invalid model: ${frontmatter.model}. Must be one of: ${VALID_MODELS.join(', ')}`,
          filePath
        );
      }
    }

    // context validation
    if (frontmatter.context) {
      if (!VALID_CONTEXTS.includes(frontmatter.context)) {
        this.reportError(
          `Invalid context: ${frontmatter.context}. Must be one of: ${VALID_CONTEXTS.join(', ')}`,
          filePath
        );
      }
    }

    // disable-model-invocation validation
    if (
      frontmatter['disable-model-invocation'] !== undefined &&
      typeof frontmatter['disable-model-invocation'] !== 'boolean'
    ) {
      this.reportError('disable-model-invocation must be a boolean', filePath);
    }

    // user-invocable validation
    if (
      frontmatter['user-invocable'] !== undefined &&
      typeof frontmatter['user-invocable'] !== 'boolean'
    ) {
      this.reportError('user-invocable must be a boolean', filePath);
    }

    // Validate referenced files exist
    await this.validateReferencedFiles(filePath, skillName);
  }

  private async validateReferencedFiles(filePath: string, _skillName: string): Promise<void> {
    const skillDir = dirname(filePath);
    const content = await readFileContent(filePath);

    // Extract markdown links: [text](./file.md)
    const linkRegex = /\[([^\]]+)\]\(\.\/([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const [, , referencedPath] = match;
      const fullPath = resolvePath(skillDir, referencedPath);

      const exists = await fileExists(fullPath);
      if (!exists) {
        this.reportError(`Referenced file not found: ${referencedPath}`, filePath);
      }
    }
  }

  private validateMarkdownContent(filePath: string, content: string): void {
    // Remove frontmatter for structure validation
    const { content: markdownContent } = extractFrontmatter(content);

    // Check for H1 heading
    if (!startsWithH1(markdownContent)) {
      this.reportWarning(
        'Skill content should start with a top-level heading after frontmatter',
        filePath
      );
    }

    // Validate markdown structure
    const issues = validateMarkdownStructure(markdownContent);
    for (const issue of issues) {
      this.reportWarning(`${issue.rule}: ${issue.message}`, filePath, issue.line);
    }
  }

  private validateStringSubstitutions(filePath: string, content: string): void {
    // Valid substitutions: $ARGUMENTS, $0, $1, etc., ${CLAUDE_SESSION_ID}
    const invalidSubstitutionRegex = /\$[A-Z_]+(?!\{)/g;
    const validSubstitutions = ['$ARGUMENTS'];

    let match;
    while ((match = invalidSubstitutionRegex.exec(content)) !== null) {
      const substitution = match[0];
      if (!validSubstitutions.includes(substitution) && !/^\$\d+$/.test(substitution)) {
        this.reportWarning(
          `Unknown string substitution: ${substitution}. ` +
            `Valid substitutions: $ARGUMENTS, $0-$9, \${VARIABLE}`,
          filePath
        );
      }
    }
  }
}
