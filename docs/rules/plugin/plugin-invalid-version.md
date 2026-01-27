# Invalid Version

Plugin version is not valid semver.

## Rule Details

This rule enforces that plugin versions follow Semantic Versioning (semver) format. Semantic versioning provides a standardized way to communicate changes in your plugin and manage dependencies.

Version validation errors include:

- Invalid semver format (missing parts, wrong structure)
- Non-numeric version components
- Invalid pre-release or build metadata syntax

**Category**: Plugin
**Severity**: error
**Fixable**: No
**Since**: v1.0.0

### Violation Examples

Missing patch version:

```json
{
  "version": "1.0"   Must be MAJOR.MINOR.PATCH (1.0.0)
}
```

Missing minor and patch:

```json
{
  "version": "1"   Must be MAJOR.MINOR.PATCH (1.0.0)
}
```

Non-numeric version:

```json
{
  "version": "v1.0.0"   Should not include 'v' prefix
}
```

Invalid version string:

```json
{
  "version": "latest"   Must be numeric semver
}
```

Wrong separator:

```json
{
  "version": "1_0_0"   Use dots, not underscores
}
```

### Correct Examples

Basic semver:

```json
{
  "version": "1.0.0"  
}
```

With pre-release tag:

```json
{
  "version": "2.1.0-beta.1"  
}
```

With build metadata:

```json
{
  "version": "1.0.0+20230615"  
}
```

Complete version with pre-release and metadata:

```json
{
  "version": "3.0.0-rc.1+build.123"  
}
```

## Semantic Versioning Format

Semver follows this format:

```text
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
```

### Version Components

**MAJOR** (required): Incremented for breaking changes

```text
1.0.0 → 2.0.0
```

**MINOR** (required): Incremented for new features (backward compatible)

```text
1.0.0 → 1.1.0
```

**PATCH** (required): Incremented for bug fixes (backward compatible)

```text
1.0.0 → 1.0.1
```

**PRERELEASE** (optional): Identifies pre-release versions

```text
1.0.0-alpha
1.0.0-beta.1
2.0.0-rc.2
```

**BUILD** (optional): Build metadata

```text
1.0.0+20230615
1.0.0-beta.1+exp.sha.5114f85
```

## Valid Version Examples

### Release Versions

```json
{
  "version": "0.1.0"   Initial development
}
```

```json
{
  "version": "1.0.0"   First stable release
}
```

```json
{
  "version": "2.5.3"   Mature version
}
```

### Pre-release Versions

**Alpha:**

```json
{
  "version": "1.0.0-alpha"  
}
```

```json
{
  "version": "1.0.0-alpha.1"  
}
```

**Beta:**

```json
{
  "version": "1.0.0-beta"  
}
```

```json
{
  "version": "2.0.0-beta.5"  
}
```

**Release Candidate:**

```json
{
  "version": "1.0.0-rc.1"  
}
```

```json
{
  "version": "3.0.0-rc.2"  
}
```

### With Build Metadata

```json
{
  "version": "1.0.0+20230615"   Date-based build
}
```

```json
{
  "version": "1.0.0+build.1"   Build number
}
```

```json
{
  "version": "1.0.0+sha.5114f85"   Git SHA
}
```

```json
{
  "version": "2.0.0-beta.1+exp.sha.abc123"   Pre-release + build
}
```

## Version Incrementing

### Patch Release (Bug Fixes)

```json
# Before
{
  "version": "1.2.3"
}

# After - bug fix
{
  "version": "1.2.4"
}
```

### Minor Release (New Features)

```json
# Before
{
  "version": "1.2.4"
}

# After - new backward-compatible feature
{
  "version": "1.3.0"
}
```

### Major Release (Breaking Changes)

```json
# Before
{
  "version": "1.3.0"
}

# After - breaking API change
{
  "version": "2.0.0"
}
```

### Pre-release Progression

```json
1.0.0-alpha.1
1.0.0-alpha.2
1.0.0-beta.1
1.0.0-beta.2
1.0.0-rc.1
1.0.0-rc.2
1.0.0   Final release
```

## How To Fix

### Option 1: Add missing version parts

```json
# Before - incomplete version
{
  "version": "1.0"
}

# After - complete semver
{
  "version": "1.0.0"
}
```

### Option 2: Remove invalid prefix

```json
# Before - has 'v' prefix
{
  "version": "v2.1.0"
}

# After - no prefix
{
  "version": "2.1.0"
}
```

### Option 3: Fix separators

```json
# Before - wrong separator
{
  "version": "1_2_3"
}

# After - correct separator
{
  "version": "1.2.3"
}
```

