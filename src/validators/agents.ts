import { BaseValidator, ValidationResult, BaseValidatorOptions } from './base';
import {
  findAgentDirectories,
  readFileContent,
  fileExists,
  resolvePath,
} from '../utils/file-system';
import { validateFrontmatterWithSchema } from '../utils/schema-helpers';
import { AgentFrontmatterWithRefinements } from '../schemas/agent-frontmatter.schema';
import { basename, join } from 'path';
import { validateHook } from '../utils/validation-helpers';
import { HookSchema } from './schemas';
import { z } from 'zod';
// Import rules to ensure they're registered
import '../rules';
import { ValidatorRegistry } from '../utils/validator-factory';

/**
 * Options specific to Agents validator
 */
export interface AgentsValidatorOptions extends BaseValidatorOptions {
  /** Validate only a specific agent by name */
  agent?: string;
}

/**
 * Validates Claude Code agents for structure and frontmatter
 */
export class AgentsValidator extends BaseValidator {
  private basePath: string;
  private specificAgent?: string;

  constructor(options: AgentsValidatorOptions = {}) {
    super(options);
    this.basePath = options.path || process.cwd();
    this.specificAgent = options.agent;
  }

  async validate(): Promise<ValidationResult> {
    const agentDirs = await this.findAgentDirs();

    if (agentDirs.length === 0) {
      this.reportWarning('No agent directories found');
      return this.getResult();
    }

    for (const agentDir of agentDirs) {
      await this.validateAgent(agentDir);
    }

    return this.getResult();
  }

  private async findAgentDirs(): Promise<string[]> {
    const allAgentDirs = await findAgentDirectories(this.basePath);

    if (this.specificAgent) {
      // Filter to specific agent
      return allAgentDirs.filter((dir) => basename(dir) === this.specificAgent);
    }

    return allAgentDirs;
  }

  private async validateAgent(agentDir: string): Promise<void> {
    const agentName = basename(agentDir);
    const agentMdPath = join(agentDir, 'AGENT.md');

    // Check AGENT.md exists
    const exists = await fileExists(agentMdPath);
    if (!exists) {
      this.reportError(`AGENT.md not found in agent directory`, agentDir);
      return;
    }

    // Read content
    const content = await readFileContent(agentMdPath);

    // Parse disable comments
    this.parseDisableComments(agentMdPath, content);

    // Validate frontmatter
    await this.validateFrontmatter(agentMdPath, content, agentName);

    // Validate body content
    this.validateBodyContent(agentMdPath, content);

    // Report unused disable directives if configured
    if (this.options.config?.reportUnusedDisableDirectives) {
      this.reportUnusedDisables(agentMdPath);
    }
  }

  private async validateFrontmatter(
    filePath: string,
    content: string,
    agentName: string
  ): Promise<void> {
    // Use schema-based validation
    const { data: frontmatter, result } = await validateFrontmatterWithSchema(
      content,
      AgentFrontmatterWithRefinements,
      filePath,
      'agent'
    );

    // Merge schema validation results
    this.errors.push(...result.errors);
    this.warnings.push(...result.warnings);

    // If no frontmatter parsed, schema validation already reported the error
    if (!frontmatter) {
      return;
    }

    // Custom validation: Check name matches directory
    if (frontmatter.name !== agentName) {
      this.reportError(
        `Agent name "${frontmatter.name}" does not match directory name "${agentName}"`,
        filePath
      );
    }

    // Custom validation: Validate tool names (warning level)
    if (frontmatter.tools) {
      for (const tool of frontmatter.tools) {
        this.validateToolName(tool, filePath);
      }
    }

    if (frontmatter['disallowed-tools']) {
      for (const tool of frontmatter['disallowed-tools']) {
        this.validateToolName(tool, filePath);
      }
    }

    // Custom validation: Validate event names (warning level)
    if (frontmatter.events) {
      for (const event of frontmatter.events) {
        this.validateEventName(event, filePath);
      }
    }

    // Custom validation: Validate referenced skills exist
    if (frontmatter.skills) {
      await this.validateReferencedSkills(filePath, frontmatter.skills);
    }

    // Custom validation: Validate hooks if present
    if (frontmatter.hooks) {
      this.validateHooks(filePath, frontmatter.hooks);
    }
  }

  private async validateReferencedSkills(
    filePath: string,
    skills: string[]
  ): Promise<void> {
    const claudeDir = resolvePath(this.basePath, '.claude');
    const skillsDir = join(claudeDir, 'skills');

    for (const skillName of skills) {
      const skillPath = join(skillsDir, skillName, 'SKILL.md');
      const exists = await fileExists(skillPath);

      if (!exists) {
        this.reportError(
          `Referenced skill not found: ${skillName}`,
          filePath
        );
      }
    }
  }

  private validateHooks(filePath: string, hooks: z.infer<typeof HookSchema>[]): void {
    for (const hook of hooks) {
      // Use shared validation utility for common checks
      const issues = validateHook(hook);
      for (const issue of issues) {
        if (issue.severity === 'warning') {
          this.reportWarning(issue.message, filePath, undefined, issue.ruleId);
        } else {
          this.reportError(issue.message, filePath, undefined, 'agent-hooks-invalid-schema');
        }
      }

      // Validate matcher tool name if present
      if (hook.matcher?.tool) {
        this.validateToolName(hook.matcher.tool, filePath, 'tool in matcher');
      }

      // Note: We don't validate command scripts for agent hooks since they may be
      // resolved relative to the agent directory or use agent-specific context
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
        'Agent body content is very short. Consider adding more detailed instructions.',
        filePath
      );
    }

    // Check for system prompt sections
    const hasSystemPrompt = /#{1,3}\s*system\s*prompt/i.test(body);
    if (!hasSystemPrompt) {
      this.reportWarning(
        'Agent should include a "System Prompt" section with detailed instructions.',
        filePath
      );
    }
  }
}

// Register validator with factory
ValidatorRegistry.register(
  {
    id: 'agents',
    name: 'Agents Validator',
    description: 'Validates Claude Code agent structure and frontmatter',
    filePatterns: ['**/.claude/agents/*/AGENT.md'],
    enabled: true,
  },
  (options) => new AgentsValidator(options)
);
