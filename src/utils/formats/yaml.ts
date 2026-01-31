import yaml from 'js-yaml';

/**
 * Parse YAML string to object
 */
export function parseYaml<T = unknown>(content: string): T {
  try {
    return yaml.load(content) as T;
  } catch (error) {
    throw new Error(
      `Failed to parse YAML: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Validate YAML syntax without parsing to object
 */
export function isValidYaml(content: string): boolean {
  try {
    yaml.load(content);
    return true;
  } catch {
    return false;
  }
}

/**
 * Stringify object to YAML
 */
export function stringifyYaml(obj: unknown): string {
  return yaml.dump(obj);
}
