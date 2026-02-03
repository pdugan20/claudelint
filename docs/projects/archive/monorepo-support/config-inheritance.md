# Config Inheritance - Technical Design

Technical specification for implementing the `extends` field in claudelint configuration.

## Overview

Config inheritance allows users to create shareable configurations and extend them in child packages, reducing duplication and improving maintainability in monorepos.

## Design Goals

1. **Familiar**: Follow ESLint's `extends` pattern for developer familiarity
2. **Flexible**: Support relative paths, node_modules packages, and arrays
3. **Safe**: Detect and prevent circular dependencies
4. **Performant**: Cache loaded configs, minimize file I/O
5. **Backward Compatible**: Existing configs work unchanged

## Config Schema Changes

### Before

```typescript
export interface ClaudeLintConfig {
  rules?: Record<string, RuleConfig | 'off' | 'warn' | 'error'>;
  overrides?: ConfigOverride[];
  ignorePatterns?: string[];
  output?: { ... };
  reportUnusedDisableDirectives?: boolean;
  maxWarnings?: number;
}
```

### After

```typescript
export interface ClaudeLintConfig {
  extends?: string | string[];  // NEW
  rules?: Record<string, RuleConfig | 'off' | 'warn' | 'error'>;
  overrides?: ConfigOverride[];
  ignorePatterns?: string[];
  output?: { ... };
  reportUnusedDisableDirectives?: boolean;
  maxWarnings?: number;
}
```

## Usage Examples

### Simple Relative Path

```json
// packages/app-1/.claudelintrc.json
{
  "extends": "../../.claudelintrc.json",
  "rules": {
    "size-warning": "off"
  }
}
```

### Multiple Extends

```json
{
  "extends": [
    "../../base.json",
    "../../strict-rules.json"
  ],
  "rules": {
    "skill-missing-changelog": "warn"
  }
}
```

### Node Modules Package

```json
{
  "extends": "@acme/claudelint-config",
  "rules": {
    "size-error": "off"
  }
}
```

### Scoped Package with Path

```json
{
  "extends": "@acme/claudelint-config/strict"
}
```

## Implementation Details

### Path Resolution

Function to resolve config paths to absolute file paths:

```typescript
/**
 * Resolve extends path to absolute file path
 *
 * @param extendsValue - Value from extends field
 * @param fromDir - Directory containing the config file
 * @returns Absolute path to extended config
 * @throws ConfigError if config not found
 */
function resolveConfigPath(extendsValue: string, fromDir: string): string {
  // Relative paths
  if (extendsValue.startsWith('./') || extendsValue.startsWith('../')) {
    const resolved = resolve(fromDir, extendsValue);

    if (!existsSync(resolved)) {
      throw new ConfigError(
        `Extended config not found: ${extendsValue}\n` +
        `Resolved to: ${resolved}\n` +
        `Referenced from: ${fromDir}`
      );
    }

    return resolved;
  }

  // Node modules packages
  try {
    return require.resolve(extendsValue, { paths: [fromDir] });
  } catch (error) {
    throw new ConfigError(
      `Extended config package not found: ${extendsValue}\n` +
      `Make sure the package is installed: npm install --save-dev ${extendsValue}\n` +
      `Referenced from: ${fromDir}`
    );
  }
}
```

### Config Loading with Extends

Recursive loader that handles extends:

```typescript
/**
 * Load config with extends resolution
 *
 * @param configPath - Path to config file
 * @param visited - Set of visited paths (for circular detection)
 * @returns Fully resolved config
 * @throws ConfigError on circular dependency
 */
function loadConfigWithExtends(
  configPath: string,
  visited: Set<string> = new Set()
): ClaudeLintConfig {
  // Normalize path for comparison
  const normalizedPath = resolve(configPath);

  // Detect circular dependencies
  if (visited.has(normalizedPath)) {
    const chain = Array.from(visited).concat(normalizedPath);
    throw new ConfigError(
      `Circular dependency detected in config extends:\n` +
      chain.map((p, i) => `  ${i + 1}. ${p}`).join('\n')
    );
  }

  visited.add(normalizedPath);

  // Load base config
  const config = loadConfig(configPath);

  // No extends - return as-is
  if (!config.extends) {
    return config;
  }

  // Normalize extends to array
  const extendsArray = Array.isArray(config.extends)
    ? config.extends
    : [config.extends];

  // Resolve and load all extended configs
  const fromDir = dirname(normalizedPath);
  const extendedConfigs = extendsArray.map(ext => {
    const extPath = resolveConfigPath(ext, fromDir);
    return loadConfigWithExtends(extPath, new Set(visited)); // Pass copy of visited
  });

  // Merge configs: base → ext[0] → ext[1] → ... → current
  // Start with empty config
  let merged: ClaudeLintConfig = {};

  // Apply each extended config
  for (const extConfig of extendedConfigs) {
    merged = mergeConfig(merged, extConfig);
  }

  // Apply current config (overrides extended configs)
  const { extends: _, ...currentWithoutExtends } = config;
  merged = mergeConfig(merged, currentWithoutExtends);

  return merged;
}
```

