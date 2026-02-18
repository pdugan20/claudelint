/**
 * Rule: skill-side-effects-without-disable-model
 *
 * Warns when allowed-tools includes unscoped Bash without
 * disable-model-invocation: true. Skills listed in allowed-tools bypass
 * Claude Code's normal permission prompts. Unscoped Bash grants unrestricted
 * shell execution — the only tool that can reach outside the working directory.
 *
 * Scoped Bash (e.g., Bash(npm:*)) is already restricted by its pattern.
 * Edit/Write are confined to the working directory by Claude Code's security
 * model. Read/Grep/Glob are read-only and require no approval regardless.
 *
 * See: https://docs.anthropic.com/en/docs/claude-code/skills
 * See: https://docs.anthropic.com/en/docs/claude-code/permissions
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-side-effects-without-disable-model',
    name: 'Skill Side Effects Without Disable Model',
    description:
      'Skills with unscoped Bash should set disable-model-invocation to control auto-invocation',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/skills/skill-side-effects-without-disable-model',
    docs: {
      strict: true,
      summary:
        'Warns when skills with unscoped Bash in `allowed-tools` do not set `disable-model-invocation` to true.',
      rationale:
        "Tools listed in `allowed-tools` bypass Claude Code's normal permission prompts when the skill is active. " +
        'Unscoped `Bash` grants unrestricted shell execution — the only tool that can reach outside the working ' +
        'directory. Scoped variants like `Bash(npm:*)` restrict commands to a specific pattern. ' +
        "Edit and Write are confined to the working directory by Claude Code's security model. " +
        'Read, Grep, and Glob are read-only tools that require no approval regardless.',
      details:
        'Claude Code has three permission tiers: read-only tools (Read, Grep, Glob) require no ' +
        'approval; file modification tools (Edit, Write) require per-session approval; and Bash ' +
        'commands require explicit approval (permanent per project once granted). When a skill ' +
        'lists tools in `allowed-tools`, those tools are auto-approved without prompts while the ' +
        'skill is active.\n\n' +
        'Unscoped `Bash` (or `Bash(*)`) in `allowed-tools` means Claude can execute any shell ' +
        'command without asking — including commands that reach outside the project directory, ' +
        'modify system state, or make network requests. This is the only tool that can escape ' +
        "Claude Code's working directory sandbox.\n\n" +
        'Setting `disable-model-invocation: true` prevents Claude from auto-invoking the skill, ' +
        'requiring the user to explicitly type `/skill-name`. The official docs recommend this for ' +
        '"workflows with side effects or that you want to control timing, like /commit, /deploy, ' +
        'or /send-slack-message."\n\n' +
        'Scoped Bash like `Bash(claudelint:*)` or `Bash(npm run *)` already restricts which commands ' +
        'can run, so it does not trigger this rule. Edit, Write, and other built-in tools are ' +
        "confined to the working directory by Claude Code's security architecture.",
      examples: {
        incorrect: [
          {
            description: 'Unscoped Bash without disable-model-invocation',
            code:
              '---\nname: deploy-app\ndescription: Deploys the application\n' +
              'allowed-tools:\n  - Bash\n  - Read\n---',
          },
          {
            description: 'Bash(*) is equivalent to unscoped Bash',
            code:
              '---\nname: run-anything\ndescription: Runs arbitrary commands\n' +
              'allowed-tools:\n  - Bash(*)\n---',
          },
        ],
        correct: [
          {
            description: 'Unscoped Bash with disable-model-invocation',
            code:
              '---\nname: deploy-app\ndescription: Deploys the application\n' +
              'disable-model-invocation: true\n' +
              'allowed-tools:\n  - Bash\n  - Read\n---',
          },
          {
            description: 'Scoped Bash — restricted to specific commands',
            code:
              '---\nname: lint-code\ndescription: Runs the linter\n' +
              'allowed-tools:\n  - Bash(npm run lint*)\n---',
          },
          {
            description: 'Edit and Write — confined to working directory by Claude Code',
            code:
              '---\nname: optimize-config\ndescription: Optimizes project config\n' +
              'allowed-tools:\n  - Bash(claudelint:*)\n  - Read\n  - Edit\n  - Write\n---',
          },
          {
            description: 'Read-only tools — no approval required regardless',
            code:
              '---\nname: analyze-code\ndescription: Analyzes source code\n' +
              'allowed-tools:\n  - Read\n  - Glob\n  - Grep\n---',
          },
        ],
      },
      howToFix:
        'Either scope Bash to specific commands (e.g., `Bash(npm run *)`) or add ' +
        '`disable-model-invocation: true` to require explicit user invocation with `/skill-name`.',
      relatedRules: ['skill-allowed-tools', 'skill-disallowed-tools', 'skill-dangerous-command'],
    },
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter) {
      return;
    }

    const allowedTools = frontmatter['allowed-tools'];

    // Skip if no allowed-tools
    if (!allowedTools || !Array.isArray(allowedTools) || allowedTools.length === 0) {
      return;
    }

    // Only flag unscoped Bash — the one tool that can escape the working directory.
    // Bash(*) is equivalent to unscoped Bash per the Claude Code docs.
    // Scoped Bash (e.g., Bash(npm:*)) is already restricted by its pattern.
    // Edit/Write are confined to the working directory by Claude Code's security model.
    // Read/Grep/Glob are read-only and require no approval regardless.
    const hasUnscopedBash = allowedTools.some((tool) => {
      if (typeof tool !== 'string') return false;
      return tool === 'Bash' || tool === 'Bash(*)';
    });

    if (!hasUnscopedBash) {
      return;
    }

    // Check if disable-model-invocation is set
    if (frontmatter['disable-model-invocation'] !== true) {
      const line = getFrontmatterFieldLine(context.fileContent, 'allowed-tools');
      context.report({
        message: 'Unscoped Bash in allowed-tools without disable-model-invocation',
        line,
        fix: 'Scope Bash to specific commands (e.g., Bash(npm run *)) or add disable-model-invocation: true',
      });
    }
  },
};
