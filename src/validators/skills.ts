import { BaseValidator, ValidationResult, BaseValidatorOptions } from './base';
import {
  findSkillDirectories,
  readFileContent,
  fileExists,
  resolvePath,
} from '../utils/file-system';
import { validateFrontmatterWithSchema } from '../utils/schema-helpers';
import { SkillFrontmatterWithRefinements } from '../schemas/skill-frontmatter.schema';
import {
  // SKILL_MAX_ROOT_FILES moved to skill-too-many-files rule
  // SKILL_MAX_DIRECTORY_DEPTH moved to skill-deep-nesting rule
  SKILL_MAX_SCRIPT_FILES,
  // SKILL_MIN_COMMENT_LINES moved to skill-missing-comments rule
  // SKILL_MIN_NAMING_CONSISTENCY moved to skill-naming-inconsistent rule
  MARKDOWN_LINK_REGEX,
  // SHELL_EVAL_REGEX moved to skill-eval-usage rule
  // PYTHON_EVAL_EXEC_REGEX moved to skill-eval-usage rule
  // PATH_TRAVERSAL_REGEX moved to skill-path-traversal rule
  // DANGEROUS_COMMANDS moved to skill-dangerous-command rule
} from './constants';
import { SCRIPT_EXTENSIONS } from '../schemas/constants';
import { basename, dirname, join } from 'path';
import { readdir } from 'fs/promises';
import { ValidatorRegistry } from '../utils/validator-factory';

// Auto-register all rules
import '../rules';

// Import new-style rules
import { rule as skillDangerousCommandRule } from '../rules/skills/skill-dangerous-command';
import { rule as skillMissingShebangRule } from '../rules/skills/skill-missing-shebang';
import { rule as skillMissingCommentsRule } from '../rules/skills/skill-missing-comments';
import { rule as skillEvalUsageRule } from '../rules/skills/skill-eval-usage';
import { rule as skillPathTraversalRule } from '../rules/skills/skill-path-traversal';
import { rule as skillMissingChangelogRule } from '../rules/skills/skill-missing-changelog';
import { rule as skillMissingExamplesRule } from '../rules/skills/skill-missing-examples';
import { rule as skillMissingVersionRule } from '../rules/skills/skill-missing-version';
import { rule as skillTooManyFilesRule } from '../rules/skills/skill-too-many-files';
import { rule as skillDeepNestingRule } from '../rules/skills/skill-deep-nesting';
import { rule as skillNamingInconsistentRule } from '../rules/skills/skill-naming-inconsistent';
import { rule as skillTimeSensitiveContentRule } from '../rules/skills/skill-time-sensitive-content';
import { rule as skillBodyTooLongRule } from '../rules/skills/skill-body-too-long';
import { rule as skillLargeReferenceNoTocRule } from '../rules/skills/skill-large-reference-no-toc';

interface SkillFrontmatter {
  name: string;
  description: string;
  version?: string;
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

/**
 * Options specific to Skills validator
 */
export interface SkillsValidatorOptions extends BaseValidatorOptions {
  /** Validate only a specific skill by name */
  skill?: string;
}

/**
 * Validates Claude Code skills for structure and frontmatter
 */
export class SkillsValidator extends BaseValidator {
  private basePath: string;
  private specificSkill?: string;

  constructor(options: SkillsValidatorOptions = {}) {
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

    // Parse disable comments
    this.parseDisableComments(skillMdPath, content);

    // Validate frontmatter
    await this.validateFrontmatter(skillMdPath, content, skillName);

    // Validate string substitutions
    this.validateStringSubstitutions(skillMdPath, content);

    // NEW: Execute directory organization rules on SKILL.md
    await this.executeRule(skillTooManyFilesRule, skillMdPath, content);
    await this.executeRule(skillDeepNestingRule, skillMdPath, content);
    await this.executeRule(skillNamingInconsistentRule, skillMdPath, content);

    // NEW: Execute documentation rules on SKILL.md
    await this.executeRule(skillMissingChangelogRule, skillMdPath, content);
    await this.executeRule(skillMissingExamplesRule, skillMdPath, content);
    await this.executeRule(skillMissingVersionRule, skillMdPath, content);

    // NEW: Execute body content rules on SKILL.md
    await this.executeRule(skillTimeSensitiveContentRule, skillMdPath, content);
    await this.executeRule(skillBodyTooLongRule, skillMdPath, content);
    await this.executeRule(skillLargeReferenceNoTocRule, skillMdPath, content);

    // OLD: Check for multi-script README (keeping for now as it's not migrated yet)
    await this.checkMultiScriptReadme(skillDir);

    // Check best practices
    await this.checkBestPractices(skillDir);

    // Check security and safety
    await this.checkSecurityAndSafety(skillDir);

    // Report unused disable directives if configured
    if (this.options.config?.reportUnusedDisableDirectives) {
      this.reportUnusedDisables(skillMdPath);
    }
  }

