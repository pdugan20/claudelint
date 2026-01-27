import { BaseValidator, ValidationResult } from './base';
import {
  findClaudeMdFiles,
  readFileContent,
  getFileSize,
  fileExists,
  resolvePath,
} from '../utils/file-system';
import {
  extractFrontmatter,
  extractImports,
  startsWithH1,
  validateMarkdownStructure,
} from '../utils/markdown';
import { dirname } from 'path';

const SIZE_WARNING_THRESHOLD = 35_000; // 35KB - warn when approaching limit
const SIZE_ERROR_THRESHOLD = 40_000; // 40KB - hard limit for performance

interface ClaudeRuleFrontmatter {
  paths?: string | string[];
  [key: string]: unknown;
}

interface ClaudeMdValidatorOptions {
  path?: string;
  verbose?: boolean;
  warningsAsErrors?: boolean;
}

/**
 * Validates CLAUDE.md files for size, format, and structure
 */
export class ClaudeMdValidator extends BaseValidator {
  private basePath: string;
  private processedImports = new Set<string>();

  constructor(options: ClaudeMdValidatorOptions = {}) {
    super(options);
    this.basePath = options.path || process.cwd();
  }

  async validate(): Promise<ValidationResult> {
    const files = await this.findFiles();

    for (const file of files) {
      await this.validateFile(file);
    }

    return this.getResult();
  }

  private async findFiles(): Promise<string[]> {
    if (this.options.path) {
      // If specific path provided, validate just that file
      const exists = await fileExists(this.options.path);
      if (!exists) {
        this.reportError(`File not found: ${this.options.path}`);
        return [];
      }
      return [this.options.path];
    }

    // Otherwise find all CLAUDE.md files
    return findClaudeMdFiles(this.basePath);
  }

  private async validateFile(filePath: string): Promise<void> {
    // Check file size
    await this.checkFileSize(filePath);

    // Read content
    const content = await readFileContent(filePath);

    // Check markdown structure
    this.checkMarkdownStructure(filePath, content);

    // Check for frontmatter (only in .claude/rules/*.md files)
    if (filePath.includes('.claude/rules/')) {
      this.checkFrontmatter(filePath, content);
    }

    // Check imports and validate recursively
    await this.checkImports(filePath, content);
  }

  private async checkFileSize(filePath: string): Promise<void> {
    const size = await getFileSize(filePath);

    if (size >= SIZE_ERROR_THRESHOLD) {
      this.reportError(
        `File exceeds ${SIZE_ERROR_THRESHOLD / 1000}KB limit (${size} bytes). ` +
          `This will cause performance issues in Claude Code.`,
        filePath
      );
    } else if (size >= SIZE_WARNING_THRESHOLD) {
      this.reportWarning(
        `File approaching size limit (${size} bytes). ` +
          `Consider splitting into multiple files or moving content to .claude/rules/`,
        filePath
      );
    }
  }

  private checkMarkdownStructure(filePath: string, content: string): void {
    // Check for H1 heading at start
    if (!startsWithH1(content)) {
      this.reportWarning('File should start with a top-level heading (# Title)', filePath, 1);
    }

    // Validate other markdown issues
    const issues = validateMarkdownStructure(content);
    for (const issue of issues) {
      this.reportWarning(`${issue.rule}: ${issue.message}`, filePath, issue.line);
    }
  }

  private checkFrontmatter(filePath: string, content: string): void {
    try {
      const { frontmatter, hasFrontmatter } = extractFrontmatter<ClaudeRuleFrontmatter>(content);

      if (!hasFrontmatter) {
        // Frontmatter is optional for rules files
        return;
      }

      if (!frontmatter) {
        this.reportError('Invalid frontmatter YAML syntax', filePath);
        return;
      }

      // Validate paths field if present
      if (frontmatter.paths) {
        this.validatePathsField(filePath, frontmatter.paths);
      }

      // Check for unknown fields
      const knownFields = ['paths'];
      const unknownFields = Object.keys(frontmatter).filter((key) => !knownFields.includes(key));

      if (unknownFields.length > 0) {
        this.reportWarning(`Unknown frontmatter fields: ${unknownFields.join(', ')}`, filePath);
      }
    } catch (error) {
      this.reportError(
        `Failed to parse frontmatter: ${error instanceof Error ? error.message : String(error)}`,
        filePath
      );
    }
  }

  private validatePathsField(filePath: string, paths: string | string[]): void {
    if (typeof paths === 'string') {
      this.reportError('paths field must be an array, not a string', filePath);
      return;
    }

    if (!Array.isArray(paths)) {
      this.reportError('paths field must be an array', filePath);
      return;
    }

    // Basic validation of glob patterns
    for (const pattern of paths) {
      if (typeof pattern !== 'string') {
        this.reportError(`Invalid path pattern (must be string): ${String(pattern)}`, filePath);
      }
      // Could add more sophisticated glob validation here
    }
  }

  private async checkImports(filePath: string, content: string, depth = 0): Promise<void> {
    const MAX_IMPORT_DEPTH = 5;

    if (depth > MAX_IMPORT_DEPTH) {
      this.reportError(
        `Import depth exceeds maximum of ${MAX_IMPORT_DEPTH}. Possible circular import.`,
        filePath
      );
      return;
    }

    const imports = extractImports(content);

    for (const importPath of imports) {
      // Resolve import path relative to current file
      const baseDir = dirname(filePath);
      const resolvedPath = resolvePath(baseDir, importPath);

      // Check for circular imports
      if (this.processedImports.has(resolvedPath)) {
        this.reportWarning(`Circular import detected: ${importPath}`, filePath);
        continue;
      }

      // Check if imported file exists
      const exists = await fileExists(resolvedPath);
      if (!exists) {
        this.reportError(`Imported file not found: ${importPath}`, filePath);
        continue;
      }

      // Mark as processed and validate recursively
      this.processedImports.add(resolvedPath);

      try {
        const importedContent = await readFileContent(resolvedPath);
        await this.checkImports(resolvedPath, importedContent, depth + 1);
      } catch (error) {
        this.reportError(
          `Failed to read imported file: ${error instanceof Error ? error.message : String(error)}`,
          filePath
        );
      }
    }
  }
}
