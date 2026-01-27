# Too Many Files

Skill directory has too many files at the root level.

## Rule Details

This rule enforces that skill directories don't have too many loose files at the root level. When a skill directory contains more than 10 files (excluding documentation and meta files), it becomes difficult to navigate, maintain, and understand.

Files excluded from the count:

- `SKILL.md`
- `README.md`
- `CHANGELOG.md`
- `.gitignore`
- `.DS_Store`

**Category**: Skills
**Severity**: warning
**Fixable**: No
**Since**: v1.0.0

### Violation Example

Skill directory with 15 loose files:

```text
.claude/skills/deploy/
├── SKILL.md
├── deploy.sh
├── rollback.sh
├── health-check.sh
├── validate.sh
├── notify.sh
├── backup.sh
├── restore.sh
├── config.sh
├── utils.sh
├── logging.sh
├── monitoring.sh
├── cleanup.sh
├── setup.sh
├── teardown.sh
└── verify.sh

 14 script files at root level (>10)
```

### Correct Example

Well-organized skill directory:

```text
.claude/skills/deploy/
├── SKILL.md
├── README.md
├── CHANGELOG.md
├── deploy.sh           # Main entry point
├── bin/                # Executable scripts
│   ├── rollback.sh
│   ├── health-check.sh
│   └── validate.sh
├── lib/                # Library/utility scripts
│   ├── config.sh
│   ├── utils.sh
│   ├── logging.sh
│   └── monitoring.sh
└── tests/              # Test scripts
    ├── test-deploy.sh
    └── test-rollback.sh

 3 files at root level (<10)
```

## How To Fix

Organize files into logical subdirectories:

### Option 1: Use standard directory structure

```bash
.claude/skills/your-skill/
├── SKILL.md            # Required: skill documentation
├── your-skill.sh       # Main entry point
├── bin/                # Executable scripts
│   └── *.sh
├── lib/                # Shared libraries
│   └── *.sh
├── tests/              # Test scripts
│   └── *.sh
└── config/             # Configuration files
    └── *.conf
```

### Option 2: Group by functionality

```bash
.claude/skills/deploy/
├── SKILL.md
├── deploy.sh           # Main script
├── deployment/         # Deployment-related
│   ├── health-check.sh
│   ├── validate.sh
│   └── notify.sh
├── backup/             # Backup-related
│   ├── backup.sh
│   └── restore.sh
└── utilities/          # Shared utilities
    ├── config.sh
    ├── logging.sh
    └── monitoring.sh
```

### Option 3: Group by environment/target

```bash
.claude/skills/deploy/
├── SKILL.md
├── deploy.sh           # Main orchestrator
├── production/
│   ├── deploy-prod.sh
│   └── rollback-prod.sh
├── staging/
│   ├── deploy-staging.sh
│   └── rollback-staging.sh
└── common/
    ├── health-check.sh
    └── notify.sh
```

## Common Directory Structures

### Simple skills (1-5 scripts)

```bash
skill/
├── SKILL.md
├── main-script.sh
├── helper1.sh
└── helper2.sh

# No subdirectories needed
```

### Medium skills (5-10 scripts)

```bash
skill/
├── SKILL.md
├── main-script.sh
├── lib/
│   ├── functions.sh
│   └── config.sh
└── tests/
    └── test.sh
```

### Complex skills (10+ scripts)

```bash
skill/
├── SKILL.md
├── README.md
├── CHANGELOG.md
├── main-script.sh
├── bin/              # Executable commands
│   ├── command1.sh
│   └── command2.sh
├── lib/              # Shared code
│   ├── utils.sh
│   ├── config.sh
│   └── logging.sh
├── tests/            # Test suite
│   ├── unit/
│   └── integration/
└── config/           # Configuration
    ├── dev.conf
    └── prod.conf
```

## Benefits of Organization

1. **Easier navigation**: Find files quickly by category
2. **Clear structure**: Understand the skill's architecture at a glance
3. **Better maintainability**: Logical grouping aids updates
4. **Reduced clutter**: Root directory stays clean
5. **Professional appearance**: Shows attention to quality

## Migration Steps

To reorganize an existing skill:

1. **Create subdirectories:**

   ```bash
   cd .claude/skills/your-skill
   mkdir -p bin lib tests config
   ```

2. **Move files to appropriate directories:**

   ```bash
   # Move executable scripts
   mv *-command.sh bin/

   # Move utility/library scripts
   mv *-utils.sh *-lib.sh lib/

   # Move test scripts
   mv *test*.sh tests/

   # Move configuration
   mv *.conf config/
   ```

3. **Update import paths in scripts:**

   ```bash
   # Before
   source ./utils.sh

   # After
   source ./lib/utils.sh
   ```

4. **Update SKILL.md to reflect new structure**

5. **Test that skill still works**

## Options

This rule does not have any configuration options. The threshold of 10 files is fixed.

## When Not To Use It

You might disable this rule if:

- Your skill genuinely needs many root-level files
- You're following a specific project structure convention
- You're in the process of organizing but haven't finished

However, organization improves all projects, so consider restructuring instead of disabling.

## Configuration

To disable this rule:

```json
{
  "rules": {
    "skill-too-many-files": "off"
  }
}
```

To escalate to an error:

```json
{
  "rules": {
    "skill-too-many-files": "error"
  }
}
```

## Related Rules

- [skill-deep-nesting](./skill-deep-nesting.md) - Warns about excessive directory nesting
- [skill-naming-inconsistent](./skill-naming-inconsistent.md) - Inconsistent file naming

## Resources

- [Project Structure Best Practices](https://github.com/kriasoft/Folder-Structure-Conventions)
- [Shell Script Organization](https://google.github.io/styleguide/shellguide.html)

## Version

Available since: v1.0.0