  private async validateFrontmatter(
    filePath: string,
    content: string,
    skillName: string
  ): Promise<void> {
    // Use schema-based validation
    const { data: frontmatter, result } = await validateFrontmatterWithSchema(
      content,
      SkillFrontmatterWithRefinements,
      filePath,
      'skill'
    );

    // Merge schema validation results (not configurable)
    this.mergeSchemaValidationResult(result);

    // If no frontmatter parsed, schema validation already reported the error
    if (!frontmatter) {
      return;
    }

    // Custom validation: Check name matches directory
    if (frontmatter.name !== skillName) {
      this.reportError(
        `Skill name "${frontmatter.name}" does not match directory name "${skillName}"`,
        filePath
      );
    }

    // Custom validation: Check referenced files exist
    await this.validateReferencedFiles(filePath, frontmatter);
  }

  private async validateReferencedFiles(
    filePath: string,
    frontmatter: SkillFrontmatter
  ): Promise<void> {
    // Custom validation: Check allowed-tools are valid tool names
    if (frontmatter['allowed-tools']) {
      for (const tool of frontmatter['allowed-tools']) {
        this.validateToolName(tool, filePath);
      }
    }

    // Validate referenced files in markdown links exist
    const skillDir = dirname(filePath);
    const content = await readFileContent(filePath);

    // Extract markdown links: [text](./file.md)
    // Reset lastIndex since MARKDOWN_LINK_REGEX is a global regex
    MARKDOWN_LINK_REGEX.lastIndex = 0;
    let match;

    while ((match = MARKDOWN_LINK_REGEX.exec(content)) !== null) {
      const [, , referencedPath] = match;
      const fullPath = resolvePath(skillDir, referencedPath);

      const exists = await fileExists(fullPath);
      if (!exists) {
        this.reportError(`Referenced file not found: ${referencedPath}`, filePath);
      }
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


  private async checkMultiScriptReadme(skillDir: string): Promise<void> {
    // Check for README.md if skill has multiple scripts
    try {
      const entries = await readdir(skillDir, { withFileTypes: true });
      const scriptFiles = entries.filter(
        (entry) =>
          entry.isFile() && SCRIPT_EXTENSIONS.some((ext) => entry.name.endsWith(ext))
      );

      if (scriptFiles.length > SKILL_MAX_SCRIPT_FILES) {
        const readmePath = join(skillDir, 'README.md');
        const readmeExists = await fileExists(readmePath);
        if (!readmeExists) {
          this.reportWarning(
            `Skill has ${scriptFiles.length} scripts but no README.md. ` +
              'Complex skills should include a README with setup and usage instructions.',
            skillDir
          );
        }
      }
    } catch (error) {
      // Intentionally ignore directory read errors here
      // This is an optional documentation check - if we can't read the directory,
      // we skip this check rather than failing validation
    }
  }

  private async checkBestPractices(skillDir: string): Promise<void> {
    try {
      const entries = await readdir(skillDir, { withFileTypes: true });
      const shellScripts = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.sh'));

      for (const script of shellScripts) {
        const scriptPath = join(skillDir, script.name);
        const content = await readFileContent(scriptPath);

        // NEW: Execute new-style rules for shell script quality
        await this.executeRule(skillMissingShebangRule, scriptPath, content);
        await this.executeRule(skillMissingCommentsRule, scriptPath, content);
      }

    } catch (error) {
      // Intentionally ignore directory/file read errors here
      // Best practices checks are optional - if we can't read files,
      // we skip these checks rather than failing validation
    }
  }

  private async checkSecurityAndSafety(skillDir: string): Promise<void> {
    try {
      const entries = await readdir(skillDir, { withFileTypes: true });
      const scriptFiles = entries.filter(
        (entry) =>
          entry.isFile() && SCRIPT_EXTENSIONS.some((ext) => entry.name.endsWith(ext))
      );

      for (const script of scriptFiles) {
        const scriptPath = join(skillDir, script.name);
        const content = await readFileContent(scriptPath);

        // NEW: Execute security and safety rules
        await this.executeRule(skillDangerousCommandRule, scriptPath, content);
        await this.executeRule(skillEvalUsageRule, scriptPath, content);
        await this.executeRule(skillPathTraversalRule, scriptPath, content);
      }
    } catch (error) {
      // Directory read error - ignore
    }
  }
}

// Register validator with factory
ValidatorRegistry.register(
  {
    id: 'skills',
    name: 'Skills Validator',
    description: 'Validates Claude Code skill directories and SKILL.md files',
    filePatterns: ['**/.claude/skills/*/SKILL.md'],
    enabled: true,
  },
  (options) => new SkillsValidator(options)
);
