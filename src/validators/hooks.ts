import { BaseValidator, ValidationResult } from './base';
import { findHooksFiles, readFileContent, fileExists } from '../utils/file-system';
import { z } from 'zod';
import { dirname, join, resolve } from 'path';

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

const VALID_HOOK_EVENTS = [
  'PreToolUse',
  'PostToolUse',
  'PostToolUseFailure',
  'PermissionRequest',
  'UserPromptSubmit',
  'Notification',
  'Stop',
  'SubagentStart',
  'SubagentStop',
  'PreCompact',
  'Setup',
  'SessionStart',
  'SessionEnd',
];

const VALID_HOOK_TYPES = ['command', 'prompt', 'agent'];

// Zod schemas
const MatcherSchema = z.object({
  tool: z.string().optional(),
  pattern: z.string().optional(),
});

const HookSchema = z.object({
  event: z.string(),
  matcher: MatcherSchema.optional(),
  type: z.enum(['command', 'prompt', 'agent']),
  command: z.string().optional(),
  prompt: z.string().optional(),
  agent: z.string().optional(),
  exitCodeHandling: z
    .object({
      0: z.string().optional(), // allow
      1: z.string().optional(), // custom handling
      2: z.string().optional(), // block
    })
    .optional(),
});

const HooksConfigSchema = z.object({
  hooks: z.array(HookSchema),
});

/**
 * Validates Claude Code hooks.json files
 */
export class HooksValidator extends BaseValidator {
  private basePath: string;

  constructor(options: { path?: string; verbose?: boolean; warningsAsErrors?: boolean } = {}) {
    super(options);
    this.basePath = options.path || process.cwd();
  }

  async validate(): Promise<ValidationResult> {
    const files = await this.findFiles();

    if (files.length === 0) {
      this.reportWarning('No hooks.json files found');
      return this.getResult();
    }

    for (const file of files) {
      await this.validateFile(file);
    }

    return this.getResult();
  }

  private async findFiles(): Promise<string[]> {
    if (this.options.path) {
      const exists = await fileExists(this.options.path);
      if (!exists) {
        this.reportError(`File not found: ${this.options.path}`);
        return [];
      }
      return [this.options.path];
    }

    return findHooksFiles(this.basePath);
  }

  private async validateFile(filePath: string): Promise<void> {
    // Read and parse JSON
    let content: string;
    let config: unknown;

    try {
      content = await readFileContent(filePath);
    } catch (error) {
      this.reportError(
        `Failed to read file: ${error instanceof Error ? error.message : String(error)}`,
        filePath
      );
      return;
    }

    try {
      config = JSON.parse(content);
    } catch (error) {
      this.reportError(
        `Invalid JSON syntax: ${error instanceof Error ? error.message : String(error)}`,
        filePath
      );
      return;
    }

    // Validate against schema
    try {
      const result = HooksConfigSchema.safeParse(config);

      if (!result.success) {
        for (const issue of result.error.issues) {
          this.reportError(`${issue.path.join('.')}: ${issue.message}`, filePath);
        }
        return;
      }

      // Additional validation with parsed config
      await this.validateHooksConfig(filePath, result.data);
    } catch (error) {
      this.reportError(
        `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
        filePath
      );
    }
  }

  private async validateHooksConfig(
    filePath: string,
    config: z.infer<typeof HooksConfigSchema>
  ): Promise<void> {
    for (const hook of config.hooks) {
      await this.validateHook(filePath, hook);
    }
  }

  private async validateHook(filePath: string, hook: z.infer<typeof HookSchema>): Promise<void> {
    // Validate event name
    if (!VALID_HOOK_EVENTS.includes(hook.event)) {
      this.reportWarning(
        `Unknown hook event: ${hook.event}. Valid events: ${VALID_HOOK_EVENTS.join(', ')}`,
        filePath
      );
    }

    // Validate hook type
    if (!VALID_HOOK_TYPES.includes(hook.type)) {
      this.reportError(
        `Invalid hook type: ${hook.type}. Must be one of: ${VALID_HOOK_TYPES.join(', ')}`,
        filePath
      );
    }

    // Validate hook has required field for its type
    if (hook.type === 'command') {
      if (!hook.command) {
        this.reportError('Hook with type "command" must have "command" field', filePath);
      } else {
        // Validate command script exists if it's a file path
        await this.validateCommandScript(filePath, hook.command);
      }
    }

    if (hook.type === 'prompt' && !hook.prompt) {
      this.reportError('Hook with type "prompt" must have "prompt" field', filePath);
    }

    if (hook.type === 'agent' && !hook.agent) {
      this.reportError('Hook with type "agent" must have "agent" field', filePath);
    }

    // Validate matcher
    if (hook.matcher) {
      this.validateMatcher(filePath, hook.matcher);
    }
  }

  private validateMatcher(filePath: string, matcher: z.infer<typeof MatcherSchema>): void {
    // Validate tool name
    if (matcher.tool && !VALID_TOOLS.includes(matcher.tool)) {
      this.reportWarning(`Unknown tool in matcher: ${matcher.tool}`, filePath);
    }

    // Validate pattern if present
    if (matcher.pattern) {
      // Basic regex validation - try to create a regex
      try {
        new RegExp(matcher.pattern);
      } catch (error) {
        this.reportError(
          `Invalid regex pattern in matcher: ${error instanceof Error ? error.message : String(error)}`,
          filePath
        );
      }
    }
  }

  private async validateCommandScript(filePath: string, command: string): Promise<void> {
    // Skip validation for inline commands (contain spaces or shell operators)
    if (
      command.includes(' ') ||
      command.includes('&&') ||
      command.includes('||') ||
      command.includes('|')
    ) {
      return;
    }

    // Skip validation for commands with variables
    if (command.includes('${') || command.includes('$')) {
      return;
    }

    // Check if it's a relative path script
    if (command.startsWith('./') || command.startsWith('../')) {
      const baseDir = dirname(filePath);
      const scriptPath = resolve(join(baseDir, command));

      const exists = await fileExists(scriptPath);
      if (!exists) {
        this.reportError(`Hook script not found: ${command}`, filePath);
        return;
      }

      // TODO: Could add executability check on Unix systems
      // For now, just check existence
    }

    // For absolute paths or commands in PATH, we can't reliably check without executing
    // So we skip validation for those
  }
}
