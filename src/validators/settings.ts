import { BaseValidator, ValidationResult } from './base';
import { findSettingsFiles, readFileContent, fileExists } from '../utils/file-system';
import { z } from 'zod';

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

const VALID_PERMISSION_ACTIONS = ['allow', 'ask', 'deny'];

// Zod schemas
const PermissionRuleSchema = z.object({
  tool: z.string(),
  action: z.enum(['allow', 'ask', 'deny']),
  pattern: z.string().optional(),
});

const HookSchema = z.object({
  event: z.string(),
  matcher: z
    .object({
      tool: z.string().optional(),
      pattern: z.string().optional(),
    })
    .optional(),
  type: z.enum(['command', 'prompt', 'agent']),
  command: z.string().optional(),
  prompt: z.string().optional(),
  agent: z.string().optional(),
});

const AttributionSchema = z.object({
  enabled: z.boolean().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
});

const SandboxSchema = z.object({
  enabled: z.boolean().optional(),
  allowedCommands: z.array(z.string()).optional(),
});

const MarketplaceSourceSchema = z.object({
  source: z.string(),
  repo: z.string().optional(),
  branch: z.string().optional(),
  tag: z.string().optional(),
});

const MarketplaceConfigSchema = z.object({
  source: MarketplaceSourceSchema,
  enabled: z.boolean().optional(),
});

const SettingsSchema = z.object({
  permissions: z.array(PermissionRuleSchema).optional(),
  env: z.record(z.string()).optional(),
  model: z.enum(['sonnet', 'opus', 'haiku', 'inherit']).optional(),
  apiKeyHelper: z.string().optional(),
  hooks: z.array(HookSchema).optional(),
  attribution: AttributionSchema.optional(),
  statusLine: z.string().optional(),
  outputStyle: z.string().optional(),
  sandbox: SandboxSchema.optional(),
  enabledPlugins: z.record(z.boolean()).optional(),
  extraKnownMarketplaces: z.record(MarketplaceConfigSchema).optional(),
  strictKnownMarketplaces: z.boolean().optional(),
});

/**
 * Validates Claude Code settings.json files
 */
export class SettingsValidator extends BaseValidator {
  private basePath: string;

  constructor(options: { path?: string; verbose?: boolean; warningsAsErrors?: boolean } = {}) {
    super(options);
    this.basePath = options.path || process.cwd();
  }

  async validate(): Promise<ValidationResult> {
    const files = await this.findFiles();

    if (files.length === 0) {
      this.reportWarning('No settings.json files found');
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

    return findSettingsFiles(this.basePath);
  }

  private async validateFile(filePath: string): Promise<void> {
    // Read and parse JSON
    let content: string;
    let settings: unknown;

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
      settings = JSON.parse(content);
    } catch (error) {
      this.reportError(
        `Invalid JSON syntax: ${error instanceof Error ? error.message : String(error)}`,
        filePath
      );
      return;
    }

    // Validate against schema
    try {
      const result = SettingsSchema.safeParse(settings);

      if (!result.success) {
        for (const issue of result.error.issues) {
          this.reportError(`${issue.path.join('.')}: ${issue.message}`, filePath);
        }
        return;
      }

      // Additional validation with parsed settings
      await this.validateSettings(filePath, result.data);
    } catch (error) {
      this.reportError(
        `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
        filePath
      );
    }
  }

  private async validateSettings(
    filePath: string,
    settings: z.infer<typeof SettingsSchema>
  ): Promise<void> {
    // Validate permission rules
    if (settings.permissions) {
      for (const rule of settings.permissions) {
        this.validatePermissionRule(filePath, rule);
      }
    }

    // Validate hooks
    if (settings.hooks) {
      for (const hook of settings.hooks) {
        this.validateHook(filePath, hook);
      }
    }

    // Validate file paths
    if (settings.apiKeyHelper) {
      await this.validateFilePath(filePath, settings.apiKeyHelper, 'apiKeyHelper');
    }

    // Validate environment variables
    if (settings.env) {
      this.validateEnvironmentVariables(filePath, settings.env);
    }

    // Validate output style path
    if (settings.outputStyle) {
      await this.validateFilePath(filePath, settings.outputStyle, 'outputStyle');
    }
  }

  private validatePermissionRule(
    filePath: string,
    rule: z.infer<typeof PermissionRuleSchema>
  ): void {
    // Validate tool name
    if (!VALID_TOOLS.includes(rule.tool) && rule.tool !== '*') {
      this.reportWarning(`Unknown tool in permission rule: ${rule.tool}`, filePath);
    }

    // Validate action
    if (!VALID_PERMISSION_ACTIONS.includes(rule.action)) {
      this.reportError(
        `Invalid permission action: ${rule.action}. Must be one of: ${VALID_PERMISSION_ACTIONS.join(', ')}`,
        filePath
      );
    }

    // Validate pattern if present
    if (rule.pattern) {
      // Basic pattern validation - could be enhanced
      if (rule.pattern.trim().length === 0) {
        this.reportWarning('Empty permission pattern', filePath);
      }
    }
  }

  private validateHook(filePath: string, hook: z.infer<typeof HookSchema>): void {
    // Validate hook type has corresponding field
    if (hook.type === 'command' && !hook.command) {
      this.reportError('Hook with type "command" must have "command" field', filePath);
    }

    if (hook.type === 'prompt' && !hook.prompt) {
      this.reportError('Hook with type "prompt" must have "prompt" field', filePath);
    }

    if (hook.type === 'agent' && !hook.agent) {
      this.reportError('Hook with type "agent" must have "agent" field', filePath);
    }

    // Validate matcher tool if present
    if (hook.matcher?.tool && !VALID_TOOLS.includes(hook.matcher.tool)) {
      this.reportWarning(`Unknown tool in hook matcher: ${hook.matcher.tool}`, filePath);
    }
  }

  private async validateFilePath(filePath: string, path: string, fieldName: string): Promise<void> {
    // Skip validation for paths with variables
    if (path.includes('${') || path.includes('$')) {
      return;
    }

    const exists = await fileExists(path);
    if (!exists) {
      this.reportWarning(`${fieldName} file not found: ${path}`, filePath);
    }
  }

  private validateEnvironmentVariables(filePath: string, env: Record<string, string>): void {
    for (const [key, value] of Object.entries(env)) {
      // Validate key format (should be uppercase with underscores)
      if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) {
        this.reportWarning(
          `Environment variable name should be uppercase with underscores: ${key}`,
          filePath
        );
      }

      // Check for empty values
      if (!value || value.trim().length === 0) {
        this.reportWarning(`Empty value for environment variable: ${key}`, filePath);
      }

      // Check for potential secrets in plain text
      if (
        key.toLowerCase().includes('secret') ||
        key.toLowerCase().includes('key') ||
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('password')
      ) {
        if (!value.startsWith('${') && value.length > 10) {
          this.reportWarning(
            `Possible hardcoded secret in environment variable: ${key}. Consider using variable expansion.`,
            filePath
          );
        }
      }
    }
  }
}