### Option 4: Use numeric version

```json
# Before - text version
{
  "version": "latest"
}

# After - numeric semver
{
  "version": "1.0.0"
}
```

### Option 5: Fix pre-release format

```json
# Before - invalid format
{
  "version": "1.0.0-beta_1"
}

# After - valid format
{
  "version": "1.0.0-beta.1"
}
```

## Version Strategy Examples

### New Plugin (Initial Development)

```json
{
  "name": "my-plugin",
  "version": "0.1.0",
  "description": "Initial development version"
}
```

Increment as:

```text
0.1.0 → 0.2.0 (new features during development)
0.2.0 → 0.2.1 (bug fixes)
0.2.1 → 1.0.0 (ready for production)
```

### Stable Plugin

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "First stable release"
}
```

Increment as:

```text
1.0.0 → 1.0.1 (bug fixes)
1.0.1 → 1.1.0 (new features)
1.1.0 → 2.0.0 (breaking changes)
```

### Beta Testing

```json
{
  "name": "my-plugin",
  "version": "2.0.0-beta.1",
  "description": "Beta version of 2.0 release"
}
```

Progression:

```text
2.0.0-beta.1
2.0.0-beta.2
2.0.0-rc.1   (release candidate)
2.0.0        (final release)
```

## Common Mistakes

### Mistake 1: Missing version components

```json
# Wrong - incomplete
{
  "version": "1.0"
}

# Correct - all three parts
{
  "version": "1.0.0"
}
```

### Mistake 2: Including 'v' prefix

```json
# Wrong - has prefix
{
  "version": "v1.2.3"
}

# Correct - no prefix
{
  "version": "1.2.3"
}
```

### Mistake 3: Using text instead of numbers

```json
# Wrong - text version
{
  "version": "latest"
}

# Correct - numeric version
{
  "version": "1.0.0"
}
```

### Mistake 4: Wrong pre-release format

```json
# Wrong - underscore separator
{
  "version": "1.0.0-beta_1"
}

# Correct - dot separator
{
  "version": "1.0.0-beta.1"
}
```

### Mistake 5: Incrementing wrong component

```json
# Wrong - PATCH for breaking change
{
  "version": "1.0.1"  // Should be 2.0.0
}

# Wrong - MAJOR for bug fix
{
  "version": "2.0.0"  // Should be 1.0.1
}

# Correct - MAJOR for breaking change
{
  "version": "2.0.0"
}

# Correct - PATCH for bug fix
{
  "version": "1.0.1"
}
```

## Version Guidelines

### When to increment MAJOR

- Breaking API changes
- Removing features
- Renaming configuration options
- Changing behavior in backward-incompatible ways

```json
{
  "version": "2.0.0"  // Breaking change from 1.x
}
```

### When to increment MINOR

- Adding new features
- Adding new optional parameters
- Deprecating features (but not removing)
- Internal refactoring (no API changes)

```json
{
  "version": "1.1.0"  // New features added to 1.0.x
}
```

### When to increment PATCH

- Bug fixes
- Performance improvements
- Documentation updates
- Security patches

```json
{
  "version": "1.0.1"  // Bug fix for 1.0.0
}
```

## Validation Checklist

Before publishing your plugin, verify:

- [ ] Version has three numeric parts (MAJOR.MINOR.PATCH)
- [ ] Version doesn't include 'v' prefix
- [ ] Pre-release tags use dot separator (not underscore)
- [ ] Version increment matches change type (major/minor/patch)
- [ ] Version is higher than previous release
- [ ] marketplace.json version matches plugin.json version (if present)

## Options

This rule does not have any configuration options.

## When Not To Use It

You should **never** disable this rule. Invalid version numbers will cause:

- Plugin installation failures
- Dependency resolution problems
- Marketplace submission rejection
- Version conflict issues
- Update mechanism failures

Always use valid semver versions rather than disabling this rule.

## Configuration

This rule should not be disabled, but if absolutely necessary:

```json
{
  "rules": {
    "plugin-invalid-version": "off"
  }
}
```

To change to a warning (not recommended):

```json
{
  "rules": {
    "plugin-invalid-version": "warning"
  }
}
```

## Related Rules

- [plugin-invalid-manifest](./plugin-invalid-manifest.md) - Manifest schema validation
- [plugin-missing-file](./plugin-missing-file.md) - Referenced file validation

## Resources

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Semver Calculator](https://semver.npmjs.com/)
- [NPM Semver](https://docs.npmjs.com/about-semantic-versioning)
- [Keep a Changelog](https://keepachangelog.com/) - Version documentation best practices

## Version

Available since: v1.0.0
