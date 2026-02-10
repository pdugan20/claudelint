/**
 * Rule: skill-hardcoded-secrets
 *
 * Detects hardcoded API keys, tokens, passwords, and other secrets in skill
 * files. Secrets should use environment variables instead.
 */

import { Rule } from '../../types/rule';

interface SecretPattern {
  name: string;
  pattern: RegExp;
}

const SECRET_PATTERNS: SecretPattern[] = [
  // API keys with known prefixes
  { name: 'Anthropic API Key', pattern: /sk-ant-[a-zA-Z0-9-_]{20,}/ },
  { name: 'OpenAI API Key', pattern: /sk-[a-zA-Z0-9]{32,}/ },
  { name: 'GitHub Token', pattern: /ghp_[a-zA-Z0-9]{36,}/ },
  { name: 'GitHub OAuth Token', pattern: /gho_[a-zA-Z0-9]{36,}/ },
  { name: 'GitHub App Token', pattern: /ghu_[a-zA-Z0-9]{36,}/ },
  { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/ },
  { name: 'Stripe Live Key', pattern: /sk_live_[a-zA-Z0-9]{24,}/ },
  { name: 'Stripe Publishable Key', pattern: /pk_live_[a-zA-Z0-9]{24,}/ },
  { name: 'Slack Token', pattern: /xox[bpors]-[a-zA-Z0-9-]{10,}/ },

  // Private keys
  { name: 'Private Key', pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/ },

  // Generic assignment patterns
  { name: 'Hardcoded Password', pattern: /password\s*[:=]\s*["'][^"'$]{8,}["']/i },
  { name: 'Hardcoded Secret', pattern: /secret\s*[:=]\s*["'][^"'$]{8,}["']/i },
  { name: 'Hardcoded API Key', pattern: /api[_-]?key\s*[:=]\s*["'][^"'$]{20,}["']/i },
  { name: 'Hardcoded Token', pattern: /token\s*[:=]\s*["'][^"'$]{20,}["']/i },
];

export const rule: Rule = {
  meta: {
    id: 'skill-hardcoded-secrets',
    name: 'Skill Hardcoded Secrets',
    description: 'Skill file contains hardcoded secrets that should use environment variables',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-hardcoded-secrets.md',
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only check skill-related files
    const isSkillFile =
      filePath.endsWith('SKILL.md') ||
      filePath.endsWith('.sh') ||
      filePath.endsWith('.bash') ||
      filePath.endsWith('.py') ||
      filePath.endsWith('.js') ||
      filePath.endsWith('.ts');

    if (!isSkillFile) {
      return;
    }

    const lines = fileContent.split('\n');

    for (const { name, pattern } of SECRET_PATTERNS) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip comments that discuss secret patterns (e.g., documentation)
        if (/^\s*#.*example|^\s*#.*placeholder|^\s*\/\//i.test(line)) {
          continue;
        }

        if (pattern.test(line)) {
          context.report({
            message: `Hardcoded secret detected: ${name}. Use environment variables instead.`,
            line: i + 1,
          });
          break; // One report per pattern type per file
        }
      }
    }
  },
};
