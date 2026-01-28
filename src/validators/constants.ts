/**
 * Validator constants (non-enum values)
 * For enum constants, see src/schemas/constants.ts
 */

// File size thresholds for CLAUDE.md
export const CLAUDE_MD_SIZE_WARNING_THRESHOLD = 35_000; // 35KB
export const CLAUDE_MD_SIZE_ERROR_THRESHOLD = 40_000; // 40KB
export const CLAUDE_MD_MAX_IMPORT_DEPTH = 5;

// Skill naming constraints
export const SKILL_NAME_MAX_LENGTH = 64;
export const SKILL_NAME_PATTERN = /^[a-z0-9-]+$/;

// Skill organization thresholds
export const SKILL_MIN_DESCRIPTION_LENGTH = 10; // Minimum characters for skill description
export const SKILL_MAX_ROOT_FILES = 10; // Maximum loose files at skill root before warning
export const SKILL_MAX_DIRECTORY_DEPTH = 4; // Maximum directory nesting depth
export const SKILL_MAX_SCRIPT_FILES = 3; // Maximum script files before suggesting README
export const SKILL_MIN_COMMENT_LINES = 10; // Minimum script lines before requiring comments
export const SKILL_MIN_NAMING_CONSISTENCY = 3; // Minimum named items to check naming consistency

// CLAUDE.md organization thresholds
export const CLAUDE_MD_MAX_SECTIONS = 20; // Maximum heading sections before suggesting split

// Regex patterns for skills validation
export const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\(\.\/([^)]+)\)/g; // Matches relative markdown links
export const SHELL_EVAL_REGEX = /\beval\s+/; // Matches shell eval command
export const PYTHON_EVAL_EXEC_REGEX = /\beval\s*\(|\bexec\s*\(/; // Matches Python eval() or exec()
export const PATH_TRAVERSAL_REGEX = /\.\.[/\\]/; // Matches ../ or ..\ path traversal

// Dangerous command patterns for security checks
export const DANGEROUS_COMMANDS = [
  {
    pattern: /rm\s+-rf\s+\/(?!\s*\$|[a-zA-Z])/,
    message: 'rm -rf / (deletes entire filesystem)',
  },
  { pattern: /:\(\)\{.*\|.*&\s*\}/, message: 'fork bomb pattern' },
  {
    pattern: /dd\s+if=.*of=\/dev\/[sh]d[a-z]/,
    message: 'dd writing to raw disk (data loss risk)',
  },
  { pattern: /mkfs\.[a-z]+\s+\/dev/, message: 'mkfs (formats disk, data loss risk)' },
  { pattern: />\s*\/dev\/[sh]d[a-z]/, message: 'writing to raw disk device' },
];

// Environment variable naming pattern
export const ENV_VAR_NAME_PATTERN = /^[A-Z_][A-Z0-9_]*$/;

// Variable expansion patterns
export const VAR_EXPANSION_PATTERN = /\$\{([A-Z_][A-Z0-9_]*)(:-[^}]*)?\}/g;
export const SIMPLE_VAR_PATTERN = /\$([A-Z_][A-Z0-9_]*)/g;

// Semantic versioning pattern
export const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
