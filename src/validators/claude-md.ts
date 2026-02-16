import { FileValidator, ValidationResult, BaseValidatorOptions } from './file-validator';
import { findClaudeMdFiles, readFileContent, fileExists } from '../utils/filesystem/files';
import { validateFrontmatterWithSchema } from '../utils/formats/schema';
import { RulesFrontmatterSchema } from '../schemas/rules-frontmatter.schema';
import { ValidatorRegistry } from '../utils/validators/factory';

// Auto-register all rules
import '../rules';

/**
 * Options specific to CLAUDE.md validator
 * Extends BaseValidatorOptions with no additional options
 */
export type ClaudeMdValidatorOptions = BaseValidatorOptions;

/**
 * Validates CLAUDE.md files for size, format, and structure
 */
export class ClaudeMdValidator extends FileValidator {
  private basePath: string;

  constructor(options: ClaudeMdValidatorOptions = {}) {
    super(options);
    this.basePath = options.path || process.cwd();
  }

  async validate(): Promise<ValidationResult> {
    // Handle stdin mode
    const virtualFile = this.getVirtualFile();
    if (virtualFile) {
      this.trackValidatedFiles([virtualFile.path]);
      this.markScanned([virtualFile.path]);
      await this.validateFileContent(virtualFile.path, virtualFile.content);
      return this.getResult();
    }

    const files = await this.findFiles();
    this.trackValidatedFiles(files);

    if (files.length === 0) {
      this.markSkipped('no CLAUDE.md');
      return this.getResult();
    }

    this.markScanned(files);

    for (const file of files) {
      await this.validateFile(file);
    }

    return this.getResult();
  }

  private async findFiles(): Promise<string[]> {
    if (this.options.path) {
      // If specific path provided, validate just that file
      return [this.options.path];
    }

    // Otherwise find all CLAUDE.md files
    return findClaudeMdFiles(this.basePath);
  }

  private async validateFile(filePath: string): Promise<void> {
    // Check file exists first (operational error if missing)
    const exists = await fileExists(filePath);
    if (!exists) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Read content
    const content = await readFileContent(filePath);
    await this.validateFileContent(filePath, content);
  }

  private async validateFileContent(filePath: string, content: string): Promise<void> {
    // Set current file for config resolution
    this.setCurrentFile(filePath);

    // Parse disable comments
    this.parseDisableComments(filePath, content);

    // Check for frontmatter (only in .claude/rules/*.md files)
    if (filePath.includes('.claude/rules/')) {
      await this.checkFrontmatter(filePath, content);
    }

    // Execute ALL CLAUDE.md rules via category-based discovery
    // All validation logic is in rule files under src/rules/claude-md/
    await this.executeRulesForCategory('CLAUDE.md', filePath, content);

    // Report unused disable directives if configured
    if (this.options.config?.reportUnusedDisableDirectives) {
      this.reportUnusedDisables(filePath);
    }
  }

  private async checkFrontmatter(filePath: string, content: string): Promise<void> {
    // Ensure async for API consistency
    await Promise.resolve();

    // Use schema-based validation
    const { data: frontmatter, result } = validateFrontmatterWithSchema(
      content,
      RulesFrontmatterSchema,
      filePath,
      'claude-md'
    );

    // Merge schema validation results (not configurable)
    this.mergeSchemaValidationResult(result);

    // If no frontmatter, that's okay - it's optional for rules files
    if (!frontmatter) {
      return;
    }
  }
}

// Register validator with factory
ValidatorRegistry.register(
  {
    id: 'claude-md',
    name: 'CLAUDE.md Validator',
    description: 'Validates CLAUDE.md files for size, format, and structure',
    filePatterns: [
      '**/CLAUDE.md',
      '**/.claude/CLAUDE.md',
      '**/CLAUDE.local.md',
      '**/.claude/rules/*.md',
      '**/.claude/rules/**/*.md',
    ],
    enabled: true,
  },
  (options) => new ClaudeMdValidator(options)
);
