import * as yaml from 'js-yaml';

// Keep the version 4 document model: YAML 1.2 scalars plus dates, binary data,
// merge keys, and the legacy collection representations used by existing callers.
const legacySetTag = yaml.defineMappingTag('tag:yaml.org,2002:set', {
  ...yaml.legacyMapTag,
  identify: () => false,
  addPair: (map, key, value) =>
    value === null ? yaml.legacyMapTag.addPair(map, key, value) : 'set values must be null',
});
const legacyIntTag = yaml.defineScalarTag('tag:yaml.org,2002:int', {
  ...yaml.intCoreTag,
  // Version 4 also resolved binary and signed base-prefixed integers implicitly.
  resolve: (source, _isExplicit, tagName) => yaml.intCoreTag.resolve(source, true, tagName),
});
const documentSchema = yaml.CORE_SCHEMA.withTags(
  legacyIntTag,
  yaml.timestampTag,
  yaml.binaryTag,
  yaml.mergeTag,
  yaml.omapTag,
  yaml.pairsTag,
  yaml.legacyMapTag,
  legacySetTag
);

/**
 * Load one document while preserving the established js-yaml 4 value semantics.
 */
export function loadYamlDocument(content: string): unknown {
  const documents = yaml.loadAll(content, { schema: documentSchema });
  if (documents.length > 1) {
    throw new yaml.YAMLException('expected a single document in the stream, but found more');
  }
  if (documents.length === 0) {
    // Empty streams were undefined; comment-only documents were null.
    return /^[ \r\n\ufeff]*$/.test(content) ? undefined : null;
  }
  return documents[0];
}

/**
 * Parse YAML string to object
 */
export function parseYaml<T = unknown>(content: string): T {
  try {
    return loadYamlDocument(content) as T;
  } catch (error) {
    throw new Error(
      `Failed to parse YAML: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error }
    );
  }
}

/**
 * Validate YAML syntax without parsing to object
 */
export function isValidYaml(content: string): boolean {
  try {
    loadYamlDocument(content);
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