### Config Merging

Rules for merging configs:

```typescript
/**
 * Deep merge two configs
 * Later config overrides earlier config
 */
function mergeConfig(
  base: ClaudeLintConfig,
  override: ClaudeLintConfig
): ClaudeLintConfig {
  return {
    // Merge rules (deep merge objects)
    rules: {
      ...base.rules,
      ...override.rules
    },

    // Concatenate overrides arrays
    overrides: [
      ...(base.overrides || []),
      ...(override.overrides || [])
    ],

    // Concatenate and dedupe ignorePatterns
    ignorePatterns: [
      ...new Set([
        ...(base.ignorePatterns || []),
        ...(override.ignorePatterns || [])
      ])
    ],

    // Merge output object
    output: {
      ...base.output,
      ...override.output
    },

    // Last wins for scalar values
    reportUnusedDisableDirectives:
      override.reportUnusedDisableDirectives ??
      base.reportUnusedDisableDirectives,

    maxWarnings: override.maxWarnings ?? base.maxWarnings
  };
}
```

### Merge Order Examples

#### Example 1: Rule Override

```typescript
// base.json
{
  "rules": {
    "size-error": "error",
    "size-warning": "warn"
  }
}

// child.json
{
  "extends": "./base.json",
  "rules": {
    "size-warning": "off"  // Override
  }
}

// Result
{
  "rules": {
    "size-error": "error",    // From base
    "size-warning": "off"     // Overridden in child
  }
}
```

#### Example 2: Multiple Extends

```typescript
// base.json
{
  "rules": {
    "size-error": "error"
  }
}

// strict.json
{
  "rules": {
    "size-error": "error",
    "skill-missing-changelog": "error"
  }
}

// child.json
{
  "extends": ["./base.json", "./strict.json"],
  "rules": {
    "size-warning": "warn"
  }
}

// Result (merge order: base → strict → child)
{
  "rules": {
    "size-error": "error",              // From base (also in strict)
    "skill-missing-changelog": "error", // From strict
    "size-warning": "warn"              // From child
  }
}
```

#### Example 3: Overrides Concatenation

```typescript
// base.json
{
  "overrides": [
    {
      "files": ["*.md"],
      "rules": { "size-error": "off" }
    }
  ]
}

// child.json
{
  "extends": "./base.json",
  "overrides": [
    {
      "files": ["SKILL.md"],
      "rules": { "skill-missing-version": "off" }
    }
  ]
}

// Result
{
  "overrides": [
    {
      "files": ["*.md"],
      "rules": { "size-error": "off" }
    },
    {
      "files": ["SKILL.md"],
      "rules": { "skill-missing-version": "off" }
    }
  ]
}
```

## Error Handling

### Circular Dependencies

```typescript
// config-a.json
{ "extends": "./config-b.json" }

// config-b.json
{ "extends": "./config-a.json" }

// Error message:
Circular dependency detected in config extends:
  1. /path/to/config-a.json
  2. /path/to/config-b.json
  3. /path/to/config-a.json
```

### Config Not Found

```typescript
// child.json
{ "extends": "./nonexistent.json" }

// Error message:
Extended config not found: ./nonexistent.json
Resolved to: /path/to/nonexistent.json
Referenced from: /path/to/child-dir
```

### Package Not Installed

```typescript
// child.json
{ "extends": "@acme/claudelint-config" }

// Error message:
Extended config package not found: @acme/claudelint-config
Make sure the package is installed: npm install --save-dev @acme/claudelint-config
Referenced from: /path/to/child-dir
```

## Integration Points

### Update in `loadAndValidateConfig()`

```typescript
export function loadAndValidateConfig(options: {
  config?: string | false;
  verbose?: boolean;
  debugConfig?: boolean;
}): ClaudeLintConfig {
  // ... existing code ...

  // CHANGE: Use loadConfigWithExtends instead of loadConfig
  if (options.config) {
    try {
      config = loadConfigWithExtends(options.config);  // ← Changed
      if (options.verbose || options.debugConfig) {
        logger.info(`Using config file: ${options.config}`);
      }
      if (options.debugConfig) {
        logger.info('[Config Debug] Loaded config:');
        logger.log(JSON.stringify(config, null, 2));
      }
    } catch (error: unknown) {
      // ... error handling ...
    }
  } else {
    const configPath = findConfigFile(process.cwd());
    if (configPath) {
      try {
        config = loadConfigWithExtends(configPath);  // ← Changed
        // ... rest of code ...
      } catch (error: unknown) {
        // ... error handling ...
      }
    }
  }

  // ... rest of function ...
}
```

