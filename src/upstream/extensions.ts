/**
 * Values claudelint models that the official docs do not document.
 *
 * The conformance check fails on any modeled-but-undocumented value NOT listed here.
 * Adding an entry requires writing down why it exists, which is what makes a
 * hallucinated value visible rather than silently permanent.
 *
 * Key format: "<SchemaName>.<value>".
 *
 * v1 scope: the conformance check consults `HooksConfigSchema.*` keys only. Field-level
 * conformance is deliberately out of scope (see docs/projects/upstream-watch.md,
 * "Scope in v1"), so do NOT seed this with schema-field entries - an entry no consumer
 * reads is worse than no entry, because it implies a guard that does not exist.
 *
 * Empty today: all 30 modeled hook events are documented upstream.
 */
export const KNOWN_EXTENSIONS: Record<string, string> = {};
