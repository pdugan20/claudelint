import { FileValidator, ValidationResult, BaseValidatorOptions } from './file-validator';
import { findOutputStyleFiles, readFileContent } from '../utils/filesystem/files';
import { validateFrontmatterWithSchema } from '../utils/formats/schema';
import { OutputStyleFrontmatterSchema } from '../schemas/output-style-frontmatter.schema';
import { basename, dirname } from 'path';
import { ValidatorRegistry } from '../utils/validators/factory';

// Auto-register all rules
import '../rules';

/**
 * Options specific to Output Styles validator
 */
export interface OutputStylesValidatorOptions extends BaseValidatorOptions {
  /** Validate only a specific output style by name */
  outputStyle?: string;
}

/**
 * Validates Claude Code output styles for structure and frontmatter
 */
export class OutputStylesValidator extends FileValidator {
  private basePath: string;
  private specificOutputStyle?: string;

  constructor(options: OutputStylesValidatorOptions = {}) {
    super(options);
    this.basePath = options.path || process.cwd();
    this.specificOutputStyle = options.outputStyle;
  }

  async validate(): Promise<ValidationResult> {
    const outputStyleFiles = await this.findOutputStyleFiles();
    this.trackValidatedFiles(outputStyleFiles);

    if (outputStyleFiles.length === 0) {
      this.markSkipped('no output styles');
      return this.getResult();
    }

    this.markScanned(outputStyleFiles);

    for (const outputStyleFile of outputStyleFiles) {
      await this.validateOutputStyle(outputStyleFile);
    }

    return this.getResult();
  }

  private async findOutputStyleFiles(): Promise<string[]> {
    const allOutputStyleFiles = await findOutputStyleFiles(this.basePath);

    if (this.specificOutputStyle) {
      // Filter to specific output style by parent directory name
      return allOutputStyleFiles.filter(
        (file) => basename(dirname(file)) === this.specificOutputStyle
      );
    }

    return allOutputStyleFiles;
  }

  private async validateOutputStyle(outputStylePath: string): Promise<void> {
    // Read content
    const content = await readFileContent(outputStylePath);

    // Parse disable comments
    this.parseDisableComments(outputStylePath, content);

    // Validate frontmatter
    await this.validateFrontmatter(outputStylePath, content);

    // Execute ALL Output-styles rules via category-based discovery
    await this.executeRulesForCategory('OutputStyles', outputStylePath, content);

    // Report unused disable directives if configured
    if (this.options.config?.reportUnusedDisableDirectives) {
      this.reportUnusedDisables(outputStylePath);
    }
  }

  private async validateFrontmatter(filePath: string, content: string): Promise<void> {
    // Ensure async for API consistency
    await Promise.resolve();

    // Use schema-based validation
    const { data: frontmatter, result } = validateFrontmatterWithSchema(
      content,
      OutputStyleFrontmatterSchema,
      filePath,
      'output-style'
    );

    // Merge schema validation results (not configurable)
    this.mergeSchemaValidationResult(result);

    // If no frontmatter parsed, schema validation already reported the error
    if (!frontmatter) {
      return;
    }
  }
}

// Register validator with factory
ValidatorRegistry.register(
  {
    id: 'output-styles',
    name: 'Output Styles Validator',
    description: 'Validates Claude Code output style structure and frontmatter',
    filePatterns: ['**/.claude/output-styles/*/*.md'],
    enabled: true,
  },
  (options) => new OutputStylesValidator(options)
);