## Performance Considerations

### Caching Strategy

```typescript
// Cache loaded configs by absolute path
const configCache = new Map<string, ClaudeLintConfig>();

function loadConfigWithExtends(
  configPath: string,
  visited: Set<string> = new Set()
): ClaudeLintConfig {
  const normalizedPath = resolve(configPath);

  // Check cache
  if (configCache.has(normalizedPath)) {
    return configCache.get(normalizedPath)!;
  }

  // ... load and resolve config ...

  // Cache result
  configCache.set(normalizedPath, merged);

  return merged;
}
```

**Note:** Cache is per-CLI invocation, not persistent across runs.

### Benchmark Expectations

- **No extends**: No performance change
- **1 extend**: +5-10ms (one extra file read)
- **2-3 extends**: +10-20ms (multiple file reads)
- **With cache**: Second access ~0ms (in-memory)

## Testing Strategy

### Unit Tests

```typescript
describe('resolveConfigPath', () => {
  it('resolves relative paths', () => {
    const resolved = resolveConfigPath('./base.json', '/path/to/dir');
    expect(resolved).toBe('/path/to/base.json');
  });

  it('resolves node_modules packages', () => {
    const resolved = resolveConfigPath('claudelint-config-standard', '/path');
    expect(resolved).toContain('node_modules/claudelint-config-standard');
  });

  it('throws on missing file', () => {
    expect(() => {
      resolveConfigPath('./missing.json', '/path');
    }).toThrow(ConfigError);
  });
});

describe('loadConfigWithExtends', () => {
  it('loads single extend', () => {
    // Test fixture with base.json and child.json
    const config = loadConfigWithExtends('/fixtures/child.json');
    expect(config.rules).toMatchObject({
      'size-error': 'error', // From base
      'size-warning': 'off'  // From child
    });
  });

  it('detects circular dependencies', () => {
    expect(() => {
      loadConfigWithExtends('/fixtures/circular-a.json');
    }).toThrow(/Circular dependency/);
  });

  it('merges multiple extends in order', () => {
    const config = loadConfigWithExtends('/fixtures/multi-extend.json');
    // Verify merge order
  });
});
```

### Integration Tests

```typescript
describe('extends with validation', () => {
  it('validates with inherited config', async () => {
    // Fixture monorepo with root config and package configs
    const linter = new ClaudeLint({
      cwd: '/fixtures/monorepo/packages/app-1'
    });

    const results = await linter.lintFiles(['CLAUDE.md']);

    // Should use rules from root config
    expect(results[0].messages).toHaveLength(0);
  });
});
```

## Shareable Config Packages

### Creating a Shareable Config

```json
// @acme/claudelint-config/package.json
{
  "name": "@acme/claudelint-config",
  "version": "1.0.0",
  "main": "index.json",
  "files": ["index.json", "strict.json"]
}

// @acme/claudelint-config/index.json
{
  "rules": {
    "skill-missing-changelog": "warn",
    "size-warning": "warn"
  }
}

// @acme/claudelint-config/strict.json
{
  "extends": "./index.json",
  "rules": {
    "skill-missing-changelog": "error",
    "size-warning": "error"
  }
}
```

### Using a Shareable Config

```bash
# Install the config package
npm install --save-dev @acme/claudelint-config
```

```json
// .claudelintrc.json
{
  "extends": "@acme/claudelint-config"
}

// Or use the strict variant
{
  "extends": "@acme/claudelint-config/strict"
}
```

## Migration Guide

### Before (Duplicated Configs)

```text
monorepo/
├── packages/
│   ├── app-1/
│   │   └── .claudelintrc.json  # Duplicated rules
│   └── app-2/
│       └── .claudelintrc.json  # Duplicated rules
```

### After (With Extends)

```text
monorepo/
├── .claudelintrc.json          # Shared rules
├── packages/
│   ├── app-1/
│   │   └── .claudelintrc.json  # { "extends": "../../.claudelintrc.json" }
│   └── app-2/
│       └── .claudelintrc.json  # { "extends": "../../.claudelintrc.json" }
```

## Future Enhancements

Possible future additions (not in scope for this project):

1. **Preset configs**: `"extends": "claudelint:recommended"`
2. **Remote configs**: `"extends": "https://example.com/config.json"`
3. **Glob patterns**: `"extends": "./configs/*.json"`
4. **Conditional extends**: Based on env vars or package type

## References

- [ESLint Config Cascade](https://eslint.org/docs/latest/use/configure/configuration-files)
- [TSConfig Extends](https://www.typescriptlang.org/tsconfig#extends)
- [Prettier Config Sharing](https://prettier.io/docs/en/configuration.html#sharing-configurations)
