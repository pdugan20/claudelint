import { isAbsolute, relative, resolve } from 'path';
import { minimatch } from 'minimatch';
import type { ClaudeLintConfig, ConfigOverride } from './types';

// Keep source locations internal; they must not leak into serialized public configuration.
const directories = new WeakMap<ClaudeLintConfig, string>();

export function setConfigDirectory(config: ClaudeLintConfig, directory: string): ClaudeLintConfig {
  directories.set(config, resolve(directory));
  return config;
}

export function getConfigDirectory(config: ClaudeLintConfig): string {
  return directories.get(config) ?? process.cwd();
}

/** Match configuration-relative paths, including Claude's hidden directories. */
export function matchesOverride(
  config: ClaudeLintConfig,
  override: ConfigOverride,
  filePath: string
): boolean {
  const absolutePath = resolve(filePath);
  const relativePath = relative(getConfigDirectory(config), absolutePath).replace(/\\/g, '/');
  return override.files.some((pattern) => {
    const target = isAbsolute(pattern) ? absolutePath.replace(/\\/g, '/') : relativePath;
    if (minimatch(target, pattern, { dot: true })) return true;
    // Direct validator callers may pass an in-memory config with no source directory.
    // Preserve their existing absolute-path matching; API configs are explicitly rooted.
    return (
      !directories.has(config) &&
      minimatch(absolutePath.replace(/\\/g, '/'), pattern, { dot: true })
    );
  });
}

export function applyOverrides(config: ClaudeLintConfig, filePath: string): ClaudeLintConfig {
  const rules = { ...config.rules };
  for (const override of config.overrides ?? []) {
    if (matchesOverride(config, override, filePath)) Object.assign(rules, override.rules);
  }
  return setConfigDirectory({ ...config, rules }, getConfigDirectory(config));
}
