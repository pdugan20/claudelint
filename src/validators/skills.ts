import { FileValidator, ValidationResult, BaseValidatorOptions } from './file-validator';
import { findSkillDirectories, readFileContent, fileExists } from '../utils/filesystem/files';
import { validateFrontmatterWithSchema } from '../utils/formats/schema';
import { SkillFrontmatterWithRefinements } from '../schemas/skill-frontmatter.schema';
import { SCRIPT_EXTENSIONS } from '../schemas/constants';
import { basename, join } from 'path';
import { readdir } from 'fs/promises';
import { ValidatorRegistry } from '../utils/validators/factory';

// Auto-register all rules
import '../rules';

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
export class SkillsValidator extends FileValidator {
  private basePath: string;
  private specificSkill?: string;

  constructor(options: SkillsValidatorOptions = {}) {
    super(options);
    this.basePath = options.path || process.cwd();
    this.specificSkill = options.skill;
  }

  async validate(): Promise<ValidationResult> {
    const skillDirs = await this.findSkillDirs();
    const skillFiles = skillDirs.map((dir) => join(dir, 'SKILL.md'));
    this.trackValidatedFiles(skillFiles);

    if (skillDirs.length === 0) {
      this.markSkipped('no .claude/skills/');
      return this.getResult();
    }

    this.markScanned(skillFiles);

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
    const skillMdPath = join(skillDir, 'SKILL.md');

    // Check SKILL.md exists
    const exists = await fileExists(skillMdPath);
    if (!exists) {
      throw new Error(`SKILL.md not found in skill directory: ${skillDir}`);
    }

    // Read content
    const content = await readFileContent(skillMdPath);

    // Parse disable comments
    this.parseDisableComments(skillMdPath, content);

    // Validate frontmatter
    this.validateFrontmatter(skillMdPath, content);

    // Execute ALL Skills rules on SKILL.md via category-based discovery
    // Rules filter themselves based on file type (SKILL.md vs script files)
    // This includes: string substitutions, referenced files, and all other validations
    await this.executeRulesForCategory('Skills', skillMdPath, content);

    // Check script files (best practices + security/safety in a single pass)
    await this.checkScriptFiles(skillDir);

    // Report unused disable directives if configured
    if (this.options.config?.reportUnusedDisableDirectives) {
      this.reportUnusedDisables(skillMdPath);
    }
  }

  private validateFrontmatter(filePath: string, content: string): void {
    // Use schema-based validation
    const { data: frontmatter, result } = validateFrontmatterWithSchema(
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
  }

  private async checkScriptFiles(skillDir: string): Promise<void> {
    try {
      const entries = await readdir(skillDir, { withFileTypes: true });
      const scriptFiles = entries.filter(
        (entry) => entry.isFile() && SCRIPT_EXTENSIONS.some((ext) => entry.name.endsWith(ext))
      );

      for (const script of scriptFiles) {
        const scriptPath = join(skillDir, script.name);
        const content = await readFileContent(scriptPath);

        // Execute ALL Skills rules on script files via category-based discovery
        // Rules filter themselves based on file type (SKILL.md vs script files)
        await this.executeRulesForCategory('Skills', scriptPath, content);
      }
    } catch {
      // Directory read error - skip
    }
  }
}

// Register validator with factory
ValidatorRegistry.register(
  {
    id: 'skills',
    name: 'Skills Validator',
    description: 'Validates Claude Code skill directories and SKILL.md files',
    filePatterns: ['**/.claude/skills/*/SKILL.md', 'skills/*/SKILL.md'],
    enabled: true,
  },
  (options) => new SkillsValidator(options)
);
