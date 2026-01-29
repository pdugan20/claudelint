import { BaseValidator, ValidationResult, BaseValidatorOptions } from './base';
import {
  findClaudeMdFiles,
  readFileContent,
  fileExists,
  resolvePath,
} from '../utils/file-system';
import { lstat, readlink } from 'fs/promises';
import { basename } from 'path';
import { extractImportsWithLineNumbers } from '../utils/markdown';
import { validateFrontmatterWithSchema } from '../utils/schema-helpers';
import { ClaudeMdFrontmatterSchema } from '../schemas/claude-md-frontmatter.schema';
import { formatError } from '../utils/validation-helpers';
import {
  // CLAUDE_MD_SIZE_ERROR_THRESHOLD moved to new size-error rule
  // CLAUDE_MD_SIZE_WARNING_THRESHOLD moved to new size-warning rule
  CLAUDE_MD_MAX_IMPORT_DEPTH,
  // CLAUDE_MD_MAX_SECTIONS moved to new content-too-many-sections rule
} from './constants';
import { dirname } from 'path';
import { minimatch } from 'minimatch';
import { ValidatorRegistry } from '../utils/validator-factory';

// Auto-register all rules
import '../rules';

// Import new-style rules (pilot migration)
import { rule as claudeMdSizeErrorRule } from '../rules/claude-md/claude-md-size-error';
import { rule as claudeMdSizeWarningRule } from '../rules/claude-md/claude-md-size-warning';
import { rule as claudeMdContentTooManySectionsRule } from '../rules/claude-md/claude-md-content-too-many-sections';
import { rule as claudeMdGlobPatternBackslashRule } from '../rules/claude-md/claude-md-glob-pattern-backslash';
import { rule as claudeMdGlobPatternTooBroadRule } from '../rules/claude-md/claude-md-glob-pattern-too-broad';
import { rule as claudeMdImportInCodeBlockRule } from '../rules/claude-md/claude-md-import-in-code-block';

/**
 * Options specific to CLAUDE.md validator
 * Extends BaseValidatorOptions with no additional options
 */
export interface ClaudeMdValidatorOptions extends BaseValidatorOptions {
  // No additional options specific to CLAUDE.md validator
}

/**
 * Options for size-error rule
 */
export interface SizeErrorOptions {
  /** Maximum file size in bytes before reporting error (default: 40000) */
  maxSize?: number;
}

/**
 * Options for size-warning rule
 */
export interface SizeWarningOptions {
  /** Maximum file size in bytes before reporting warning (default: 35000) */
  maxSize?: number;
}

/**
 * Options for import-circular rule
 */
export interface ImportCircularOptions {
  /** Maximum import depth before reporting circular import (default: 5) */
  maxDepth?: number;
  /** Allow a file to import itself (default: false) */
  allowSelfReference?: boolean;
  /** Glob patterns for files to ignore in circular import checks (default: []) */
  ignorePatterns?: string[];
}

/**
 * Validates CLAUDE.md files for size, format, and structure
 */
export class ClaudeMdValidator extends BaseValidator {
  private basePath: string;
  private processedImports = new Set<string>();
  private caseInsensitivePathMap = new Map<string, string>(); // normalized path -> actual path

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
    // Set current file for config resolution
    this.setCurrentFile(filePath);

    // Read content first
    const content = await readFileContent(filePath);

    // Parse disable comments
    this.parseDisableComments(filePath, content);

    // NEW: Execute new-style size rules
    await this.executeRule(claudeMdSizeErrorRule, filePath, content);
    await this.executeRule(claudeMdSizeWarningRule, filePath, content);

    // Check for frontmatter (only in .claude/rules/*.md files)
    if (filePath.includes('.claude/rules/')) {
      await this.checkFrontmatter(filePath, content);
    }

    // NEW: Execute glob pattern validation rules
    await this.executeRule(claudeMdGlobPatternBackslashRule, filePath, content);
    await this.executeRule(claudeMdGlobPatternTooBroadRule, filePath, content);

    // NEW: Execute content organization rule
    await this.executeRule(claudeMdContentTooManySectionsRule, filePath, content);

    // NEW: Check for imports in code blocks
    await this.executeRule(claudeMdImportInCodeBlockRule, filePath, content);

