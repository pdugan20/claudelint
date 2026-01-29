import { BaseValidator, ValidationResult, BaseValidatorOptions } from './base';
import {
  findOutputStyleDirectories,
  readFileContent,
  fileExists,
} from '../utils/file-system';
import { validateFrontmatterWithSchema } from '../utils/schema-helpers';
import { OutputStyleFrontmatterSchema } from '../schemas/output-style-frontmatter.schema';
import { basename, join } from 'path';
import { ValidatorRegistry } from '../utils/validator-factory';

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
export class OutputStylesValidator extends BaseValidator {
  private basePath: string;
  private specificOutputStyle?: string;

  constructor(options: OutputStylesValidatorOptions = {}) {
    super(options);
    this.basePath = options.path || process.cwd();
    this.specificOutputStyle = options.outputStyle;
  }

  async validate(): Promise<ValidationResult> {
    const outputStyleDirs = await this.findOutputStyleDirs();

    if (outputStyleDirs.length === 0) {
      this.reportWarning('No output style directories found');
      return this.getResult();
    }

    for (const outputStyleDir of outputStyleDirs) {
      await this.validateOutputStyle(outputStyleDir);
    }

    return this.getResult();
  }

  private async findOutputStyleDirs(): Promise<string[]> {
    const allOutputStyleDirs = await findOutputStyleDirectories(this.basePath);

    if (this.specificOutputStyle) {
      // Filter to specific output style
      return allOutputStyleDirs.filter((dir) => basename(dir) === this.specificOutputStyle);
    }

    return allOutputStyleDirs;
  }

  private async validateOutputStyle(outputStyleDir: string): Promise<void> {
    const outputStyleName = basename(outputStyleDir);
    const outputStyleMdPath = join(outputStyleDir, 'OUTPUT_STYLE.md');

    // Check OUTPUT_STYLE.md exists
    const exists = await fileExists(outputStyleMdPath);
    if (!exists) {
      this.reportError(`OUTPUT_STYLE.md not found in output style directory`, outputStyleDir);
      return;
    }

    // Read content
    const content = await readFileContent(outputStyleMdPath);

    // Parse disable comments
    this.parseDisableComments(outputStyleMdPath, content);

    // Validate frontmatter
    await this.validateFrontmatter(outputStyleMdPath, content, outputStyleName);

    // Validate body content
    this.validateBodyContent(outputStyleMdPath, content);

    // Report unused disable directives if configured
    if (this.options.config?.reportUnusedDisableDirectives) {
      this.reportUnusedDisables(outputStyleMdPath);
    }
  }

  private async validateFrontmatter(
    filePath: string,
    content: string,
    outputStyleName: string
  ): Promise<void> {
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

    // Custom validation: Check name matches directory
    if (frontmatter.name !== outputStyleName) {
      this.reportError(
        `Output style name "${frontmatter.name}" does not match directory name "${outputStyleName}"`,
        filePath
      );
    }
  }

  private validateBodyContent(filePath: string, content: string): void {
    // Extract body content (everything after frontmatter)
    const parts = content.split('---');
    if (parts.length < 3) {
      return; // No body content or invalid frontmatter
    }

    const body = parts.slice(2).join('---').trim();

    // Validate minimum body content length
    if (body.length < 50) {
      this.reportWarning(
        'Output style body content is very short. Consider adding more examples and guidelines.',
        filePath
      );
    }

    // Check for example section
    const hasExamples = /#{1,3}\s*examples?/i.test(body);
    if (!hasExamples) {
      this.reportWarning(
        'Output style should include an "Examples" section demonstrating the style.',
        filePath
      );
    }

    // Check for guidelines section
    const hasGuidelines = /#{1,3}\s*(guidelines?|rules?|format)/i.test(body);
    if (!hasGuidelines) {
      this.reportWarning(
        'Output style should include a "Guidelines" or "Format" section.',
        filePath
      );
    }
  }
}

// Register validator with factory
ValidatorRegistry.register(
  {
    id: 'output-styles',
    name: 'Output Styles Validator',
    description: 'Validates Claude Code output style structure and frontmatter',
    filePatterns: ['**/.claude/output_styles/*/OUTPUT_STYLE.md'],
    enabled: true,
  },
  (options) => new OutputStylesValidator(options)
);