    // Check imports and validate recursively
    await this.checkImports(filePath, content);

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
      ClaudeMdFrontmatterSchema,
      filePath,
      'claude-md'
    );

    // Merge schema validation results (not configurable)
    this.mergeSchemaValidationResult(result);

    // If no frontmatter, that's okay - it's optional for rules files
    if (!frontmatter) {
      return;
    }

    // Glob pattern validation is now handled by separate rules:
    // - claude-md-glob-pattern-backslash
    // - claude-md-glob-pattern-too-broad
  }


  /**
   * Check if a path is involved in a circular symlink chain
   */
  private async checkSymlinkCycle(filePath: string, _originPath: string): Promise<boolean> {
    try {
      const stats = await lstat(filePath);

      if (!stats.isSymbolicLink()) {
        return false;
      }

      const visited = new Set<string>();
      let currentPath = filePath;
      visited.add(currentPath);

      // Follow symlink chain
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const linkStats = await lstat(currentPath);

        if (!linkStats.isSymbolicLink()) {
          break;
        }

        const targetPath = await readlink(currentPath);
        const resolvedTarget = resolvePath(dirname(currentPath), targetPath);

        // Check if we've created a cycle
        if (visited.has(resolvedTarget)) {
          return true;
        }

        visited.add(resolvedTarget);
        currentPath = resolvedTarget;

        // Safety limit to prevent infinite loops
        if (visited.size > 100) {
          return true;
        }
      }

      return false;
    } catch (error) {
      // If we can't read the symlink, it might be broken but not circular
      return false;
    }
  }

  /**
   * Check for case-sensitive filename collisions
   */
  private checkCaseSensitivity(filePath: string, originPath: string): void {
    const normalized = filePath.toLowerCase();
    const existingPath = this.caseInsensitivePathMap.get(normalized);

    if (existingPath && existingPath !== filePath) {
      this.reportWarning(
        `Case-sensitive filename collision detected: "${basename(filePath)}" and "${basename(existingPath)}" differ only in case. ` +
        `This may cause issues on case-insensitive filesystems (macOS, Windows).`,
        originPath,
        undefined,
        'claude-md-filename-case-sensitive'
      );
    } else {
      this.caseInsensitivePathMap.set(normalized, filePath);
    }
  }

  private async checkImports(filePath: string, content: string, depth = 0): Promise<void> {
    // Get configured options for circular import checking
    const circularOptions = this.getRuleOptions<ImportCircularOptions>('claude-md-import-circular');
    const maxDepth = circularOptions?.maxDepth ?? CLAUDE_MD_MAX_IMPORT_DEPTH;
    const allowSelfReference = circularOptions?.allowSelfReference ?? false;
    const ignorePatterns = circularOptions?.ignorePatterns ?? [];

    if (depth > maxDepth) {
      this.reportError(
        `Import depth exceeds maximum of ${maxDepth}. Possible circular import.`,
        filePath
      );
      return;
    }

    const imports = extractImportsWithLineNumbers(content);

    for (const importInfo of imports) {
      // Resolve import path relative to current file
      const baseDir = dirname(filePath);
      const resolvedPath = resolvePath(baseDir, importInfo.path);

      // Check if this file should be ignored
      const shouldIgnore = ignorePatterns.some((pattern) => minimatch(resolvedPath, pattern));
      if (shouldIgnore) {
        continue;
      }

      // Check for case-sensitive filename collisions
      this.checkCaseSensitivity(resolvedPath, filePath);

      // Check for circular symlinks
      const hasSymlinkCycle = await this.checkSymlinkCycle(resolvedPath, filePath);
      if (hasSymlinkCycle) {
        this.reportError(
          `Circular symlink detected: ${importInfo.path}`,
          filePath,
          importInfo.line,
          'claude-md-rules-circular-symlink'
        );
        continue;
      }

      // Check for self-reference (file importing itself)
      if (filePath === resolvedPath) {
        if (!allowSelfReference) {
          this.reportWarning(
            `File imports itself: ${importInfo.path}`,
            filePath,
            importInfo.line,
            'claude-md-import-circular'
          );
        }
        continue;
      }

      // Check for circular imports
      if (this.processedImports.has(resolvedPath)) {
        this.reportWarning(
          `Circular import detected: ${importInfo.path}`,
          filePath,
          importInfo.line,
          'claude-md-import-circular'
        );
        continue;
      }

      // Check if imported file exists
      const exists = await fileExists(resolvedPath);
      if (!exists) {
        this.reportError(
          `Imported file not found: ${importInfo.path}`,
          filePath,
          importInfo.line,
          'claude-md-import-missing',
          {
            explanation:
              'Claude Code cannot load the imported file. This will cause the context to be incomplete ' +
              'and may result in unexpected behavior.',
            howToFix:
              `1. Check if the file path is correct: ${resolvedPath}\n` +
              `2. Create the missing file if needed\n` +
              `3. Fix the import path in ${filePath}\n` +
              `4. Import paths are relative to the current file's directory`,
            fix: `Create the file at ${resolvedPath} or fix the import path`,
          }
        );
        continue;
      }

      // Mark as processed and validate recursively
      this.processedImports.add(resolvedPath);

      try {
        const importedContent = await readFileContent(resolvedPath);
        await this.checkImports(resolvedPath, importedContent, depth + 1);
      } catch (error) {
        this.reportError(
          `Failed to read imported file: ${formatError(error)}`,
          filePath,
          importInfo.line
        );
      }
    }
  }
}

// Register validator with factory
ValidatorRegistry.register(
  {
    id: 'claude-md',
    name: 'CLAUDE.md Validator',
    description: 'Validates CLAUDE.md files for size, format, and structure',
    filePatterns: ['**/CLAUDE.md', '**/.claude/rules/*.md'],
    enabled: true,
  },
  (options) => new ClaudeMdValidator(options)
);
